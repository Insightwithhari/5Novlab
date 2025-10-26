// This is a Vercel Serverless Function to run Multiple Sequence Alignments via EMBL-EBI API.
// It is designed to work asynchronously to handle long-running jobs.

// Mode 1: POST with `sequences` -> Submits job, returns `jobId`.
// Mode 2: POST with `jobId` -> Checks status, returns status or final results.

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { sequences, jobId } = req.body;

    try {
        if (jobId) {
            // --- POLLING LOGIC ---
            const statusResponse = await fetch(`https://www.ebi.ac.uk/Tools/services/rest/clustalo/status/${jobId}`);
            if (!statusResponse.ok) {
                if (statusResponse.status === 404) return res.status(200).json({ status: 'RUNNING' });
                throw new Error(`Failed to get job status. EBI API responded with status ${statusResponse.status}`);
            }
            const status = await statusResponse.text();

            if (status === 'FINISHED') {
                const resultResponse = await fetch(`https://www.ebi.ac.uk/Tools/services/rest/clustalo/result/${jobId}/aln-clustal_num`);
                if (!resultResponse.ok) {
                    throw new Error(`Failed to fetch results: ${await resultResponse.text()}`);
                }
                const alignmentText = await resultResponse.text();
                return res.status(200).json({ status: 'FINISHED', result: alignmentText });

            } else if (status === 'RUNNING' || status === 'PENDING') {
                return res.status(200).json({ status: 'RUNNING' });
            } else { // ERROR, FAILURE, etc.
                return res.status(200).json({ status: 'FAILURE', message: `Job failed with status: ${status}` });
            }

        } else if (sequences) {
            // --- SUBMISSION LOGIC ---
            if (!Array.isArray(sequences) || sequences.length < 2) {
                 return res.status(400).json({ error: 'At least two sequences are required for MSA.' });
            }

            // Format sequences into a single FASTA string
            const fastaSequences = sequences.map((seq, index) => `>seq${index + 1}\n${seq}`).join('\n');

            const params = new URLSearchParams();
            params.append('program', 'clustalo');
            params.append('sequence', fastaSequences);
            params.append('email', 'hariom.ae-219@andc.du.ac.in'); // A valid email is required by the API.

            const submitResponse = await fetch('https://www.ebi.ac.uk/Tools/services/rest/clustalo/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'text/plain' },
                body: params.toString()
            });

            if (!submitResponse.ok) {
                throw new Error(`EBI job submission failed: ${await submitResponse.text()}`);
            }
            const newJobId = await submitResponse.text();
            
            return res.status(202).json({ jobId: newJobId });
        } else {
            return res.status(400).json({ error: 'Request must include either sequences or a jobId.' });
        }
    } catch (error: any) {
        console.error('MSA API Error:', error);
        return res.status(500).json({ error: error.message || 'An unknown error occurred.' });
    }
}
