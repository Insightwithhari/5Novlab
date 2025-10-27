import React, { useMemo, useState } from 'react';

type SeqObj = { name: string; sequence: string };
type AlignmentProp = SeqObj[] | string[] | { sequences: SeqObj[] } | any;

interface MSAViewerProps {
  alignment: AlignmentProp;
  lineWidth?: number;
}

const AA_CLASS = (aa: string) => {
  if (!aa || aa === '-') return 'gap';
  const c = aa.toUpperCase();
  if ('DE'.includes(c)) return 'acidic';
  if ('KRH'.includes(c)) return 'basic';
  if ('STNQ'.includes(c)) return 'polar';
  if ('FWY'.includes(c)) return 'aromatic';
  if ('GCAPVLIM'.includes(c)) return 'hydrophobic';
  return 'other';
};

const COLOR_MAP: Record<string, string> = {
  gap: 'text-slate-400 bg-slate-800',
  acidic: 'text-[#fff7ed] bg-[#ef4444]/80',
  basic: 'text-[#001219] bg-[#60a5fa]/90',
  polar: 'text-[#001219] bg-[#a3e635]/90',
  aromatic: 'text-[#001219] bg-[#fbbf24]/90',
  hydrophobic: 'text-[#001219] bg-[#f97316]/90',
  other: 'text-[#001219] bg-[#94a3b8]/80',
};

const parseFasta = (text: string) => {
  const seqs: Record<string,string> = {};
  const lines = text.split(/\r?\n/);
  let current = '';
  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.startsWith('>')) {
      current = line.slice(1).trim() || `seq${Object.keys(seqs).length + 1}`;
      seqs[current] = seqs[current] || '';
    } else if (current) {
      seqs[current] = (seqs[current] || '') + line.trim();
    }
  }
  return Object.keys(seqs).map((k) => ({ name: k, sequence: seqs[k] }));
};

const parseClustal = (text: string) => {
  const seqs: Record<string,string> = {};
  const order: string[] = [];
  const lines = text.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.replace(/\t+/g, ' ').trimRight();
    if (!line.trim()) continue;
    if (/^CLUSTAL/i.test(line)) continue; // header
    // skip consensus annotation lines containing only '*', ':', '.' or spaces
    if (/^[\s\*:\.]+$/.test(line)) continue;
    // lines like: "seq1    MKTIIIAALALAVFATGDV" possibly with trailing numbers
    const m = line.match(/^(\S+)\s+([A-Za-z\-\.\*]+)(?:\s+\d+)?\s*$/);
    if (m) {
      const name = m[1];
      const block = m[2];
      if (!Object.prototype.hasOwnProperty.call(seqs, name)) {
        seqs[name] = '';
        order.push(name);
      }
      seqs[name] += block;
    }
  }
  return order.map((n) => ({ name: n, sequence: seqs[n] }));
};

const seqsFromProp = (alignment: AlignmentProp): SeqObj[] => {
  if (!alignment) return [];
  // If alignment is a raw string (CLUSTAL or FASTA)
  if (typeof alignment === 'string') {
    const txt = alignment.trim();
    if (!txt) return [];
    if (/^>/m.test(txt)) return parseFasta(txt);
    if (/^CLUSTAL/m.test(txt) || /^[A-Za-z0-9_\-]+\s+[A-Za-z\-\.\*]+/m.test(txt)) return parseClustal(txt);
    return [];
  }

  // If alignment is an object containing a `result` string (from /api/msa)
  if (typeof alignment === 'object' && alignment !== null && typeof (alignment as any).result === 'string') {
    return seqsFromProp((alignment as any).result);
  }

  // Some services return an object like { result: { alignment: 'CLUSTAL...' } }
  if (typeof alignment === 'object' && alignment !== null && typeof (alignment as any).result === 'object') {
    const r = (alignment as any).result;
    if (typeof r.alignment === 'string') return seqsFromProp(r.alignment);
    if (typeof r.output === 'string') return seqsFromProp(r.output);
    if (typeof r.clustal === 'string') return seqsFromProp(r.clustal);
  }

  // array of strings or objects
  if (Array.isArray(alignment)) {
    if (alignment.length === 0) return [];
    if (typeof alignment[0] === 'string') {
      return (alignment as string[]).map((s, i) => ({ name: `seq${i + 1}`, sequence: s }));
    }
    if ((alignment[0] as any).sequence) return alignment as SeqObj[];
  }

  if ((alignment as any).sequences && Array.isArray((alignment as any).sequences)) {
    return (alignment as any).sequences;
  }

  return [];
};

const computeConsensus = (seqs: SeqObj[]) => {
  if (seqs.length === 0) return '';
  // determine max length and treat missing positions as gaps
  const L = Math.max(...seqs.map(s => s.sequence.length));
  let cons = '';
  for (let i = 0; i < L; i++) {
    const counts: Record<string, number> = {};
    for (const s of seqs) {
      const c = s.sequence[i] ?? '-';
      if (c === '-') continue;
      counts[c] = (counts[c] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    cons += sorted.length ? sorted[0][0] : '-';
  }
  return cons;
};

const conservationAt = (seqs: SeqObj[], pos: number) => {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const s of seqs) {
    const c = s.sequence[pos] ?? '-';
    if (c === '-') continue;
    counts[c] = (counts[c] || 0) + 1;
    total++;
  }
  if (total === 0) return 0;
  const best = Math.max(...Object.values(counts));
  return Math.round((best / total) * 100);
};

const formatFasta = (seqs: SeqObj[]) => seqs.map(s => `>${s.name}\n${s.sequence}`).join('\n');

const MSAViewer: React.FC<MSAViewerProps> = ({ alignment, lineWidth = 80 }) => {
  const rawSeqs = useMemo(() => seqsFromProp(alignment), [alignment]);
  // normalize lengths (pad shorter sequences with gaps) so visualization is stable
  const seqs = useMemo(() => {
    if (!rawSeqs || rawSeqs.length === 0) {
      if (alignment) {
        // small debug to help trace why viewer is empty for certain payloads
        try {
          // avoid huge dumps
          const preview = typeof alignment === 'string' ? alignment.slice(0, 300) : JSON.stringify(Object.keys(alignment || {})).slice(0, 300);
          // eslint-disable-next-line no-console
          console.debug('[MSAViewer] parsed 0 sequences from alignment prop — preview:', preview);
        } catch (e) {
          // ignore
        }
      }
      return [];
    }
    const maxLen = Math.max(...rawSeqs.map(s => s.sequence.length));
    return rawSeqs.map(s => ({ ...s, sequence: s.sequence.padEnd(maxLen, '-') }));
  }, [rawSeqs, alignment]);

  const consensus = useMemo(() => computeConsensus(seqs), [seqs]);
  const [wrapWidth, setWrapWidth] = useState<number>(lineWidth);
  const [showNumbers, setShowNumbers] = useState<boolean>(true);

  if (seqs.length === 0) return <div className="text-sm text-slate-400">No alignment to display.</div>;

  const L = seqs[0].sequence.length;

  const handleDownloadFasta = () => {
    const blob = new Blob([formatFasta(seqs)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'msa.fasta';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatFasta(seqs));
      // minimal feedback: briefly show a success style
      // (feedback could be improved with toasts)
    } catch (e) {
      // ignore
    }
  };

  const blocks = [];
  for (let start = 0; start < L; start += wrapWidth) {
    const end = Math.min(L, start + wrapWidth);
    blocks.push({ start, end });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button onClick={handleDownloadFasta} className="px-3 py-1 text-xs rounded-md bg-slate-700 text-white hover:bg-slate-600">Download FASTA</button>
          <button onClick={handleCopy} className="px-3 py-1 text-xs rounded-md bg-slate-700 text-white hover:bg-slate-600">Copy FASTA</button>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <label className="flex items-center gap-2">
            <span>Wrap</span>
            <input type="number" min={20} max={200} value={wrapWidth} onChange={(e) => setWrapWidth(Math.max(20, Math.min(200, Number(e.target.value) || 80)))} className="w-16 text-xs px-2 py-1 rounded bg-slate-800 text-white" />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showNumbers} onChange={() => setShowNumbers(!showNumbers)} />
            <span>Numbers</span>
          </label>
        </div>
      </div>

      <div className="bg-[var(--input-background-color)] border border-[var(--border-color)] rounded-lg p-3 overflow-auto">
        {blocks.map(({ start, end }) => (
          <div key={start} className="mb-3">
            {/* consensus */}
            <div className="flex items-center gap-3 mb-1">
              <div className="w-20 text-xs text-slate-400 font-medium">CONS</div>
              <pre className="whitespace-pre text-xs leading-5 overflow-auto" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace' }}>
                {Array.from(consensus.slice(start, end)).map((ch, i) => {
                  const pos = start + i;
                  const cls = AA_CLASS(ch);
                  const color = COLOR_MAP[cls] || COLOR_MAP.other;
                  const consScore = conservationAt(seqs, pos);
                  const border = consScore >= 80 ? 'ring-2 ring-amber-400/40 rounded-sm' : '';
                  return (
                    <span
                      key={pos}
                      title={`pos ${pos + 1}\n${ch}  — conservation ${consScore}%`}
                      className={`px-[2px] ${color} ${border}`}
                    >
                      {ch}
                    </span>
                  );
                })}
              </pre>
            </div>

            {/* sequences */}
            {seqs.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-20 text-xs font-semibold text-slate-200">{s.name}</div>
                <pre className="whitespace-pre text-xs leading-5 overflow-auto" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace' }}>
                  {Array.from(s.sequence.slice(start, end)).map((ch, i) => {
                    const pos = start + i;
                    const cls = AA_CLASS(ch);
                    const color = COLOR_MAP[cls] || COLOR_MAP.other;
                    const consCh = consensus[pos];
                    const match = ch === consCh && ch !== '-';
                    const opacity = ch === '-' ? 'opacity-60' : '';
                    const extra = match ? 'ring-1 ring-green-300/20 rounded-sm' : '';
                    const title = showNumbers ? `pos ${pos + 1}\n${ch}` : undefined;
                    return (
                      <span key={pos} title={title} className={`px-[2px] ${color} ${opacity} ${extra}`}>
                        {ch}
                      </span>
                    );
                  })}
                </pre>
              </div>
            ))}

            {/* ruler: render per-residue spans so numbers align under residues */}
            <div className="flex items-center gap-3 mt-2">
              <div className="w-20 text-xs text-slate-500">{/* spacer */}</div>
              <div className="text-xs text-slate-400" style={{ fontFamily: 'ui-monospace' }}>
                {showNumbers && (
                  <div className="inline-block">
                    {Array.from({ length: end - start }).map((_, i) => {
                      const pos = start + i + 1;
                      const label = (pos % 10 === 0) ? String(pos) : (pos % 5 === 0 ? '·' : '');
                      return (
                        <span key={i} className="inline-block px-[2px] text-center" style={{ width: 16 }}>
                          {label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MSAViewer;
