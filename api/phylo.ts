// Enhanced phylogenetic tree generation pipeline leveraging EMBL-EBI services.
// Supports both the legacy Clustal Omega guide tree workflow and a new
// two-stage Simple Phylogeny (ClustalW neighbour-joining) workflow that
// reuses Clustal Omega for alignment and then computes a refined tree.

const CLUSTAL_BASE_URL = 'https://www.ebi.ac.uk/Tools/services/rest/clustalo';
const SIMPLE_PHYLOGENY_BASE_URL = 'https://www.ebi.ac.uk/Tools/services/rest/simple_phylogeny';
const CONTACT_EMAIL = process.env.EBI_CONTACT_EMAIL || 'hariom.ae-219@andc.du.ac.in';

const DEFAULT_TIMEOUT = 45000;

type SimpleStage = 'alignment' | 'tree';
interface SimplePhylogenyState {
    version: 1;
    method: 'simple_phylogeny';
    stage: SimpleStage;
    clustalJobId: string;
    simpleJobId?: string;
}

type PhyloMethod = 'clustalo' | 'simple_phylogeny';

type PhyloStatus = 'RUNNING' | 'FINISHED' | 'FAILURE' | 'PENDING';

type ProgressEnvelope = {
    status: PhyloStatus;
    jobId?: string;
    service?: PhyloMethod;
    stage?: SimpleStage | 'tree';
    externalService?: PhyloMethod;
    externalId?: string;
    externalUrl?: string;
    alignmentJobId?: string;
    treeJobId?: string;
    result?: string;
    message?: string;
};

const encodeSimpleState = (state: SimplePhylogenyState): string => {
    return Buffer.from(JSON.stringify(state)).toString('base64url');
};

const decodeSimpleState = (token: string): SimplePhylogenyState | null => {
    try {
        const raw = Buffer.from(token, 'base64url').toString('utf8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.method === 'simple_phylogeny' && parsed.version === 1) {
            return parsed as SimplePhylogenyState;
        }
    } catch (error) {
        // Token was not a simple phylogeny state; fall back to legacy behavior.
    }
    return null;
};

const fetchWithTimeout = async (url: string, init: RequestInit = {}, timeout = DEFAULT_TIMEOUT) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        return await fetch(url, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(id);
    }
};

const submitClustalJob = async (fasta: string): Promise<string> => {
    const params = new URLSearchParams();
    params.append('sequence', fasta.endsWith('\n') ? fasta : `${fasta}\n`);
    params.append('email', CONTACT_EMAIL);

    const response = await fetchWithTimeout(`${CLUSTAL_BASE_URL}/run`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'text/plain',
        },
        body: params.toString(),
    });

    const body = (await response.text()).trim();
    if (!response.ok) {
        throw new Error(`EMBL-EBI Clustal Omega submission failed: ${body || response.statusText}`);
    }
    if (!body) {
        throw new Error('Clustal Omega submission did not return a job identifier.');
    }
    return body;
};

const submitSimplePhylogenyJob = async (alignment: string): Promise<string> => {
    const params = new URLSearchParams();
    params.append('sequence', alignment.endsWith('\n') ? alignment : `${alignment}\n`);
    params.append('email', CONTACT_EMAIL);
    params.append('tree', 'phylip');
    params.append('clustering', 'Neighbour-joining');
    params.append('kimura', 'false');

    const response = await fetchWithTimeout(`${SIMPLE_PHYLOGENY_BASE_URL}/run`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'text/plain',
        },
        body: params.toString(),
    });

    const body = (await response.text()).trim();
    if (!response.ok) {
        throw new Error(`EMBL-EBI Simple Phylogeny submission failed: ${body || response.statusText}`);
    }
    if (!body) {
        throw new Error('Simple Phylogeny submission did not return a job identifier.');
    }
    return body;
};

const buildResultUrl = (base: string, jobId: string, type: string) => `${base}/result/${jobId}/${type}`;

const getJobStatus = async (base: string, jobId: string): Promise<PhyloStatus> => {
    const response = await fetchWithTimeout(`${base}/status/${jobId}`, {
        headers: { Accept: 'text/plain' },
    }, 20000);

    if (response.status === 404) {
        return 'PENDING';
    }

    const body = (await response.text()).trim();
    if (!response.ok) {
        throw new Error(`Failed to obtain status for job ${jobId}. EMBL-EBI responded with ${response.status}: ${body || response.statusText}`);
    }

    if (!body) {
        return 'PENDING';
    }
    return body as PhyloStatus;
};

const fetchClustalAlignment = async (jobId: string): Promise<string> => {
    const response = await fetchWithTimeout(buildResultUrl(CLUSTAL_BASE_URL, jobId, 'fa'), {
        headers: { Accept: 'text/plain' },
    });

    const body = await response.text();
    if (!response.ok) {
        throw new Error(`Failed to download Clustal Omega alignment: ${body || response.statusText}`);
    }
    if (!body.trim()) {
        throw new Error('Clustal Omega alignment result was empty.');
    }
    return body;
};

const fetchClustalTree = async (jobId: string): Promise<string> => {
    const response = await fetchWithTimeout(buildResultUrl(CLUSTAL_BASE_URL, jobId, 'phylotree'), {
        headers: { Accept: 'text/plain' },
    });

    const body = await response.text();
    if (!response.ok) {
        throw new Error(`Failed to download Clustal Omega phylogenetic tree: ${body || response.statusText}`);
    }
    if (!body.trim()) {
        throw new Error('Clustal Omega tree output was empty.');
    }
    return body;
};

const fetchSimplePhylogenyTree = async (jobId: string): Promise<string> => {
    const response = await fetchWithTimeout(buildResultUrl(SIMPLE_PHYLOGENY_BASE_URL, jobId, 'tree'), {
        headers: { Accept: 'text/plain' },
    });

    const body = await response.text();
    if (!response.ok) {
        throw new Error(`Failed to download Simple Phylogeny tree: ${body || response.statusText}`);
    }
    if (!body.trim()) {
        throw new Error('Simple Phylogeny tree output was empty.');
    }
    return body;
};

const buildFasta = (sequences: string[]): string => {
    return sequences
        .map((seq, index) => `>seq${index + 1}\n${(seq || '').trim()}`)
        .join('\n');
};

const handleClustalWorkflow = async (jobId: string): Promise<ProgressEnvelope> => {
    const status = await getJobStatus(CLUSTAL_BASE_URL, jobId);

    if (status === 'FINISHED') {
        const tree = await fetchClustalTree(jobId);
        return {
            status: 'FINISHED',
            service: 'clustalo',
            stage: 'tree',
            externalService: 'clustalo',
            externalId: jobId,
            externalUrl: buildResultUrl(CLUSTAL_BASE_URL, jobId, 'phylotree'),
            alignmentJobId: jobId,
            treeJobId: jobId,
            result: tree,
        };
    }

    if (status === 'RUNNING' || status === 'PENDING') {
        return {
            status: 'RUNNING',
            jobId,
            service: 'clustalo',
            stage: 'tree',
            externalService: 'clustalo',
            externalId: jobId,
            externalUrl: buildResultUrl(CLUSTAL_BASE_URL, jobId, 'phylotree'),
            alignmentJobId: jobId,
        };
    }

    return {
        status: 'FAILURE',
        message: `Clustal Omega job failed with status: ${status}`,
    };
};

const handleSimplePhylogenyWorkflow = async (state: SimplePhylogenyState, token: string): Promise<ProgressEnvelope> => {
    if (state.stage === 'alignment') {
        const status = await getJobStatus(CLUSTAL_BASE_URL, state.clustalJobId);

        if (status === 'FINISHED') {
            const alignment = await fetchClustalAlignment(state.clustalJobId);
            const simpleJobId = await submitSimplePhylogenyJob(alignment);
            const nextState: SimplePhylogenyState = {
                ...state,
                stage: 'tree',
                simpleJobId,
            };
            return {
                status: 'RUNNING',
                jobId: encodeSimpleState(nextState),
                service: 'simple_phylogeny',
                stage: 'tree',
                externalService: 'simple_phylogeny',
                externalId: simpleJobId,
                externalUrl: buildResultUrl(SIMPLE_PHYLOGENY_BASE_URL, simpleJobId, 'tree'),
                alignmentJobId: state.clustalJobId,
                treeJobId: simpleJobId,
            };
        }

        if (status === 'RUNNING' || status === 'PENDING') {
            return {
                status: 'RUNNING',
                jobId: token,
                service: 'simple_phylogeny',
                stage: 'alignment',
                externalService: 'clustalo',
                externalId: state.clustalJobId,
                externalUrl: buildResultUrl(CLUSTAL_BASE_URL, state.clustalJobId, 'fa'),
                alignmentJobId: state.clustalJobId,
            };
        }

        return {
            status: 'FAILURE',
            message: `Clustal Omega alignment failed with status: ${status}`,
        };
    }

    if (state.stage === 'tree') {
        if (!state.simpleJobId) {
            return {
                status: 'FAILURE',
                message: 'Invalid job token: missing Simple Phylogeny job identifier.',
            };
        }

        const status = await getJobStatus(SIMPLE_PHYLOGENY_BASE_URL, state.simpleJobId);

        if (status === 'FINISHED') {
            const tree = await fetchSimplePhylogenyTree(state.simpleJobId);
            return {
                status: 'FINISHED',
                service: 'simple_phylogeny',
                stage: 'tree',
                externalService: 'simple_phylogeny',
                externalId: state.simpleJobId,
                externalUrl: buildResultUrl(SIMPLE_PHYLOGENY_BASE_URL, state.simpleJobId, 'tree'),
                alignmentJobId: state.clustalJobId,
                treeJobId: state.simpleJobId,
                result: tree,
            };
        }

        if (status === 'RUNNING' || status === 'PENDING') {
            return {
                status: 'RUNNING',
                jobId: token,
                service: 'simple_phylogeny',
                stage: 'tree',
                externalService: 'simple_phylogeny',
                externalId: state.simpleJobId,
                externalUrl: buildResultUrl(SIMPLE_PHYLOGENY_BASE_URL, state.simpleJobId, 'tree'),
                alignmentJobId: state.clustalJobId,
                treeJobId: state.simpleJobId,
            };
        }

        return {
            status: 'FAILURE',
            message: `Simple Phylogeny job failed with status: ${status}`,
        };
    }

    return {
        status: 'FAILURE',
        message: 'Unhandled job stage encountered in Simple Phylogeny pipeline.',
    };
};

const normalizeMethod = (rawMethod: unknown): PhyloMethod => {
    if (typeof rawMethod !== 'string') {
        return 'simple_phylogeny';
    }
    const lowered = rawMethod.toLowerCase();
    return lowered === 'clustalo' ? 'clustalo' : 'simple_phylogeny';
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { sequences, jobId, method } = req.body || {};

    try {
        if (jobId) {
            const simpleState = decodeSimpleState(jobId);

            let payload: ProgressEnvelope;
            if (simpleState) {
                payload = await handleSimplePhylogenyWorkflow(simpleState, jobId);
            } else {
                payload = await handleClustalWorkflow(jobId);
            }

            return res.status(200).json(payload);
        }

        if (!Array.isArray(sequences) || sequences.length < 2) {
            return res.status(400).json({ error: 'At least two sequences are required for tree generation.' });
        }

        const methodToUse = normalizeMethod(method);
        const fasta = buildFasta(sequences);

        if (methodToUse === 'clustalo') {
            const clustalJobId = await submitClustalJob(fasta);
            return res.status(202).json({
                jobId: clustalJobId,
                service: 'clustalo',
                stage: 'tree',
                externalService: 'clustalo',
                externalId: clustalJobId,
                externalUrl: buildResultUrl(CLUSTAL_BASE_URL, clustalJobId, 'phylotree'),
                alignmentJobId: clustalJobId,
            });
        }

        const clustalJobId = await submitClustalJob(fasta);
        const initialState: SimplePhylogenyState = {
            version: 1,
            method: 'simple_phylogeny',
            stage: 'alignment',
            clustalJobId,
        };
        return res.status(202).json({
            jobId: encodeSimpleState(initialState),
            service: 'simple_phylogeny',
            stage: 'alignment',
            externalService: 'clustalo',
            externalId: clustalJobId,
            externalUrl: buildResultUrl(CLUSTAL_BASE_URL, clustalJobId, 'fa'),
            alignmentJobId: clustalJobId,
        });
    } catch (error: any) {
        console.error('Phylo API Error:', error);
        return res.status(500).json({ error: error.message || 'An unknown error occurred.' });
    }
}
