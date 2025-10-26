import React, { useState } from 'react';
import { ClipboardDocumentIcon, CheckIcon } from './icons';

interface SequenceViewerProps {
    accession: string;
    proteinName: string;
    organismName: string;
    sequence: string;
}

const SequenceViewer: React.FC<SequenceViewerProps> = ({ accession, proteinName, organismName, sequence }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(sequence);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatSequence = (seq: string) => {
        const lines = [];
        for (let i = 0; i < seq.length; i += 60) {
            const line = seq.substring(i, i + 60);
            const formattedLine = line.replace(/(.{10})/g, '$1 ').trim();
            lines.push({ number: i + 1, sequence: formattedLine });
        }
        return lines;
    };

    const formatted = formatSequence(sequence);

    return (
        <div className="mt-2 p-4 bg-[var(--input-background-color)] rounded-lg border border-[var(--border-color)]">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-md text-[var(--card-foreground-color)]">{proteinName}</h3>
                    <p className="text-sm text-[var(--muted-foreground-color)]">
                        <a href={`https://www.uniprot.org/uniprotkb/${accession}/entry`} target="_blank" rel="noopener noreferrer" className="primary-text hover:underline font-mono">{accession}</a>
                        <span className="italic ml-2">({organismName})</span>
                    </p>
                </div>
                <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--card-background-color)] border border-[var(--border-color)] rounded-md hover:bg-[var(--border-color)] transition-colors">
                    {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <div className="mt-4 p-3 bg-[var(--card-background-color)] rounded-md font-mono text-xs overflow-x-auto max-h-60">
                <table className="w-full">
                    <tbody>
                        {formatted.map(({ number, sequence: lineSequence }) => (
                            <tr key={number}>
                                <td className="pr-4 text-right text-slate-400 dark:text-slate-500 select-none sticky left-0 bg-[var(--card-background-color)]">{number}</td>
                                <td>{lineSequence}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-right text-xs text-slate-500 mt-1">Length: {sequence.length} amino acids</p>
        </div>
    );
};

export default SequenceViewer;
