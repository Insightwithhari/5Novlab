// This is a Vercel Serverless Function to fetch protein sequences from UniProt.
// It takes a protein name, finds the best UniProt ID, and returns its sequence.

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { proteinName } = req.body;

    if (typeof proteinName !== 'string' || proteinName.trim().length === 0) {
        return res.status(400).json({ error: 'A valid protein name is required.' });
    }

    try {
        const ORGANISM_MAP: Record<string, number> = {
            'human': 9606,
            'homo sapiens': 9606,
            'mouse': 10090,
            'mus musculus': 10090,
            'rat': 10116,
            'rattus norvegicus': 10116,
            'zebrafish': 7955,
            'danio rerio': 7955,
            'drosophila': 7227,
            'fruit fly': 7227,
            'drosophila melanogaster': 7227,
            'e. coli': 83333,
            'escherichia coli': 83333,
            'yeast': 4932,
            'saccharomyces cerevisiae': 4932,
        };

        let proteinSearchTerm = proteinName;
        let organismFilter = '';
        const lowerProteinName = proteinName.toLowerCase();

        // Find if an organism is mentioned and build a filter
        for (const [name, taxId] of Object.entries(ORGANISM_MAP)) {
            if (lowerProteinName.includes(name)) {
                organismFilter = `AND (organism_id:${taxId})`;
                // Remove the organism name from the search term to increase precision
                proteinSearchTerm = proteinSearchTerm.replace(new RegExp(`\\b${name}\\b`, 'i'), '').trim();
                break; // Stop after finding the first match
            }
        }

        // If removing the organism left the search term empty, revert to the original name
        if (!proteinSearchTerm) {
            proteinSearchTerm = proteinName;
        }

        // Construct a precise query that searches specific fields.
        const searchQuery = `(protein_name:"${proteinSearchTerm}" OR gene:"${proteinSearchTerm}") ${organismFilter} AND (reviewed:true)`;
        const searchUrl = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(searchQuery)}&fields=accession,protein_name,organism_name&size=1`;
        
        const searchResponse = await fetch(searchUrl, {
            headers: { 'Accept': 'application/json' }
        });

        if (!searchResponse.ok) {
            throw new Error(`UniProt search failed with status: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();
        
        if (!searchData.results || searchData.results.length === 0) {
            return res.status(404).json({ error: `No reviewed UniProt entry found for "${proteinName}". Try a more specific name.` });
        }

        const entry = searchData.results[0];
        const accession = entry.primaryAccession;
        const proteinDesc = entry.proteinDescription;
        const fetchedProteinName = proteinDesc?.recommendedName?.fullName?.value || proteinDesc?.submissionNames?.[0]?.fullName?.value || 'Unknown Protein';
        const organismName = entry.organism.scientificName;

        // Step 2: Fetch the FASTA sequence for the accession ID.
        const fastaUrl = `https://www.uniprot.org/uniprotkb/${accession}.fasta`;
        const fastaResponse = await fetch(fastaUrl);

        if (!fastaResponse.ok) {
            throw new Error(`Failed to fetch FASTA sequence for ${accession}. Status: ${fastaResponse.status}`);
        }

        const fastaText = await fastaResponse.text();

        // Step 3: Parse the FASTA text to extract the sequence.
        const sequence = fastaText.split('\n').slice(1).join('');

        if (!sequence) {
             throw new Error(`Could not parse sequence from FASTA for ${accession}.`);
        }

        // Step 4: Return the data.
        return res.status(200).json({
            accession,
            proteinName: fetchedProteinName,
            organismName,
            sequence
        });

    } catch (error: any) {
        console.error('UniProt API Error:', error);
        return res.status(500).json({ error: error.message || 'An unknown error occurred.' });
    }
}
