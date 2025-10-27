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
                const queryLengthRaw = resultsJson.query_len;
                const queryLength = typeof queryLengthRaw === 'number' ? queryLengthRaw : Number(queryLengthRaw);
                const MAX_HITS = 100;

                if (!hits || !Array.isArray(hits)) {
                    return res.status(200).json({ status: 'FINISHED', results: [] });
                }

                const formattedHits = hits
                    .slice(0, MAX_HITS)
                    .map((hit: any) => {
                        if (!Array.isArray(hit.hit_hsps) || hit.hit_hsps.length === 0) return null;
                        const hsp = hit.hit_hsps[0];

                        if (
                            hsp.hsp_bit_score === undefined ||
                            hsp.hsp_expect === undefined ||
                            hsp.hsp_identity === undefined ||
                            !hit.hit_acc
                        ) {
                            console.warn('Skipping malformed BLAST hit due to missing fields:', hit.hit_acc);
                            return null;
                        }

                        const score = Number.parseFloat(hsp.hsp_bit_score);
                        const identityPercent = Number.parseFloat(hsp.hsp_identity);
                        const alignLength = typeof hsp.hsp_align_len === 'number' ? hsp.hsp_align_len : Number(hsp.hsp_align_len);
                        const coverageFraction =
                            typeof queryLength === 'number' && queryLength > 0 && Number.isFinite(alignLength)
                                ? Math.min(1, Math.max(0, alignLength / queryLength))
                                : undefined;

                        const querySeqRaw = typeof hsp.hsp_qseq === 'string' ? hsp.hsp_qseq : undefined;
                        const midlineSeqRaw = typeof hsp.hsp_mseq === 'string' ? hsp.hsp_mseq : undefined;
                        const subjectSeqRaw = typeof hsp.hsp_hseq === 'string' ? hsp.hsp_hseq : undefined;

                        const sanitizeSequence = (value?: string) => (value ? value.replace(/\s+/g, '') : undefined);

                        const querySeq = sanitizeSequence(querySeqRaw);
                        const midlineSeq = sanitizeSequence(midlineSeqRaw);
                        const subjectSeq = sanitizeSequence(subjectSeqRaw);

                        const toNumber = (value: any) => {
                            const parsed = Number(value);
                            return Number.isFinite(parsed) ? parsed : undefined;
                        };

                        const queryFrom = toNumber(hsp.hsp_query_from);
                        const queryTo = toNumber(hsp.hsp_query_to);
                        const subjectFrom = toNumber(hsp.hsp_hit_from);
                        const subjectTo = toNumber(hsp.hsp_hit_to);

                        let alignmentTokens;
                        if (querySeq && subjectSeq) {
                            const maxLen = Math.min(querySeq.length, subjectSeq.length, midlineSeq ? midlineSeq.length : querySeq.length);
                            let queryCursor = queryFrom;
                            let subjectCursor = subjectFrom;
                            alignmentTokens = [] as any[];

                            for (let i = 0; i < maxLen; i += 1) {
                                const queryResidue = querySeq[i] ?? ' '; // fallback to preserve length
                                const subjectResidue = subjectSeq[i] ?? ' ';
                                const midlineResidue = midlineSeq ? midlineSeq[i] ?? ' ' : ' ';

                                let state: 'match' | 'positive' | 'mismatch' | 'gap';
                                if (queryResidue === '-' || subjectResidue === '-') {
                                    state = 'gap';
                                } else if (midlineResidue === '+') {
                                    state = 'positive';
                                } else if (queryResidue === subjectResidue) {
                                    state = 'match';
                                } else {
                                    state = 'mismatch';
                                }

                                const token: any = {
                                    queryResidue,
                                    subjectResidue,
                                    state,
                                    midline: midlineResidue,
                                };

                                if (queryResidue !== '-' && queryCursor !== undefined) {
                                    token.queryPosition = queryCursor;
                                    queryCursor += 1;
                                }

                                if (subjectResidue !== '-' && subjectCursor !== undefined) {
                                    token.subjectPosition = subjectCursor;
                                    subjectCursor += 1;
                                }

                                alignmentTokens.push(token);
                            }
                        }

                        const alignmentLines: string[] = [];
                        if (querySeq) {
                            const range = queryFrom !== undefined && queryTo !== undefined
                                ? `Query ${queryFrom}-${queryTo}:`
                                : 'Query:';
                            alignmentLines.push(`${range} ${querySeq}`.trim());
                        }
                        if (midlineSeq) {
                            alignmentLines.push(`Match: ${midlineSeq}`);
                        }
                        if (subjectSeq) {
                            const range = subjectFrom !== undefined && subjectTo !== undefined
                                ? `Subject ${subjectFrom}-${subjectTo}:`
                                : 'Subject:';
                            alignmentLines.push(`${range} ${subjectSeq}`.trim());
                        }

                        const alignment = alignmentLines.length ? alignmentLines.join('\n') : undefined;
                        const sequence = subjectSeq ? subjectSeq.replace(/[-\s]/g, '') : undefined;
                        const lengthValue =
                            typeof hit.hit_len === 'number' ? hit.hit_len : Number.isFinite(Number(hit.hit_len)) ? Number(hit.hit_len) : undefined;

                        return {
                            accession: hit.hit_acc,
                            description: hit.hit_desc,
                            score: Number.isFinite(score) ? score : undefined,
                            e_value: hsp.hsp_expect,
                            identity: Number.isFinite(identityPercent) ? identityPercent / 100 : undefined,
                            queryCoverage: coverageFraction,
                            coverage: coverageFraction,
                            length: lengthValue,
                            organism: hit.hit_os ?? hit.hit_uni_os ?? undefined,
                            alignment,
                            sequence,
                            alignmentTokens,
                            alignmentRange: {
                                queryFrom,
                                queryTo,
                                subjectFrom,
                                subjectTo,
                            },
                        };
                    })
                    .filter(Boolean);



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
