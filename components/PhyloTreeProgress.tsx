import React from 'react';

type Status = 'submitting' | 'polling' | 'error';

interface PhyloTreeProgressProps {
    status: Status;
    jobId?: string | null;
    errorMessage?: string | null;
}

const statusMessages: Record<Status, string> = {
    submitting: 'Submitting sequences to EMBL-EBI for tree generation...',
    polling: 'Generating phylogenetic tree (this may take a few minutes)...',
    error: 'An error occurred during tree generation.'
};

const PhyloTreeProgress: React.FC<PhyloTreeProgressProps> = ({ status, jobId, errorMessage }) => {
    return (
        <div className="mt-2 p-4 bg-[var(--input-background-color)] rounded-lg border border-[var(--border-color)]">
            <h3 className="text-lg font-semibold primary-text pb-2 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                 </svg>
                Phylogenetic Tree Generation
            </h3>
            <div className="mt-2">
                 <div className="flex items-start gap-3 text-sm text-[var(--muted-foreground-color)] p-2 bg-[var(--card-background-color)] rounded-md">
                    {status !== 'error' && (
                         <svg className="animate-spin h-5 w-5 primary-text shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    <div>
                        <p className="font-semibold text-[var(--foreground-color)]">{statusMessages[status]}</p>
                        {jobId && (
                            <p className="text-xs text-[var(--muted-foreground-color)] mt-1">
                                Job ID:
                                <a 
                                    href={`https://www.ebi.ac.uk/Tools/services/rest/clustalo/result/${jobId}/phylotree`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ml-1 font-mono primary-text hover:underline"
                                >
                                    {jobId}
                                </a>
                            </p>
                        )}
                    </div>
                 </div>

                {status === 'error' && errorMessage && (
                    <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-500/50 rounded-md">
                        <strong>Error:</strong> {errorMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhyloTreeProgress;
