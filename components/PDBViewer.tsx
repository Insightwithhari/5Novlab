import React, { useCallback, useEffect, useRef, useState } from 'react';
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

interface PdbMetadataCitation {
  title?: string;
  journal?: string;
  year?: number;
  doi?: string;
  pubmedId?: number;
  authors?: string[];
}

interface PdbMetadata {
  pdbId: string;
  title?: string;
  classification?: string;
  depositionDate?: string;
  releaseDate?: string;
  experimentalMethods: string[];
  resolution?: number;
  organisms: string[];
  citation?: PdbMetadataCitation;
}

const pdbMetadataCache = new Map<string, PdbMetadata>();

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

const fetchJsonWithTimeout = async <T,>(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<T> => {
  const response = await fetchWithTimeout(url, options);
  if (!response.ok) {
    throw new Error(`Metadata request failed (${response.status}) for ${url}`);
  }
  return response.json() as Promise<T>;
};

const fetchPdbMetadata = async (pdbId: string): Promise<PdbMetadata> => {
  const normalizedId = pdbId.trim().toUpperCase();
  if (pdbMetadataCache.has(normalizedId)) {
    return pdbMetadataCache.get(normalizedId)!;
  }

  type EntryResponse = {
    struct?: { title?: string };
    struct_keywords?: { pdbx_keywords?: string; text?: string };
    exptl?: Array<{ method?: string }>;
    rcsb_entry_info?: { resolution_combined?: number[] };
    rcsb_accession_info?: { deposit_date?: string; initial_release_date?: string };
    rcsb_primary_citation?: {
      title?: string;
      rcsb_journal_abbrev?: string;
      journal_abbrev?: string;
      year?: number;
      pdbx_database_id_doi?: string;
      pdbx_database_id_pub_med?: number;
      rcsb_authors?: string[];
    };
    rcsb_entry_container_identifiers?: { polymer_entity_ids?: string[] };
  };

  type PolymerEntityResponse = {
    rcsb_entity_source_organism?: Array<{ scientific_name?: string }>;
    entity_src_gen?: Array<{ organism_scientific?: string }>;
  };

  const entry = await fetchJsonWithTimeout<EntryResponse>(
    `https://data.rcsb.org/rest/v1/core/entry/${normalizedId}`,
    { timeout: 10000, retries: 1, retryDelayMs: 500 }
  );

  const polymerIds = entry.rcsb_entry_container_identifiers?.polymer_entity_ids ?? [];

  const organismNames = new Set<string>();

  await Promise.all(
    polymerIds.map(async polymerId => {
      try {
        const polymer = await fetchJsonWithTimeout<PolymerEntityResponse>(
          `https://data.rcsb.org/rest/v1/core/polymer_entity/${normalizedId}/${polymerId}`,
          { timeout: 8000, retries: 1, retryDelayMs: 400 }
        );

        polymer.rcsb_entity_source_organism?.forEach(src => {
          if (src.scientific_name) organismNames.add(src.scientific_name);
        });
        polymer.entity_src_gen?.forEach(src => {
          if (src.organism_scientific) organismNames.add(src.organism_scientific);
        });
      } catch (err) {
        console.warn(`Unable to fetch polymer entity metadata for ${normalizedId}/${polymerId}:`, err);
      }
    })
  );

  const citationSource = entry.rcsb_primary_citation;

  const metadata: PdbMetadata = {
    pdbId: normalizedId,
    title: entry.struct?.title,
    classification: entry.struct_keywords?.pdbx_keywords || entry.struct_keywords?.text,
    depositionDate: entry.rcsb_accession_info?.deposit_date,
    releaseDate: entry.rcsb_accession_info?.initial_release_date,
    experimentalMethods: (entry.exptl || [])
      .map(item => item.method)
      .filter((method): method is string => Boolean(method))
      .map(method => method.replace(/_/g, ' ')),
    resolution: entry.rcsb_entry_info?.resolution_combined?.[0],
    organisms: Array.from(organismNames),
    citation: citationSource
      ? {
          title: citationSource.title,
          journal: citationSource.rcsb_journal_abbrev || citationSource.journal_abbrev,
          year: citationSource.year,
          doi: citationSource.pdbx_database_id_doi,
          pubmedId: citationSource.pdbx_database_id_pub_med,
          authors: citationSource.rcsb_authors,
        }
      : undefined,
  };

  pdbMetadataCache.set(normalizedId, metadata);
  return metadata;
};


const PDBViewer: React.FC<PDBViewerProps> = ({ pdbId, uniprotId }) => {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstanceRef = useRef<any>(null);
  const originalPdbRef = useRef<string | null>(null);
  const labelsRef = useRef<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
  const [metadata, setMetadata] = useState<PdbMetadata | null>(null);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [structureInfo, setStructureInfo] = useState<{
    downloadUrl: string;
    shareUrl: string;
    downloadFileName: string;
    displayId: string;
    sourceName: string;
  } | null>(null);
  const [pdbText, setPdbText] = useState<string | null>(null);
  const [editChain, setEditChain] = useState('A');
  const [editResidue, setEditResidue] = useState('');
  const [editTarget, setEditTarget] = useState('ALA');
  const [highlightChain, setHighlightChain] = useState('A');
  const [highlightResidue, setHighlightResidue] = useState('');
  const [highlightColor, setHighlightColor] = useState('#ff4d6d');
  const [labelText, setLabelText] = useState('');
  const [interfaceChains, setInterfaceChains] = useState({ chainA: 'A', chainB: 'B' });
  const [cutoffAngstrom, setCutoffAngstrom] = useState(5);
  const [interfaceResidues, setInterfaceResidues] = useState<Array<{ chain: string; resSeq: number; resName: string }>>([]);
  const [showControls, setShowControls] = useState(true);
  const [isMetadataVisible, setIsMetadataVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerHeightPx, setViewerHeightPx] = useState(400);
  const [viewerTheme, setViewerTheme] = useState<'dark' | 'light'>('dark');

  type EditOperation =
    | { type: 'delete_chain'; chain: string }
    | { type: 'mutate'; chain: string; resSeq: number; to: string };

  const clearLabels = useCallback(() => {
    const viewer = viewerInstanceRef.current;
    if (!viewer) return;
    try {
      viewer.removeAllLabels();
      labelsRef.current = [];
    } catch (labelError) {
      console.warn('3Dmol label removal failed:', labelError);
    }
  }, []);

  const applyAmbientStyle = useCallback((viewer: any, options?: { opacity?: number; recenter?: boolean }) => {
    if (!viewer) return;
    const baseOpacity = options?.opacity ?? (viewerTheme === 'dark' ? 0.32 : 0.42);
    const backgroundColor = viewerTheme === 'dark' ? '#04060b' : '#f8fafc';
    viewer.setBackgroundColor(backgroundColor);
    viewer.setStyle({}, {
      cartoon: {
        colorscheme: 'chainHetatm',
        opacity: baseOpacity,
        thickness: viewerTheme === 'dark' ? 1.5 : 1.2,
      }
    });
    if (options?.recenter) viewer.zoomTo();
    viewer.render();
  }, [viewerTheme]);

  const renderPdb = useCallback((pdbString: string) => {
    if (!viewerRef.current) return;
    viewerRef.current.innerHTML = '';
    const viewer = $3Dmol.createViewer(viewerRef.current, { backgroundColor: viewerTheme === 'dark' ? '#04060b' : '#f8fafc' });
    viewer.addModel(pdbString, 'pdb');
    applyAmbientStyle(viewer, { recenter: true });
    viewerInstanceRef.current = viewer;
    (viewerRef.current as any)._viewer = viewer;
  }, [applyAmbientStyle, viewerTheme]);

  const resetStyles = useCallback(() => {
    const viewer = viewerInstanceRef.current;
    if (!viewer) return;
    try {
      applyAmbientStyle(viewer, { recenter: true });
      clearLabels();
      setInterfaceResidues([]);
      setError(null);
    } catch (styleError) {
      console.warn('Unable to reset styles:', styleError);
    }
  }, [applyAmbientStyle, clearLabels]);

  useEffect(() => {
    let isMounted = true;
    let abortMetadata = false;
    let viewerInstance: any = null;

    const resetViewer = () => {
      clearLabels();
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
      viewerInstanceRef.current = null;
    };

    const loadMetadata = async (id: string) => {
      setMetadata(null);
      setMetadataError(null);
      if (!id) return;
      setIsMetadataLoading(true);
      try {
        const meta = await fetchPdbMetadata(id);
        if (!abortMetadata) setMetadata(meta);
      } catch (metaError: any) {
        console.warn('Metadata fetch failed:', metaError);
        if (!abortMetadata) setMetadataError('Unable to load structure metadata from RCSB.');
      } finally {
        if (!abortMetadata) setIsMetadataLoading(false);
      }
    };

    const loadStructure = async () => {
      setIsLoading(true);
      setError(null);
      setStructureInfo(null);
      setPdbText(null);
      resetViewer();

      if (!viewerRef.current) return;

      viewerInstance = $3Dmol.createViewer(
        viewerRef.current,
        { backgroundColor: 'transparent' }
      );

      try {
        if (pdbId) {
          loadMetadata(pdbId);
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
          originalPdbRef.current = pdbData;
          setPdbText(pdbData);
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
          originalPdbRef.current = pdbData;
          setPdbText(pdbData);
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
        viewerInstanceRef.current = viewerInstance;
        if (viewerRef.current) (viewerRef.current as any)._viewer = viewerInstance;
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
      abortMetadata = true;
      resetViewer();
      clearLabels();
    };
  }, [clearLabels, pdbId, uniprotId]);

  const triggerViewerResize = useCallback(() => {
    const viewer = viewerInstanceRef.current;
    if (!viewer || typeof viewer.resize !== 'function') return;
    try {
      viewer.resize();
      if (typeof viewer.render === 'function') viewer.render();
    } catch (resizeError) {
      console.warn('PDB viewer resize failed:', resizeError);
    }
  }, []);

  const handleToggleFullscreen = useCallback(async () => {
    try {
      if (typeof document === 'undefined') return;
      if (!document.fullscreenElement) {
        const element: any = cardContainerRef.current;
        if (element && element.requestFullscreen) {
          await element.requestFullscreen();
          setIsFullscreen(true);
        }
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (fullscreenError) {
      console.warn('Fullscreen toggle failed:', fullscreenError);
      setError(prev => prev ?? 'Unable to toggle fullscreen mode in this browser.');
    }
  }, []);

  useEffect(() => {
    const handleChange = () => {
      if (typeof document === 'undefined') return;
      const isActive = Boolean(document.fullscreenElement);
      setIsFullscreen(isActive);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
    };
  }, []);

  const updateViewerHeight = useCallback(() => {
    if (typeof window === 'undefined') {
      setViewerHeightPx(prev => (isFullscreen ? Math.max(prev, 600) : 400));
      return;
    }

    if (!isFullscreen) {
      setViewerHeightPx(400);
      return;
    }

  const viewportHeight = window.innerHeight || 900;
  const reserved = 220; // leave space for toolbar and metadata paddings
  const nextHeight = Math.max(480, viewportHeight - reserved);
    setViewerHeightPx(nextHeight);
  }, [isFullscreen]);

  useEffect(() => {
    updateViewerHeight();
  }, [updateViewerHeight]);

  useEffect(() => {
    if (!isFullscreen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    updateViewerHeight();
    triggerViewerResize();
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isFullscreen, triggerViewerResize, updateViewerHeight]);

  useEffect(() => {
    triggerViewerResize();
  }, [viewerHeightPx, triggerViewerResize, isMetadataVisible, showControls]);

  useEffect(() => {
    const handleResize = () => {
      updateViewerHeight();
      triggerViewerResize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [triggerViewerResize, updateViewerHeight]);

  useEffect(() => {
    const viewer = viewerInstanceRef.current;
    if (!viewer) return;
    const background = viewerTheme === 'dark' ? '#04060b' : '#f8fafc';
    viewer.setBackgroundColor(background);
    viewer.render();
  }, [viewerTheme]);

  const applyEdits = useCallback(async (operations: EditOperation[]) => {
    if (!pdbText) {
      setError('No structure is loaded to edit.');
      return;
    }
    if (!operations.length) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pdb-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdbText, operations })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'PDB edit failed unexpectedly.');
      }

      const { pdbText: updated } = await response.json();
      if (!updated) throw new Error('Received empty response from edit service.');

      setPdbText(updated);
      renderPdb(updated);
      clearLabels();
      setInterfaceResidues([]);
      setStructureInfo(prev => prev ? { ...prev, downloadFileName: `${prev.displayId || 'structure'}-edited.pdb` } : prev);
      setError(null);
    } catch (editError: any) {
      console.error('applyEdits failed:', editError);
      setError(editError.message || 'Unable to apply edits to this structure.');
    } finally {
      setIsLoading(false);
    }
  }, [clearLabels, pdbText, renderPdb]);

  const parseAtoms = useCallback((pdb: string) => {
    const atoms: Array<{ chain: string; resSeq: number; resName: string; atomName: string; x: number; y: number; z: number }> = [];
    const lines = pdb.split(/\r?\n/);

    for (const line of lines) {
      if (!(line.startsWith('ATOM') || line.startsWith('HETATM'))) continue;
      if (line.length < 54) continue;

      const chain = line.substring(21, 22).trim().toUpperCase();
      const resSeq = Number(line.substring(22, 26).trim());
      if (!Number.isFinite(resSeq)) continue;

      const resName = line.substring(17, 20).trim();
      const atomName = line.substring(12, 16).trim();
      const x = Number(line.substring(30, 38).trim());
      const y = Number(line.substring(38, 46).trim());
      const z = Number(line.substring(46, 54).trim());
      if ([x, y, z].some(coord => !Number.isFinite(coord))) continue;

      atoms.push({ chain, resSeq, resName, atomName, x, y, z });
    }

    return atoms;
  }, []);

  const computeInteractions = useCallback((pdb: string, chainA: string, chainB: string, cutoff: number) => {
    const atoms = parseAtoms(pdb);
    const selectionA = atoms.filter(atom => atom.chain === chainA.toUpperCase());
    const selectionB = atoms.filter(atom => atom.chain === chainB.toUpperCase());
    const cutoffSq = cutoff * cutoff;

    const residues = new Map<string, { chain: string; resSeq: number; resName: string }>();

    for (const a of selectionA) {
      for (const b of selectionB) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq <= cutoffSq) {
          residues.set(`${a.chain}-${a.resSeq}`, { chain: a.chain, resSeq: a.resSeq, resName: a.resName });
          residues.set(`${b.chain}-${b.resSeq}`, { chain: b.chain, resSeq: b.resSeq, resName: b.resName });
        }
      }
    }

    return Array.from(residues.values()).sort((first, second) => {
      if (first.chain === second.chain) return first.resSeq - second.resSeq;
      return first.chain.localeCompare(second.chain);
    });
  }, [parseAtoms]);

  const highlightInteractions = useCallback((residues: Array<{ chain: string; resSeq: number }>) => {
    const viewer = viewerInstanceRef.current;
    if (!viewer) return;

    try {
      const ambientOpacity = viewerTheme === 'dark' ? 0.2 : 0.3;
      applyAmbientStyle(viewer, { opacity: ambientOpacity });

      const buckets = new Map<string, number[]>();
      residues.forEach(res => {
        if (!buckets.has(res.chain)) buckets.set(res.chain, []);
        buckets.get(res.chain)!.push(res.resSeq);
      });

      const palette = ['#ff5c5c', '#5cd4ff', '#ffbf5c', '#9b59ff', '#5cff9b'];
      let index = 0;

      for (const [chain, resi] of buckets.entries()) {
        const color = palette[index % palette.length];
        viewer.setStyle({ chain, resi }, {
          cartoon: { color, opacity: 0.9 },
          stick: { color, radius: 0.28 },
          sphere: { color, radius: 0.65 }
        });
        index += 1;
      }

      viewer.zoomTo();
      viewer.render();
    } catch (highlightError) {
      console.warn('highlightInteractions failed:', highlightError);
    }
  }, [applyAmbientStyle, viewerTheme]);

  const handleMutate = () => {
    if (!editChain.trim() || !editResidue.trim()) {
      setError('Provide the chain and residue number before mutating.');
      return;
    }
    const residueNumber = Number(editResidue);
    if (!Number.isFinite(residueNumber)) {
      setError('Residue number must be numeric.');
      return;
    }
    applyEdits([{ type: 'mutate', chain: editChain.trim().toUpperCase(), resSeq: residueNumber, to: (editTarget || 'ALA').trim().toUpperCase() }]);
  };

  const handleDeleteChain = () => {
    if (!editChain.trim()) {
      setError('Enter a chain identifier to remove.');
      return;
    }
    applyEdits([{ type: 'delete_chain', chain: editChain.trim().toUpperCase() }]);
  };

  const handleResetStructure = () => {
    if (!originalPdbRef.current) return;
    setPdbText(originalPdbRef.current);
    renderPdb(originalPdbRef.current);
    clearLabels();
    setInterfaceResidues([]);
    setError(null);
    setStructureInfo(prev => prev ? { ...prev, downloadFileName: prev.downloadFileName.replace('-edited.pdb', '.pdb') } : prev);
  };

  const handleHighlightSelection = (chainOverride?: string, residueOverride?: number, options?: { revealNeighbors?: boolean }) => {
    const viewer = viewerInstanceRef.current;
    if (!viewer) return;

    const rawChain = chainOverride ?? highlightChain;
    const chain = rawChain.trim().toUpperCase();
    if (!chain) {
      setError('Provide a chain to highlight.');
      return;
    }

    const residueSource = residueOverride !== undefined ? residueOverride : (highlightResidue ? Number(highlightResidue) : undefined);
    if (residueOverride === undefined && highlightResidue && !Number.isFinite(residueSource)) {
      setError('Residue must be numeric.');
      return;
    }

    const residueNumber = typeof residueSource === 'number' && Number.isFinite(residueSource) ? residueSource : undefined;
    if (options?.revealNeighbors && typeof residueNumber !== 'number') {
      setError('Enter a residue number to map its neighborhood.');
      return;
    }
    const shouldRevealNeighbors = Boolean(options?.revealNeighbors) && typeof residueNumber === 'number';

    try {
      const backgroundOpacity = viewerTheme === 'dark' ? 0.18 : 0.28;
      applyAmbientStyle(viewer, { opacity: backgroundOpacity });

      const selection: Record<string, any> = { chain };
      if (typeof residueNumber === 'number') selection.resi = [residueNumber];

      if (shouldRevealNeighbors) {
        const neighborSelection = {
          within: {
            distance: cutoffAngstrom || 5,
            sel: { chain, resi: residueNumber }
          }
        };

        const neighborCartoonOpacity = viewerTheme === 'dark' ? 0.55 : 0.65;
        const neighborStickColor = viewerTheme === 'dark' ? '#facc15' : '#b45309';
        const neighborCartoonColor = viewerTheme === 'dark' ? '#38bdf8' : '#0284c7';

        viewer.setStyle(neighborSelection, {
          cartoon: { color: neighborCartoonColor, opacity: neighborCartoonOpacity },
          stick: { color: neighborStickColor, radius: 0.22 }
        });

        viewer.zoomTo(neighborSelection);
      } else {
        viewer.zoomTo(selection);
      }

      viewer.setStyle(selection, {
        cartoon: { color: highlightColor, opacity: 1, thickness: 2.4 },
        stick: { color: highlightColor, radius: 0.3 },
        sphere: { color: highlightColor, radius: 0.75 }
      });

      viewer.render();
      setError(null);
    } catch (highlightError) {
      console.warn('Highlight failed:', highlightError);
      setError('Unable to highlight the selected region.');
    }
  };

  const handleAddLabel = () => {
    const viewer = viewerInstanceRef.current;
    if (!viewer) return;
    if (!labelText.trim()) {
      setError('Enter label text before adding a label.');
      return;
    }

    const chain = highlightChain.trim().toUpperCase();
    if (!chain) {
      setError('Select a chain to label.');
      return;
    }

    const residueNumber = highlightResidue ? Number(highlightResidue) : undefined;
    if (highlightResidue && !Number.isFinite(residueNumber)) {
      setError('Residue must be numeric.');
      return;
    }

    try {
      const selection: Record<string, any> = { chain };
      if (residueNumber) selection.resi = [residueNumber];

      let atoms: any[] = [];
      if (typeof viewer.selectedAtoms === 'function') {
        atoms = viewer.selectedAtoms(selection);
      } else if (viewer.getModel && typeof viewer.getModel === 'function') {
        const model = viewer.getModel();
        atoms = model && typeof model.selectedAtoms === 'function' ? model.selectedAtoms(selection) : [];
      }

      if (!atoms || !atoms.length) {
        setError('No atoms found for this selection.');
        return;
      }

      const anchor = atoms.find(atom => atom.atom === 'CA') || atoms[0];
      const label = viewer.addLabel(labelText.trim(), {
        position: { x: anchor.x, y: anchor.y, z: anchor.z },
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        fontColor: '#ffffff',
        inFront: true,
        borderThickness: 0,
      });

      labelsRef.current.push(label);
      viewer.render();
      setError(null);
    } catch (labelError) {
      console.warn('Label placement failed:', labelError);
      setError('Unable to add a label for this selection.');
    }
  };

  const handleIsolateChain = () => {
    const viewer = viewerInstanceRef.current;
    if (!viewer) return;

    const chain = highlightChain.trim().toUpperCase();
    if (!chain) {
      setError('Provide a chain to isolate.');
      return;
    }

    try {
      viewer.setStyle({}, {});
      viewer.setStyle({ chain }, { cartoon: { color: highlightColor || 'spectrum' } });
      viewer.zoomTo({ chain });
      viewer.render();
      setError(null);
    } catch (isolateError) {
      console.warn('Chain isolation failed:', isolateError);
      setError('Unable to isolate the selected chain.');
    }
  };

  const handleComputeInterface = () => {
    if (!pdbText) {
      setError('Load a structure before computing interactions.');
      return;
    }

    const chainA = interfaceChains.chainA.trim().toUpperCase();
    const chainB = interfaceChains.chainB.trim().toUpperCase();
    if (!chainA || !chainB) {
      setError('Provide both chain identifiers.');
      return;
    }

  const cutoff = Number(cutoffAngstrom) || 5;
    const residues = computeInteractions(pdbText, chainA, chainB, cutoff);
    setInterfaceResidues(residues);
    highlightInteractions(residues.map(res => ({ chain: res.chain, resSeq: res.resSeq })));
    setError(null);
  };
  
  const handleDownload = () => {
    const filename = structureInfo?.downloadFileName || (pdbId ? `${pdbId}.pdb` : 'structure.pdb');

    if (pdbText) {
      try {
        const blob = new Blob([pdbText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
      } catch (downloadError) {
        console.error('Download error:', downloadError);
      }
      return;
    }

    if (!structureInfo) return;

    fetch(structureInfo.downloadUrl)
      .then(res => res.text())
      .then(data => {
        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
      })
      .catch(err => console.error('Download error:', err));
  };

  const handleWhatsAppShare = () => {
    if (!structureInfo) return;
    const text = `Check out this protein structure from ${structureInfo.sourceName}: ${structureInfo.displayId}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${structureInfo.shareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return undefined;
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return isoDate.slice(0, 10);
    return parsed.toISOString().slice(0, 10);
  };

  const cardClass = `${isFullscreen
    ? 'w-screen h-screen max-w-none rounded-none border border-slate-700 shadow-[0_30px_90px_-35px_rgba(88,81,255,0.75)] overflow-y-auto'
    : 'mt-4 w-full max-w-2xl min-h-[560px] rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden'} bg-black relative flex flex-col transition-all duration-300`;
  const viewerPanelClass = `${isFullscreen ? 'mx-6 mt-6 flex-1' : 'mx-5 mt-4'} relative rounded-2xl overflow-hidden ${viewerTheme === 'dark'
    ? 'border border-slate-800/60 bg-gradient-to-b from-slate-950/75 via-slate-950/55 to-black'
    : 'border border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100 shadow-inner'}`;
  const metadataToggleDisabled = !pdbId;
  const metadataToggleLabel = metadataToggleDisabled ? 'Info Unavailable' : (isMetadataVisible ? 'Hide Info' : 'Show Info');

  const cardContent = (
    <div ref={cardContainerRef} className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsMetadataVisible(prev => !prev)}
            disabled={metadataToggleDisabled}
            className={`px-3 py-1 rounded-full border text-xs font-semibold tracking-wide transition-colors ${metadataToggleDisabled ? 'cursor-not-allowed border-slate-700/40 bg-slate-800/40 text-slate-500/50' : 'border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800'}`}
            aria-pressed={isMetadataVisible}
          >
            {metadataToggleLabel}
          </button>
          <button
            onClick={() => setViewerTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
            className="px-3 py-1 rounded-full border border-slate-700 bg-slate-900/80 text-slate-200 text-xs font-semibold tracking-wide hover:bg-slate-800 transition-colors"
          >
            {viewerTheme === 'dark' ? 'Light Canvas' : 'Night Canvas'}
          </button>
          <button
            onClick={handleToggleFullscreen}
            className="px-3 py-1 rounded-full border border-slate-700 bg-slate-900/80 text-slate-200 text-xs font-semibold tracking-wide hover:bg-slate-800 transition-colors"
          >
            {isFullscreen ? 'Exit Full View' : 'Full View'}
          </button>
        </div>
        {structureInfo && !isLoading && !error && (
          <div className="flex gap-2">
            <button onClick={handleWhatsAppShare} className="p-2 bg-slate-800/70 text-white rounded-full hover:bg-slate-700 transition-colors" title="Share via WhatsApp">
              <WhatsAppIcon className="w-5 h-5" />
            </button>
            <button onClick={handleDownload} className="p-2 bg-slate-800/70 text-white rounded-full hover:bg-slate-700 transition-colors" title="Download PDB file">
              <DownloadIcon />
            </button>
          </div>
        )}
      </div>

      <div
        className={viewerPanelClass}
        style={{ height: viewerHeightPx, minHeight: isFullscreen ? 420 : 360 }}
      >
        {isLoading && <div className="absolute inset-0 flex items-center justify-center text-white bg-black/70 backdrop-blur-sm z-10">Loading 3D View...</div>}
        {error && <div className="absolute inset-0 flex items-center justify-center text-red-300 bg-black/80 backdrop-blur-sm p-4 text-center z-10">{error}</div>}
        <div ref={viewerRef} className="absolute inset-0" />
      </div>

      {pdbText && !isLoading && !error && (
        <div className="flex items-center justify-between gap-4 px-5 pt-5">
          <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">Structure Lab</p>
          <button
            onClick={() => setShowControls(prev => !prev)}
            className="px-3 py-1 rounded-full bg-slate-900/80 text-slate-100 border border-slate-700 hover:bg-slate-800 transition-colors text-xs"
          >
            {showControls ? 'Hide Controls' : 'Show Controls'}
          </button>
        </div>
      )}

      {pdbText && showControls && !isLoading && !error && (
        <div className="px-5 pb-4">
          <div className="bg-slate-900/85 text-slate-100 border border-slate-700 rounded-lg p-3 space-y-2 text-xs max-h-64 overflow-y-auto shadow-lg">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="uppercase text-[10px] tracking-wide text-slate-400">Edit Structure</span>
              <input value={editChain} onChange={e => setEditChain(e.target.value.toUpperCase())} placeholder="Chain" className="px-2 py-1 w-14 rounded bg-slate-800 border border-slate-700" />
              <input value={editResidue} onChange={e => setEditResidue(e.target.value)} placeholder="Residue" className="px-2 py-1 w-20 rounded bg-slate-800 border border-slate-700" />
              <input value={editTarget} onChange={e => setEditTarget(e.target.value.toUpperCase())} placeholder="Target" className="px-2 py-1 w-24 rounded bg-slate-800 border border-slate-700" />
              <button onClick={handleMutate} className="px-3 py-1 rounded bg-emerald-500/80 hover:bg-emerald-500 transition-colors text-white">Mutate</button>
              <button onClick={handleDeleteChain} className="px-3 py-1 rounded bg-rose-500/80 hover:bg-rose-500 transition-colors text-white">Delete Chain</button>
              <button onClick={handleResetStructure} className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 transition-colors">Restore</button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="uppercase text-[10px] tracking-wide text-slate-400">Focus &amp; Label</span>
              <input value={highlightChain} onChange={e => setHighlightChain(e.target.value.toUpperCase())} placeholder="Chain" className="px-2 py-1 w-14 rounded bg-slate-800 border border-slate-700" />
              <input value={highlightResidue} onChange={e => setHighlightResidue(e.target.value)} placeholder="Residue" className="px-2 py-1 w-20 rounded bg-slate-800 border border-slate-700" />
              <input type="color" value={highlightColor} onChange={e => setHighlightColor(e.target.value)} className="w-10 h-8 rounded" title="Highlight colour" />
              <button onClick={() => handleHighlightSelection()} className="px-3 py-1 rounded bg-sky-500/80 hover:bg-sky-500 transition-colors text-white">Highlight</button>
              <button onClick={() => handleHighlightSelection(undefined, undefined, { revealNeighbors: true })} className="px-3 py-1 rounded bg-amber-400/80 hover:bg-amber-400 transition-colors text-slate-900 font-semibold">Halo 5 Å</button>
              <input value={labelText} onChange={e => setLabelText(e.target.value)} placeholder="Label text" className="px-2 py-1 w-32 rounded bg-slate-800 border border-slate-700" />
              <button onClick={handleAddLabel} className="px-3 py-1 rounded bg-indigo-500/80 hover:bg-indigo-500 transition-colors text-white">Add Label</button>
              <button onClick={clearLabels} className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 transition-colors">Clear Labels</button>
              <button onClick={handleIsolateChain} className="px-3 py-1 rounded bg-amber-500/80 hover:bg-amber-500 transition-colors text-white">Isolate Chain</button>
              <button onClick={resetStyles} className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 transition-colors">Reset Styles</button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="uppercase text-[10px] tracking-wide text-slate-400">Chain Interaction</span>
              <input value={interfaceChains.chainA} onChange={e => setInterfaceChains(prev => ({ ...prev, chainA: e.target.value.toUpperCase() }))} placeholder="Chain A" className="px-2 py-1 w-16 rounded bg-slate-800 border border-slate-700" />
              <input value={interfaceChains.chainB} onChange={e => setInterfaceChains(prev => ({ ...prev, chainB: e.target.value.toUpperCase() }))} placeholder="Chain B" className="px-2 py-1 w-16 rounded bg-slate-800 border border-slate-700" />
              <input type="number" step="0.5" value={cutoffAngstrom} onChange={e => setCutoffAngstrom(Number(e.target.value))} className="px-2 py-1 w-20 rounded bg-slate-800 border border-slate-700" />
              <button onClick={handleComputeInterface} className="px-3 py-1 rounded bg-purple-500/80 hover:bg-purple-500 transition-colors text-white">Highlight Interface</button>
            </div>

            {interfaceResidues.length > 0 && (
              <div className="max-h-32 overflow-y-auto bg-slate-800/80 border border-slate-700 rounded p-2 text-[11px] space-y-1">
                <div className="text-slate-300 font-semibold text-[10px] tracking-wide">Contact Residues ({interfaceResidues.length})</div>
                {interfaceResidues.map(res => (
                  <button
                    key={`${res.chain}-${res.resSeq}`}
                    onClick={() => {
                      setHighlightChain(res.chain);
                      setHighlightResidue(String(res.resSeq));
                      handleHighlightSelection(res.chain, res.resSeq, { revealNeighbors: true });
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                  >
                    {res.chain}:{res.resName}{res.resSeq}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {pdbId && isMetadataVisible && !isLoading && !error && (
        <div className="px-5 pb-6 space-y-3">
          {metadata && !isMetadataLoading && (
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-200">
              {metadata.experimentalMethods.map(method => (
                <span key={`method-${method}`} className="px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/80 uppercase tracking-wide">{method}</span>
              ))}
              {typeof metadata.resolution === 'number' && (
                <span className="px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/80">Resolution {metadata.resolution.toFixed(2)} Å</span>
              )}
              {metadata.organisms.map(org => (
                <span key={`org-${org}`} className="px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/80">{org}</span>
              ))}
            </div>
          )}

          <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 via-indigo-900/60 to-slate-900 p-5 shadow-[0_20px_60px_-30px_rgba(76,61,255,0.7)]">
            <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.15),_transparent_55%)]" />
            <div className="relative space-y-3">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">RCSB Official Summary</p>
              {isMetadataLoading ? (
                <p className="text-sm text-slate-300">Fetching metadata…</p>
              ) : metadata ? (
                <>
                  <h3 className="text-xl font-semibold leading-tight text-white drop-shadow-sm">
                    {metadata.title || metadata.pdbId || pdbId}
                  </h3>
                  {metadata.classification && (
                    <p className="text-sm text-slate-200">{metadata.classification}</p>
                  )}
                  <div className="space-y-1 text-sm text-slate-200">
                    {metadata.organisms.length > 0 && (
                      <p>
                        <span className="text-slate-400">Source organism:</span> {metadata.organisms.join(', ')}
                      </p>
                    )}
                    {metadata.experimentalMethods.length > 0 && (
                      <p>
                        <span className="text-slate-400">Experimental method:</span> {metadata.experimentalMethods.join(', ')}
                      </p>
                    )}
                    {typeof metadata.resolution === 'number' && (
                      <p>
                        <span className="text-slate-400">Resolution:</span> {metadata.resolution.toFixed(2)} Å
                      </p>
                    )}
                    {(() => {
                      const timeline: string[] = [];
                      const released = formatDate(metadata.releaseDate);
                      const deposited = formatDate(metadata.depositionDate);
                      if (released) timeline.push(`Released ${released}`);
                      if (deposited) timeline.push(`Deposited ${deposited}`);
                      if (timeline.length === 0) return null;
                      return <p className="text-slate-400/90 text-sm">{timeline.join(' • ')}</p>;
                    })()}
                  </div>
                  {metadata.citation && (
                    <p className="text-sm italic text-slate-300">
                      {metadata.citation.title}
                      {metadata.citation.journal ? ` — ${metadata.citation.journal}` : ''}
                      {metadata.citation.year ? ` (${metadata.citation.year})` : ''}
                    </p>
                  )}
                  {metadataError && (
                    <p className="text-sm text-rose-300">{metadataError}</p>
                  )}
                </>
              ) : (
                <p className={`text-sm ${metadataError ? 'text-rose-300' : 'text-slate-300/80'}`}>
                  {metadataError || 'Metadata unavailable for this entry.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return cardContent;
};

export default PDBViewer;
