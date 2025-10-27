import React, { useMemo, useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { BlastHit, BlastAlignmentToken } from '../types';

interface BlastViewerProps {
  data: BlastHit[];
}

const downloadCSV = (hits: BlastHit[]) => {
  if (typeof window === 'undefined' || !hits.length) return;
  const header = ['accession', 'description', 'score', 'e_value', 'identity', 'query_coverage'];
  const rows = hits.map(hit => {
    const accession = hit.accession ?? '';
    const description = `"${(hit.description ?? '').replace(/"/g, '""')}"`;
    const score = hit.score !== undefined ? String(hit.score) : '';
    const eValue = hit.e_value !== undefined ? String(hit.e_value) : '';
    const identity = hit.identity !== undefined ? (hit.identity * 100).toFixed(2) : '';
    const coverage = hit.queryCoverage !== undefined ? (hit.queryCoverage * 100).toFixed(2) : '';
    return [accession, description, score, eValue, identity, coverage].join(',');
  });
  const csv = `${header.join(',')}\n${rows.join('\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'blast_results.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const downloadHitFasta = (hit: BlastHit) => {
  if (typeof window === 'undefined') return;
  const sequence = (hit.sequence || hit.alignment || '').trim();
  if (!sequence) return;
  const fasta = `>${hit.accession ?? 'unknown'} ${hit.description ?? ''}\n${sequence}\n`;
  const blob = new Blob([fasta], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${hit.accession ?? 'blast_hit'}.fasta`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const downloadFastaAll = (hits: BlastHit[]) => {
  if (typeof window === 'undefined') return;
  const sequences = hits
    .map(hit => {
      const sequence = (hit.sequence || hit.alignment || '').trim();
      if (!sequence) return null;
      return `>${hit.accession ?? 'unknown'} ${hit.description ?? ''}\n${sequence}\n`;
    })
    .filter((chunk): chunk is string => Boolean(chunk));

  if (!sequences.length) return;

  const blob = new Blob([sequences.join('\n')], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'blast_results.fasta';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.warn('Clipboard copy failed', error);
  }
};

const formatPercent = (value?: number) => (value !== undefined ? `${(value * 100).toFixed(1)}%` : 'N/A');
const formatScoreValue = (value?: number) => (value !== undefined ? value.toFixed(1) : 'N/A');

const chunkTokens = (tokens: BlastAlignmentToken[], size = 60) => {
  const chunks: BlastAlignmentToken[][] = [];
  for (let index = 0; index < tokens.length; index += size) {
    chunks.push(tokens.slice(index, index + size));
  }
  return chunks;
};

const alignmentStateClasses: Record<string, string> = {
  match: 'bg-emerald-100/70 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100',
  positive: 'bg-sky-100/80 text-sky-900 dark:bg-sky-900/40 dark:text-sky-100',
  mismatch: 'bg-rose-100 text-rose-900 dark:bg-rose-900/50 dark:text-rose-100',
  gap: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
};

const alignmentStateLabels: Record<string, string> = {
  match: 'Exact match',
  positive: 'Conservative substitution',
  mismatch: 'Mismatch',
  gap: 'Gap',
};

const midlineSymbolForState = (state: string) => {
  switch (state) {
    case 'match':
      return '|';
    case 'positive':
      return '+';
    case 'gap':
      return ' ';
    default:
      return '·';
  }
};

const formatRangeLabel = (start?: number, end?: number) => {
  if (start !== undefined && end !== undefined) {
    return start === end ? `${start}` : `${start}-${end}`;
  }
  if (start !== undefined) return `${start}`;
  if (end !== undefined) return `${end}`;
  return '—';
};

const AlignmentViewer: React.FC<{ tokens: BlastAlignmentToken[] }> = ({ tokens }) => {
  const chunks = useMemo(() => chunkTokens(tokens, 60), [tokens]);

  if (!tokens.length) return null;

  return (
    <div className="mt-2 space-y-2">
      {chunks.map((chunk, index) => {
        const queryStart = chunk.find(token => token.queryPosition !== undefined)?.queryPosition;
        const queryEnd = [...chunk]
          .reverse()
          .find(token => token.queryPosition !== undefined)?.queryPosition;
        const subjectStart = chunk.find(token => token.subjectPosition !== undefined)?.subjectPosition;
        const subjectEnd = [...chunk]
          .reverse()
          .find(token => token.subjectPosition !== undefined)?.subjectPosition;

        return (
          <div
            key={`alignment-chunk-${index}`}
            className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/40 shadow-sm"
          >
            <div className="overflow-x-auto">
              <div className="min-w-[420px] px-2 py-2 space-y-1">
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-700 dark:text-slate-200">
                  <span className="w-20 text-right text-slate-500 dark:text-slate-400 select-none">Q {formatRangeLabel(queryStart, queryEnd)}</span>
                  <div className="flex">
                    {chunk.map((token, tokenIdx) => {
                      const stateClass = alignmentStateClasses[token.state] ?? '';
                      const label = alignmentStateLabels[token.state] ?? 'Residue';
                      const tooltip = `${label}: ${token.queryResidue}${
                        token.queryPosition !== undefined ? ` (pos ${token.queryPosition})` : ''
                      }`;
                      return (
                        <span
                          key={`query-${tokenIdx}`}
                          className={`inline-flex items-center justify-center w-4 h-5 rounded-sm border border-transparent ${stateClass}`}
                          title={tooltip}
                        >
                          {token.queryResidue}
                        </span>
                      );
                    })}
                  </div>
                  <span className="w-12 text-left text-slate-500 dark:text-slate-400 select-none">{queryEnd ?? ''}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="w-20" />
                  <div className="flex">
                    {chunk.map((token, tokenIdx) => (
                      <span
                        key={`mid-${tokenIdx}`}
                        className="inline-flex items-center justify-center w-4 h-4"
                      >
                        {midlineSymbolForState(token.state)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-700 dark:text-slate-200">
                  <span className="w-20 text-right text-slate-500 dark:text-slate-400 select-none">S {formatRangeLabel(subjectStart, subjectEnd)}</span>
                  <div className="flex">
                    {chunk.map((token, tokenIdx) => {
                      const stateClass = alignmentStateClasses[token.state] ?? '';
                      const label = alignmentStateLabels[token.state] ?? 'Residue';
                      const tooltip = `${label}: ${token.subjectResidue}${
                        token.subjectPosition !== undefined ? ` (pos ${token.subjectPosition})` : ''
                      }`;
                      return (
                        <span
                          key={`subject-${tokenIdx}`}
                          className={`inline-flex items-center justify-center w-4 h-5 rounded-sm border border-transparent ${stateClass}`}
                          title={tooltip}
                        >
                          {token.subjectResidue}
                        </span>
                      );
                    })}
                  </div>
                  <span className="w-12 text-left text-slate-500 dark:text-slate-400 select-none">{subjectEnd ?? ''}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const EnhancedTable: React.FC<{ data: BlastHit[] }> = ({ data }) => {
  const [query, setQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalizedQuery) return data;
    return data.filter(hit => {
      const accession = (hit.accession ?? '').toLowerCase();
      const description = (hit.description ?? '').toLowerCase();
      return accession.includes(normalizedQuery) || description.includes(normalizedQuery);
    });
  }, [data, normalizedQuery]);

  const summary = useMemo(() => {
    if (!filtered.length) return null;

  let bestScore: number | undefined;
  let lowestScore: number | undefined;
  let scoreSum = 0;
  let scoreCount = 0;
  let bestIdentity: number | undefined;
  let identitySum = 0;
  let identityCount = 0;
  let bestCoverage: number | undefined;
  let coverageSum = 0;
  let coverageCount = 0;
    let bestEValueNumeric: number | undefined;
    let bestEValueLabel: string | number | undefined;
    const organismCounts = new Map<string, number>();

    filtered.forEach(hit => {
      if (typeof hit.score === 'number') {
        bestScore = bestScore === undefined ? hit.score : Math.max(bestScore, hit.score);
        lowestScore = lowestScore === undefined ? hit.score : Math.min(lowestScore, hit.score);
        scoreSum += hit.score;
        scoreCount += 1;
      }

      if (typeof hit.identity === 'number') {
        identitySum += hit.identity;
        identityCount += 1;
        if (bestIdentity === undefined || hit.identity > bestIdentity) {
          bestIdentity = hit.identity;
        }
      }

      if (typeof hit.queryCoverage === 'number') {
        coverageSum += hit.queryCoverage;
        coverageCount += 1;
        if (bestCoverage === undefined || hit.queryCoverage > bestCoverage) {
          bestCoverage = hit.queryCoverage;
        }
      }

      if (hit.e_value !== undefined) {
        const numeric = typeof hit.e_value === 'number' ? hit.e_value : Number(hit.e_value);
        if (!Number.isNaN(numeric)) {
          if (bestEValueNumeric === undefined || numeric < bestEValueNumeric) {
            bestEValueNumeric = numeric;
            bestEValueLabel = hit.e_value;
          }
        }
      }

      if (hit.description) {
        const match = hit.description.match(/OS=([^=]+?) OX=/);
        if (match?.[1]) {
          const name = match[1].trim();
          organismCounts.set(name, (organismCounts.get(name) ?? 0) + 1);
        }
      }
    });

  const avgIdentity = identityCount ? identitySum / identityCount : undefined;
  const avgCoverage = coverageCount ? coverageSum / coverageCount : undefined;
  const avgScore = scoreCount ? scoreSum / scoreCount : undefined;
    const topSpecies = Array.from(organismCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      bestScore,
      bestIdentity,
      avgIdentity,
      bestEValue: bestEValueLabel,
      speciesCount: organismCounts.size,
      topSpecies,
      identityCount,
      hitCount: filtered.length,
      bestCoverage,
      avgCoverage,
      lowestScore,
      avgScore,
    };
  }, [filtered]);

  const hasAnySequence = useMemo(
    () => filtered.some(hit => Boolean((hit.sequence || hit.alignment || '').trim())),
    [filtered]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const clampedPage = Math.min(page, pageCount - 1);
  const pageStart = clampedPage * rowsPerPage;
  const pageItems = filtered.slice(pageStart, pageStart + rowsPerPage);

  const toggleRow = (id: string) => {
    setExpanded(current => ({ ...current, [id]: !current[id] }));
  };

  return (
    <div>
      {summary ? (
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Quality overview
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Metrics reflect {summary.hitCount} filtered hit{summary.hitCount === 1 ? '' : 's'}.
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 shadow-sm">
              <div className="text-[11px] uppercase text-slate-500 dark:text-slate-400">Top identity</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {formatPercent(summary.bestIdentity)}
              </div>
              {summary.bestEValue ? (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Best e-value {summary.bestEValue}</div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">No e-value reported</div>
              )}
              {summary.bestCoverage !== undefined ? (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Best query cov. {formatPercent(summary.bestCoverage)}
                </div>
              ) : null}
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 shadow-sm">
              <div className="text-[11px] uppercase text-slate-500 dark:text-slate-400">Average identity</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {formatPercent(summary.avgIdentity)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {summary.identityCount
                  ? `${summary.identityCount} hit${summary.identityCount === 1 ? '' : 's'} with identity scores`
                  : 'Identity metrics unavailable'}
              </div>
              {summary.avgCoverage !== undefined ? (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Avg query cov. {formatPercent(summary.avgCoverage)}
                </div>
              ) : null}
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 shadow-sm">
              <div className="text-[11px] uppercase text-slate-500 dark:text-slate-400">Score landscape</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {formatScoreValue(summary.bestScore)}
              </div>
              {summary.lowestScore !== undefined ? (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Range {formatScoreValue(summary.lowestScore)} – {formatScoreValue(summary.bestScore)}
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Higher scores indicate closer matches</div>
              )}
              {summary.avgScore !== undefined ? (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Average {formatScoreValue(summary.avgScore)}</div>
              ) : null}
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 shadow-sm">
              <div className="text-[11px] uppercase text-slate-500 dark:text-slate-400">Unique organisms</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {summary.speciesCount > 0 ? summary.speciesCount : 'N/A'}
              </div>
              {summary.topSpecies.length ? (
                <div className="flex flex-wrap gap-1 mt-2">
                  {summary.topSpecies.map(([name, count]) => (
                    <span
                      key={name}
                      className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300"
                      title={`${count} hit${count === 1 ? '' : 's'} from ${name}`}
                      aria-label={`${count} hit${count === 1 ? '' : 's'} from ${name}`}
                    >
                      {name} ({count})
                    </span>
                  ))}
                  {summary.speciesCount > summary.topSpecies.length ? (
                    <span
                      className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300"
                      title={`${summary.speciesCount - summary.topSpecies.length} additional species present in the results`}
                      aria-label={`${summary.speciesCount - summary.topSpecies.length} additional species present in the results`}
                    >
                      +{summary.speciesCount - summary.topSpecies.length} more
                    </span>
                  ) : null}
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">No organism metadata detected</div>
              )}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Hover to see hit counts per organism.</div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={event => {
              setQuery(event.target.value);
              setPage(0);
            }}
            placeholder="Filter accession or description"
            className="px-2 py-1 text-sm rounded border bg-slate-50 dark:bg-slate-900"
          />
          <select
            value={rowsPerPage}
            onChange={event => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
            className="px-2 py-1 text-sm rounded border bg-slate-50 dark:bg-slate-900"
          >
            {[10, 25, 50, 100].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <button
            onClick={() => downloadCSV(filtered)}
            className="px-3 py-1 text-xs font-medium text-white bg-slate-700 hover:bg-slate-600 rounded"
            type="button"
          >
            Download CSV
          </button>
          <button
            onClick={() => downloadFastaAll(filtered)}
            className="px-3 py-1 text-xs font-medium border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
            type="button"
            disabled={!hasAnySequence}
            title={
              hasAnySequence
                ? 'Download FASTA for hits that include sequence data'
                : 'No sequence data available to export'
            }
          >
            Download FASTA
          </button>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {filtered.length} hit{filtered.length === 1 ? '' : 's'} match the current filter
        </div>
      </div>

      <div className="overflow-x-auto border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-slate-200 dark:bg-slate-700 text-left">
            <tr>
              <th className="p-2">Accession</th>
              <th className="p-2">Description</th>
              <th className="p-2 text-right">Score</th>
              <th className="p-2 text-right">E-value</th>
              <th className="p-2">Identity</th>
              <th className="p-2">Query cov.</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  No hits match your filter.
                </td>
              </tr>
            )}
            {pageItems.map(hit => {
              const accession = hit.accession ?? 'unknown';
              const isExpanded = expanded[accession] ?? false;
              const scoreLabel = typeof hit.score === 'number' ? hit.score.toFixed(1) : hit.score ?? '--';
              const eValueLabel = hit.e_value ?? '--';
              const identityValue =
                typeof hit.identity === 'number' ? Math.max(0, Math.min(1, hit.identity)) : undefined;
              const identityWidth = identityValue !== undefined ? Math.round(identityValue * 100) : 0;
              const coverageValue =
                typeof hit.queryCoverage === 'number' ? Math.max(0, Math.min(1, hit.queryCoverage)) : undefined;
              const coverageWidth = coverageValue !== undefined ? Math.round(coverageValue * 100) : 0;

              return (
                <React.Fragment key={accession}>
                  <tr className="border-t hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-2 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://www.uniprot.org/uniprotkb/${accession}/entry`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--primary-color)] hover:underline"
                        >
                          {accession}
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(accession)}
                          className="px-2 py-1 text-[11px] border rounded bg-white dark:bg-slate-900"
                          title="Copy accession to clipboard"
                          aria-label={`Copy accession ${accession}`}
                        >
                          Copy
                        </button>
                      </div>
                    </td>
                    <td className="p-2">{hit.description ?? '--'}</td>
                    <td className="p-2 text-right whitespace-nowrap">{scoreLabel}</td>
                    <td className="p-2 text-right whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{eValueLabel}</span>
                    </td>
                    <td className="p-2 min-w-[130px]">
                      {identityValue !== undefined ? (
                        <div className="space-y-1">
                          <div className="text-xs font-medium">{formatPercent(identityValue)}</div>
                          <div className="h-2 rounded bg-slate-200 dark:bg-slate-800">
                            <div
                              className="h-full rounded transition-[width] duration-300 ease-out"
                              style={{ width: `${identityWidth}%`, background: 'var(--primary-color)' }}
                            />
                          </div>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="p-2 min-w-[130px]">
                      {coverageValue !== undefined ? (
                        <div className="space-y-1">
                          <div className="text-xs font-medium">{formatPercent(coverageValue)}</div>
                          <div className="h-2 rounded bg-slate-200 dark:bg-slate-800">
                            <div
                              className="h-full rounded transition-[width] duration-300 ease-out"
                              style={{ width: `${coverageWidth}%`, background: 'var(--primary-color)' }}
                            />
                          </div>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleRow(accession)}
                          className="px-2 py-1 text-xs border rounded bg-white dark:bg-slate-900"
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? 'Hide details' : 'Details'}
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadHitFasta(hit)}
                          className="px-2 py-1 text-xs border rounded bg-white dark:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={!hit.sequence && !hit.alignment}
                          title={
                            !hit.sequence && !hit.alignment
                              ? 'No FASTA sequence available for this hit'
                              : 'Download FASTA for this hit'
                          }
                        >
                          FASTA
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-slate-50/80 dark:bg-slate-900/70">
                      <td colSpan={7} className="p-3 text-xs text-slate-600 dark:text-slate-300">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-4">
                            <span>
                              <strong>Length:</strong> {hit.length ?? '--'}
                            </span>
                            <span>
                              <strong>Query coverage:</strong> {formatPercent(hit.queryCoverage)}
                            </span>
                            <span>
                              <strong>Organism:</strong> {hit.organism ?? '--'}
                            </span>
                          </div>
                          {hit.alignmentTokens && hit.alignmentTokens.length ? (
                            <div>
                              <strong>Alignment preview:</strong>
                              <AlignmentViewer tokens={hit.alignmentTokens} />
                              {hit.alignment ? (
                                <details className="mt-2 text-slate-500 dark:text-slate-400">
                                  <summary className="cursor-pointer text-xs underline">View raw alignment text</summary>
                                  <pre className="mt-1 max-h-48 overflow-auto bg-white dark:bg-slate-950 p-2 border rounded font-mono text-[11px]">
                                    {hit.alignment}
                                  </pre>
                                </details>
                              ) : null}
                            </div>
                          ) : hit.alignment || hit.sequence ? (
                            <div>
                              <strong>Sequence snippet:</strong>
                              <pre className="mt-1 max-h-48 overflow-auto bg-white dark:bg-slate-950 p-2 border rounded font-mono text-[11px]">
                                {hit.alignment || hit.sequence}
                              </pre>
                            </div>
                          ) : (
                            <div className="text-slate-500 dark:text-slate-400">No sequence preview available.</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-slate-600 dark:text-slate-400">
        <span>
          Showing {pageItems.length} of {filtered.length} hit{filtered.length === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage(Math.max(0, clampedPage - 1))}
            className="px-2 py-1 border rounded bg-white dark:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={clampedPage === 0}
          >
            Prev
          </button>
          <span>
            {clampedPage + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage(Math.min(pageCount - 1, clampedPage + 1))}
            className="px-2 py-1 border rounded bg-white dark:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={clampedPage >= pageCount - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const BlastViewer: React.FC<BlastViewerProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-sm text-[var(--muted-foreground-color)]">
        No BLAST hits to display.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end gap-1 mb-3" aria-hidden="true">
        <button className="px-3 py-1 text-xs rounded-full bg-slate-700 text-white" type="button">
          Table
        </button>
        <button
          className="px-3 py-1 text-xs rounded-full bg-slate-200 text-slate-500 cursor-not-allowed"
          type="button"
          title="Chart view disabled to prevent crashes"
          disabled
          aria-disabled="true"
        >
          Chart
        </button>
      </div>
      <ErrorBoundary fallback={<div className="p-4 text-sm text-red-600">Could not render BLAST results.</div>}>
        <EnhancedTable data={data} />
      </ErrorBoundary>
    </div>
  );
};

export default BlastViewer;
