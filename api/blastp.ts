// This is a Vercel Serverless Function to run BLASTp searches via EMBL-EBI API.
// It is designed to work asynchronously to handle long-running jobs.

// Mode 1: POST with `sequence` -> Submits job, returns `jobId`.
// Mode 2: POST with `jobId` -> Checks status, returns status or final results.

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { sequence, jobId } = req.body;

    try {
        if (jobId) {
            // --- POLLING LOGIC ---
            const statusResponse = await fetch(`https://www.ebi.ac.uk/Tools/services/rest/ncbiblast/status/${jobId}`);
            if (!statusResponse.ok) {
                // If the job is not found, it might still be initializing. Treat as running.
                if (statusResponse.status === 404) {
                    return res.status(200).json({ status: 'RUNNING' });
                }
                throw new Error(`Failed to get job status. EBI API responded with status ${statusResponse.status}`);
            }
            const status = await statusResponse.text();

            if (status === 'FINISHED') {
                const resultResponse = await fetch(`https://www.ebi.ac.uk/Tools/services/rest/ncbiblast/result/${jobId}/json`);
                if (!resultResponse.ok) {
                    throw new Error(`Failed to fetch results: ${await resultResponse.text()}`);
                }
                const resultsJson = await resultResponse.json();
                
                // FIX: Correctly access the 'hits' array, which is at the top level of the JSON response.
                const hits = resultsJson.hits;

                if (!hits || !Array.isArray(hits)) {
                    return res.status(200).json({ status: 'FINISHED', results: [] });
                }

              const formattedHits = hits.slice(0, 10).map((hit: any) => {
    if (!hit.hit_hsps || hit.hit_hsps.length === 0) return null;
    const hsp = hit.hit_hsps[0];

    // Defensive check for required fields from the EBI JSON structure
    if (hsp.hsp_bit_score === undefined || hsp.hsp_expect === undefined || hsp.hsp_identity === undefined) {
        console.warn('Skipping malformed BLAST hit due to missing fields:', hit.hit_acc);
        return null;
    }

    return {
        accession: hit.hit_acc,
        description: hit.hit_desc,
        score: parseFloat(hsp.hsp_bit_score),
        e_value: hsp.hsp_expect,
        identity: parseFloat(hsp.hsp_identity) / 100,
    };
}).filter(Boolean); // Filters out any nulls from malformed hits



                return res.status(200).json({ status: 'FINISHED', results: formattedHits });

            } else if (status === 'RUNNING' || status === 'PENDING') {
                return res.status(200).json({ status: 'RUNNING' });
            } else { // ERROR, FAILURE, etc.
                return res.status(200).json({ status: 'FAILURE', message: `Job failed with status: ${status}` });
            }

        } else if (sequence) {
            // --- SUBMISSION LOGIC ---
            if (typeof sequence !== 'string' || sequence.length === 0) {
                 return res.status(400).json({ error: 'A valid protein sequence is required.' });
            }
            const params = new URLSearchParams();
            params.append('program', 'blastp');
            params.append('stype', 'protein');
            params.append('database', 'uniprotkb');
            params.append('sequence', sequence);
            params.append('email', 'hariom.ae-219@andc.du.ac.in'); // A valid email is required by the API.

            const submitResponse = await fetch('https://www.ebi.ac.uk/Tools/services/rest/ncbiblast/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'text/plain' },
                body: params.toString()
            });

            if (!submitResponse.ok) {
                throw new Error(`EBI job submission failed: ${await submitResponse.text()}`);
            }
            const newJobId = await submitResponse.text();

            // Return 202 Accepted with the jobId for the client to start polling
            return res.status(202).json({ jobId: newJobId });
        } else {
            return res.status(400).json({ error: 'Request must include either a sequence or a jobId.' });
        }
    } catch (error: any) {
        console.error('BLASTp API Error:', error);
        return res.status(500).json({ error: error.message || 'An unknown error occurred.' });
    }
}
