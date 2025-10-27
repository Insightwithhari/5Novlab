import React, { useEffect, useRef, useState } from 'react';
import { DownloadIcon, WhatsAppIcon } from './icons';

declare const $3Dmol: any;

interface PDBViewerProps {
  pdbId?: string;
  uniprotId?: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelayMs?: number;
}

// Helper to fetch with a timeout and light retry support so larger AlphaFold files have time to stream
const fetchWithTimeout = async (
  resource: RequestInfo,
  options: FetchWithTimeoutOptions = {}
) => {
  const { timeout = 45000, retries = 1, retryDelayMs = 1000, ...fetchOptions } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(resource, {
        ...fetchOptions,
        signal: controller.signal,
      });

      if (!response.ok && attempt < retries) {
        const retryableStatus = response.status === 408 || response.status === 429 || response.status >= 500;
        if (retryableStatus) {
          await delay(retryDelayMs * (attempt + 1));
          continue;
        }
      }

      return response;
    } catch (error: any) {
      const isAbortError = error && typeof error === 'object' && error.name === 'AbortError';
      const isNetworkError = error instanceof TypeError;

      if (attempt < retries && (isAbortError || isNetworkError)) {
        await delay(retryDelayMs * (attempt + 1));
        continue;
      }

      throw error;
    } finally {
      clearTimeout(id);
    }
  }

  throw new Error('fetchWithTimeout exhausted retries without returning a response.');
};


const PDBViewer: React.FC<PDBViewerProps> = ({ pdbId, uniprotId }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [structureInfo, setStructureInfo] = useState<{
    downloadUrl: string;
    shareUrl: string;
    downloadFileName: string;
    displayId: string;
    sourceName: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    let viewerInstance: any = null;

    const resetViewer = () => {
      if (viewerInstance) {
        try {
          viewerInstance.removeAllModels();
          viewerInstance.clear();
        } catch (viewerError) {
          console.warn('3Dmol reset failed:', viewerError);
        }
        viewerInstance = null;
      }
      if (viewerRef.current) {
        viewerRef.current.innerHTML = '';
      }
    };

    const loadStructure = async () => {
      setIsLoading(true);
      setError(null);
      setStructureInfo(null);
      resetViewer();

      if (!viewerRef.current) return;

      viewerInstance = $3Dmol.createViewer(
        viewerRef.current,
        { backgroundColor: 'transparent' }
      );

      try {
        if (pdbId) {
          const info = {
            fetchUrl: `https://files.rcsb.org/view/${pdbId}.pdb`,
            downloadUrl: `https://files.rcsb.org/view/${pdbId}.pdb`,
            shareUrl: `https://www.rcsb.org/structure/${pdbId}`,
            downloadFileName: `${pdbId}.pdb`,
            displayId: pdbId,
            sourceName: 'RCSB PDB',
          };
          setStructureInfo(info);

          const pdbResponse = await fetchWithTimeout(info.fetchUrl, {
            timeout: 45000,
            retries: 2,
            retryDelayMs: 1500,
          });
          if (!pdbResponse.ok) {
            throw new Error(`Failed to fetch PDB data for ${pdbId}. Status: ${pdbResponse.status}`);
          }
          const pdbData = await pdbResponse.text();
          if (!isMounted) return;
          viewerInstance.addModel(pdbData, 'pdb');
        } else if (uniprotId) {
          const apiResponse = await fetchWithTimeout(`https://alphafold.ebi.ac.uk/api/prediction/${uniprotId}`, {
            timeout: 20000,
            retries: 2,
            retryDelayMs: 1200,
          });
          if (!apiResponse.ok) {
            if (apiResponse.status === 404) {
              throw new Error(`No AlphaFold prediction found for UniProt ID: ${uniprotId}. The ID might be incorrect or reference a protein not modeled by AlphaFold.`);
            }
            throw new Error(`Failed to fetch AlphaFold metadata. Status: ${apiResponse.status} ${apiResponse.statusText}`);
          }
          const data = await apiResponse.json();

          const entries = Array.isArray(data) ? data.filter(entry => entry && entry.pdbUrl && entry.uniprotStart && entry.uniprotEnd) : [];
          if (entries.length === 0) {
            throw new Error(`No valid AlphaFold prediction entries with PDB URLs found for UniProt ID: ${uniprotId}.`);
          }

          let bestEntry = entries[0];
          let displayIdSuffix = '';

          if (entries.length > 1) {
            // When multiple fragments are returned, select the longest one as a proxy for the most significant domain.
            entries.sort((a, b) => {
              const lengthA = (a.uniprotEnd || 0) - (a.uniprotStart || 0);
              const lengthB = (b.uniprotEnd || 0) - (b.uniprotStart || 0);
              return lengthB - lengthA; // Sort descending by length
            });
            bestEntry = entries[0];
            displayIdSuffix = ` (longest of ${entries.length} fragments)`;
          }

          const info = {
            downloadUrl: bestEntry.pdbUrl,
            shareUrl: `https://alphafold.ebi.ac.uk/entry/${bestEntry.uniprotAccession || uniprotId}`,
            downloadFileName: `AF-${uniprotId}.pdb`,
            displayId: uniprotId + displayIdSuffix,
            sourceName: 'AlphaFold DB',
          };
          if (!isMounted) return;
          setStructureInfo(info);

          const pdbResponse = await fetchWithTimeout(bestEntry.pdbUrl, {
            timeout: 60000,
            retries: 2,
            retryDelayMs: 1500,
          });
          if (!pdbResponse.ok) {
            throw new Error(`Failed to fetch PDB data from ${bestEntry.pdbUrl}. Status: ${pdbResponse.status}`);
          }
          const pdbData = await pdbResponse.text();

          if (!isMounted) return;
          viewerInstance.addModel(pdbData, 'pdb');
        } else {
          throw new Error('No PDB ID or UniProt ID was provided to the viewer.');
        }

        if (!isMounted) return;
        viewerInstance.setStyle({}, { cartoon: { color: 'spectrum' } });
        viewerInstance.zoomTo();
        viewerInstance.render(() => {
          if (viewerInstance && typeof viewerInstance.zoom === 'function') {
            viewerInstance.zoom(0.8);
          }
        });
      } catch (err: any) {
        console.error('Structure fetch error:', err);
        if (isMounted) {
          if (err.name === 'AbortError') {
            setError('The request to AlphaFold timed out. The server may be busy or down. Please try again later.');
          } else {
            setError(err.message || 'An unknown error occurred while loading the structure.');
          }
        }
        resetViewer();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadStructure();

    return () => {
      isMounted = false;
      resetViewer();
    };
  }, [pdbId, uniprotId]);
  
  const handleDownload = () => {
    if (!structureInfo) return;
    fetch(structureInfo.downloadUrl)
      .then(res => res.text())
      .then(data => {
        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = structureInfo.downloadFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch(err => console.error("Download error:", err));
  };

  const handleWhatsAppShare = () => {
    if (!structureInfo) return;
    const text = `Check out this protein structure from ${structureInfo.sourceName}: ${structureInfo.displayId}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${structureInfo.shareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="mt-4 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-black min-h-[400px] w-full max-w-2xl relative">
      {isLoading && <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-70 z-10">Loading 3D View...</div>}
      {error && <div className="absolute inset-0 flex items-center justify-center text-red-400 p-4 text-center z-10">{error}</div>}
      <div ref={viewerRef} style={{ width: '100%', height: '400px', position: 'relative' }} />
      {!isLoading && !error && structureInfo && (
        <div className="absolute top-2 right-2 flex gap-2 z-10">
            <button onClick={handleWhatsAppShare} className="p-2 bg-slate-800/70 text-white rounded-full hover:bg-slate-700 transition-colors" title="Share via WhatsApp">
                <WhatsAppIcon className="w-5 h-5" />
            </button>
            <button onClick={handleDownload} className="p-2 bg-slate-800/70 text-white rounded-full hover:bg-slate-700 transition-colors" title="Download PDB file">
                <DownloadIcon />
            </button>
        </div>
      )}
    </div>
  );
};

export default PDBViewer;
