import React, { useState } from 'react';
import { ClipboardDocumentIcon, CheckIcon } from './icons';

interface PhyloTreeViewerProps {
    treeData: string; // Newick format string
}

const PhyloTreeViewer: React.FC<PhyloTreeViewerProps> = ({ treeData }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(treeData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mt-2 p-4 bg-[var(--input-background-color)] rounded-lg border border-[var(--border-color)]">
            <div className="flex justify-between items-center mb-2">
                 <h3 className="font-bold text-md text-[var(--card-foreground-color)]">Phylogenetic Tree</h3>
                 <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--card-background-color)] border border-[var(--border-color)] rounded-md hover:bg-[var(--border-color)] transition-colors">
                    {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Data'}
                </button>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-md text-xs mb-2">
                <p>This is a phylogenetic tree in Newick format. You can copy this data and paste it into a visualization tool like <a href="https://itol.embl.de/" target="_blank" rel="noopener noreferrer" className="primary-text font-semibold hover:underline">iTOL</a> or <a href="http://etetoolkit.org/treeview/" target="_blank" rel="noopener noreferrer" className="primary-text font-semibold hover:underline">ETE Tree Viewer</a> to see the graphical representation.</p>
            </div>
            <pre className="p-3 bg-[var(--card-background-color)] rounded-md font-mono text-xs overflow-x-auto max-h-60">
                {treeData}
            </pre>
        </div>
    );
};

export default PhyloTreeViewer;
