import React, { useState, useMemo } from 'react';
import type { BlastHit } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'https://esm.sh/recharts@2.12.7';
import ErrorBoundary from './ErrorBoundary';
import { ExclamationTriangleIcon } from './icons';

interface BlastViewerProps {
  data: BlastHit[];
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: BlastHit & { shortDescription: string } }>;
    label?: string | number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const identityPercent = typeof data.identity === 'number' && !isNaN(data.identity)
      ? (data.identity * 100).toFixed(1)
      : 'N/A';
      
    return (
      <div className="p-2 bg-slate-700 text-white rounded-md shadow-lg border border-slate-600 text-sm">
        <p className="font-bold max-w-xs truncate">{data.description}</p>
        <p className="primary-text">{`Score: ${data.score}`}</p>
        <p>{`E-value: ${data.e_value}`}</p>
        <p>{`Identity: ${identityPercent}%`}</p>
      </div>
    );
  }
  return null;
};

const BlastChart: React.FC<{ data: BlastHit[] }> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-center text-sm text-[var(--muted-foreground-color)]">
                No BLAST hits to display in chart.
            </div>
        );
    }
    
    const chartData = data.map(hit => ({
        ...hit,
        shortDescription: hit.description.length > 30 ? `${hit.description.substring(0, 30)}...` : hit.description,
    }));

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                    <XAxis type="number" />
                    <YAxis dataKey="shortDescription" type="category" width={150} tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="score" fill="var(--primary-color)" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const SortableTable: React.FC<{ data: BlastHit[] }> = ({ data }) => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof BlastHit; direction: 'asc' | 'desc' } | null>({ key: 'score', direction: 'desc' });

    const sortedData = useMemo(() => {
        let sortableData = [...data];
        if (sortConfig !== null) {
            sortableData.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableData;
    }, [data, sortConfig]);

    const requestSort = (key: keyof BlastHit) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: keyof BlastHit) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    };

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-center text-sm text-[var(--muted-foreground-color)]">
                No BLAST hits to display in table.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-200 dark:bg-slate-700">
                    <tr>
                        <th className="p-2 cursor-pointer" onClick={() => requestSort('accession')}>Accession{getSortIndicator('accession')}</th>
                        <th className="p-2">Description</th>
                        <th className="p-2 cursor-pointer" onClick={() => requestSort('score')}>Score{getSortIndicator('score')}</th>
                        <th className="p-2 cursor-pointer" onClick={() => requestSort('e_value')}>E-value{getSortIndicator('e_value')}</th>
                        <th className="p-2 cursor-pointer" onClick={() => requestSort('identity')}>Identity{getSortIndicator('identity')}</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((hit) => (
                        <tr key={hit.accession} className="border-b border-[var(--border-color)]">
                            <td className="p-2 font-mono">
                                <a href={`https://www.uniprot.org/uniprotkb/${hit.accession}/entry`} target="_blank" rel="noopener noreferrer" className="primary-text hover:underline">
                                    {hit.accession}
                                </a>
                            </td>
                            <td className="p-2">{hit.description}</td>
                            <td className="p-2">{hit.score}</td>
                            <td className="p-2">{hit.e_value}</td>
                            <td className="p-2">{(hit.identity * 100).toFixed(1)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const BlastViewer: React.FC<BlastViewerProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  
  const ChartFallback = (
    <div className="flex flex-col items-center justify-center h-[300px] text-center text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
        <ExclamationTriangleIcon className="w-8 h-8 mb-2" />
        <p className="font-semibold">Could not render chart.</p>
        <p className="text-xs text-red-400">The data might be malformed. Please try the table view.</p>
    </div>
  );

  return (
    <div>
      <div className="flex justify-end gap-1 mb-2">
        <button 
            onClick={() => setViewMode('chart')} 
            className={`px-3 py-1 text-xs rounded-full ${viewMode === 'chart' ? 'primary-bg text-white' : 'bg-slate-200 dark:bg-slate-600'}`}
            aria-label="Switch to chart view"
        >
            Chart
        </button>
        <button 
            onClick={() => setViewMode('table')} 
            className={`px-3 py-1 text-xs rounded-full ${viewMode === 'table' ? 'primary-bg text-white' : 'bg-slate-200 dark:bg-slate-600'}`}
            aria-label="Switch to table view"
        >
            Table
        </button>
      </div>
      {viewMode === 'chart' ? (
        <ErrorBoundary fallback={ChartFallback}>
            <BlastChart data={data} />
        </ErrorBoundary>
      ) : (
        <SortableTable data={data} />
      )}
    </div>
  );
};

export default BlastViewer;
