import type React from 'react';

// Main App Types
export type Page = 'home' | 'chatbot' | 'projects' | 'settings' | 'supervisor' | 'about' | 'contact' | 'quotes' | 'snapshot';
export type Theme = 'light' | 'dark';
export type AccentColor = 'teal' | 'rose' | 'sky' | 'violet';
export type BackgroundColor = 'slate' | 'gray' | 'stone' | 'zinc' | 'neutral';
export type ApiStatus = 'idle' | 'healthy' | 'error';

// Chatbot Types
export enum MessageAuthor {
  USER = 'user',
  RHESUS = 'rhesus',
  SYSTEM = 'system',
}

export interface Message {
  id: string;
  author: MessageAuthor;
  content: React.ReactNode;
  rawContent?: string;
  actions?: { label: string; prompt: string }[];
  replyTo?: {
    id: string;
    author: string;
    content: string;
  };
}

export interface BlastHit {
    accession: string;
    description: string;
    score: number;
    e_value: string;
    identity: number;
}

// Recent Chat for Sidebar
export interface RecentChat {
  id: string; // 'general' or a project ID like 'proj-...'
  title: string;
  type: 'general' | 'project';
  projectName?: string; // e.g., "P53 Mutants"
}

// Project Types
export enum ContentType {
    TEXT = 'text',
    PDB_VIEWER = 'pdb_viewer',
    BLAST_RESULT = 'blast_result',
    PUBMED_SUMMARY = 'pubmed_summary',
    SUMMARY = 'summary',
    CHAT_SESSION = 'chat_session',
    RUN_BLASTP = 'run_blastp',
    BLAST_PROGRESS = 'blast_progress',
    // FIX: Renamed enum member to be a valid identifier (no spaces).
    ALPHA_FOLD_VIEWER = 'alphafold_viewer',
    FETCH_UNIPROT_SEQUENCE = 'fetch_uniprot_sequence',
    SEQUENCE_VIEWER = 'sequence_viewer',
    RUN_MSA = 'run_msa',
    MSA_PROGRESS = 'msa_progress',
    MSA_RESULT = 'msa_result',
    RUN_PHYLOGENETIC_TREE = 'run_phylogenetic_tree',
    PHYLO_TREE_PROGRESS = 'phylo_tree_progress',
    PHYLO_TREE_RESULT = 'phylo_tree_result',
}

export interface ContentBlock {
    id: string;
    type: ContentType;
    data: any; // Can be a string for text, {pdbId: string} for viewer, etc.
}

export interface Project {
    id:string;
    title: string;
    description: string;
    lastModified: string;
    contentBlocks: ContentBlock[];
}

// Pipeline (Automation) Types
export interface PipelineStep {
    id: string;
    prompt: string;
}
export interface Pipeline {
    id: string;
    name: string;
    description: string;
    steps: PipelineStep[];
}

// Snapshot (Sharing) Types
export interface Snapshot {
    id: string;
    createdAt: string;
    contentBlock: ContentBlock;
}

// FIX: Added missing TourStep interface
// Tour Guide Types
export interface TourStep {
  selector: string;
  page: Page;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

// AI Response Types
export interface ToolCall {
  type: ContentType;
  data: any;
}

export interface AiResponse {
  prose: string;
  tool_calls?: ToolCall[];
  actions?: { label: string; prompt: string }[];
}

// App Context Type
export interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  backgroundColor: BackgroundColor;
  setBackgroundColor: (color: BackgroundColor) => void;
  userName: string;
  setUserName: (name: string) => void;
  userTitle: string;
  setUserTitle: (title: string) => void;
  avatar: string;
  setAvatar: (avatar: string) => void;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  pipelines: Pipeline[];
  setPipelines: React.Dispatch<React.SetStateAction<Pipeline[]>>;
  logout: () => void;
  apiStatus: ApiStatus;
  setApiStatus: (status: ApiStatus) => void;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  activeProjectName: string | undefined;
  recentChats: RecentChat[];
  setRecentChats: React.Dispatch<React.SetStateAction<RecentChat[]>>;
  startNewChat: () => void;
  isNewChat: boolean;
  setIsNewChat: (isNewChat: boolean) => void;
}
