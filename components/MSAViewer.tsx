import React, { useState } from 'react';
import { ClipboardDocumentIcon, CheckIcon } from './icons';

interface MSAViewerProps {
    alignment: string;
}

const MSAViewer: React.FC<MSAViewerProps> = ({ alignment }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(alignment);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mt-2 p-4 bg-[var(--input-background-color)] rounded-lg border border-[var(--border-color)]">
            <div className="flex justify-between items-center mb-2">
                 <h3 className="font-bold text-md text-[var(--card-foreground-color)]">Clustal Omega Alignment</h3>
                 <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--card-background-color)] border border-[var(--border-color)] rounded-md hover:bg-[var(--border-color)] transition-colors">
                    {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="p-3 bg-[var(--card-background-color)] rounded-md font-mono text-xs overflow-x-auto max-h-80">
                {alignment}
            </pre>
        </div>
    );
};

export default MSAViewer;
