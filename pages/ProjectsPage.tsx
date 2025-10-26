import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../App';
import { Project, ContentBlock, ContentType, BlastHit, Snapshot } from '../types';
import { PlusIcon, ChevronLeftIcon, DocumentTextIcon, TrashIcon, PencilIcon, CheckIcon, CloseIcon, ShareIcon, PrinterIcon, ChatBubbleIcon, ExclamationTriangleIcon } from '../components/icons';
import PDBViewer from '../components/PDBViewer';
import MarkdownRenderer from '../components/MarkdownRenderer';
import BlastViewer from '../components/BlastChart';

const PROJECT_COLORS = ['border-red-500', 'border-sky-500', 'border-amber-500', 'border-emerald-500', 'border-violet-500'];

const DeleteConfirmationModal: React.FC<{
    project: Project | null;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ project, onClose, onConfirm }) => {
    if (!project) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-[var(--popover-background-color)] rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-[var(--popover-foreground-color)]">Delete Project</h3>
                        <p className="mt-2 text-sm text-[var(--muted-foreground-color)]">
                            Are you sure you want to delete the project "<span className="font-semibold">{project.title}</span>"?
                            All associated content and chat history will be permanently removed. This action cannot be undone.
                        </p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Delete Project
                    </button>
                </div>
            </div>
        </div>
    );
};


const ProjectsPage: React.FC = () => {
    const { projects, setProjects } = useAppContext();
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);


    const handleCreateProject = (title: string, description: string) => {
        const newProject: Project = {
            id: `proj-${Date.now()}`,
            title,
            description,
            lastModified: new Date().toISOString(),
            contentBlocks: [],
        };
        setProjects(prev => [...prev, newProject]);
        setIsCreating(false);
    };
    
    const handleDeleteRequest = (project: Project) => {
        setProjectToDelete(project);
    };

    const handleConfirmDelete = () => {
        if (!projectToDelete) return;

        // Also delete the associated chat history from localStorage for cleanup
        localStorage.removeItem(`chatHistory_${projectToDelete.id}`);

        setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
        
        // If the deleted project was the one being viewed, go back to the list
        if (selectedProject?.id === projectToDelete.id) {
            setSelectedProject(null);
        }
        
        setProjectToDelete(null); // Close the modal
    };

    const handleShareContent = (contentBlock: ContentBlock) => {
        const id = `snap-${Date.now()}`;
        const snapshot: Snapshot = {
            id,
            createdAt: new Date().toISOString(),
            contentBlock: { ...contentBlock, id: `cb-${id}`},
        };
        localStorage.setItem(`snapshot_${id}`, JSON.stringify(snapshot));
        const url = `${window.location.origin}${window.location.pathname}#snapshot/${id}`;
        navigator.clipboard.writeText(url);
        setShowCopiedTooltip(true);
        setTimeout(() => setShowCopiedTooltip(false), 2000);
    };
    
    if (selectedProject) {
        return <ProjectDetailView project={selectedProject} onBack={() => setSelectedProject(null)} onDeleteRequest={handleDeleteRequest} setProjects={setProjects} onShare={handleShareContent} />;
    }

    if (isCreating) {
        return <CreateProjectView onCreate={handleCreateProject} onCancel={() => setIsCreating(false)} />;
    }

    return (
        <div className="p-4 md:p-8 h-full bg-[var(--background-color)]">
            {showCopiedTooltip && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm z-50 flex items-center gap-2"><CheckIcon /> Copied sharing link to clipboard!</div>}
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold primary-text">My Projects</h1>
                    <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 px-4 py-2 primary-bg text-white rounded-lg primary-bg-hover transition-colors">
                        <PlusIcon /> New Project
                    </button>
                </div>
                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {projects.sort((a,b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()).map((project, index) => (
                            <div key={project.id} onClick={() => setSelectedProject(project)} 
                                className={`group bg-[var(--card-background-color)] p-5 rounded-lg shadow-sm border-l-4 ${PROJECT_COLORS[index % PROJECT_COLORS.length]} cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-l-4 hover:${PROJECT_COLORS[index % PROJECT_COLORS.length]} transition-all duration-300 flex flex-col justify-between h-48`}>
                                <div>
                                    <h2 className="font-bold text-[var(--card-foreground-color)] text-lg truncate">{project.title}</h2>
                                    <p className="text-sm text-[var(--muted-foreground-color)] mt-1 line-clamp-3">{project.description}</p>
                                </div>
                                <p className="text-xs text-[var(--muted-foreground-color)] mt-2 self-end">
                                    Last modified: {new Date(project.lastModified).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed border-[var(--border-color)] rounded-lg">
                        <DocumentTextIcon className="w-12 h-12 mx-auto text-slate-400" />
                        <h3 className="mt-2 text-lg font-semibold text-[var(--foreground-color)]">No Projects Yet</h3>
                        <p className="mt-1 text-sm text-[var(--muted-foreground-color)]">Create a new project to get started.</p>
                    </div>
                )}
            </div>
             <DeleteConfirmationModal
                project={projectToDelete}
                onClose={() => setProjectToDelete(null)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

const CreateProjectView: React.FC<{onCreate: (t: string, d: string) => void, onCancel: () => void}> = ({onCreate, onCancel}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold primary-text mb-6">Create New Project</h1>
            <div className="space-y-4">
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Project Title" className="w-full bg-[var(--input-background-color)] p-3 rounded-md border border-[var(--border-color)] focus:primary-ring focus:outline-none" />
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Project Description" rows={4} className="w-full bg-[var(--input-background-color)] p-3 rounded-md border border-[var(--border-color)] focus:primary-ring focus:outline-none resize-none" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <button onClick={onCancel} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md text-sm">Cancel</button>
                <button onClick={() => onCreate(title, description)} className="px-4 py-2 primary-bg text-white rounded-md text-sm">Create</button>
            </div>
        </div>
    );
};

const ProjectDetailView: React.FC<{project: Project, onBack: () => void, onDeleteRequest: (project: Project) => void, setProjects: React.Dispatch<React.SetStateAction<Project[]>>, onShare: (cb: ContentBlock) => void}> = ({ project, onBack, onDeleteRequest, setProjects, onShare }) => {
    const [isEditingMeta, setIsEditingMeta] = useState(false);
    const [editedTitle, setEditedTitle] = useState(project.title);
    const [editedDescription, setEditedDescription] = useState(project.description);
    const { setActiveProjectId } = useAppContext();

    const handleOpenChat = () => {
        setActiveProjectId(project.id);
        window.location.hash = '#chatbot';
    };

    const handlePrintProject = () => { window.print(); };

    const handlePrintBlock = (blockId: string) => {
        const targetBlock = document.getElementById(`block-${blockId}`);
        if (!targetBlock) return;
        
        const cleanup = () => {
            document.body.classList.remove('print-single-block');
            targetBlock.removeAttribute('data-print-target');
            window.removeEventListener('afterprint', cleanup);
        };
        window.addEventListener('afterprint', cleanup);
        document.body.classList.add('print-single-block');
        targetBlock.setAttribute('data-print-target', 'true');
        setTimeout(() => window.print(), 100);
    };
    
    const handleSaveMeta = () => {
        setProjects(prev => prev.map(p => p.id === project.id ? { ...p, title: editedTitle, description: editedDescription, lastModified: new Date().toISOString() } : p));
        setIsEditingMeta(false);
    };

    const handleCancelMetaEdit = () => {
        setEditedTitle(project.title);
        setEditedDescription(project.description);
        setIsEditingMeta(false);
    };

    const handleUpdateBlock = (updatedBlock: ContentBlock) => {
        setProjects(prevProjects => prevProjects.map(p => {
            if (p.id === project.id) {
                return {
                    ...p,
                    contentBlocks: p.contentBlocks.map(b => b.id === updatedBlock.id ? updatedBlock : b),
                    lastModified: new Date().toISOString(),
                };
            }
            return p;
        }));
    };

    const handleDeleteBlock = (blockId: string) => {
        if (window.confirm("Are you sure you want to delete this content block?")) {
            setProjects(prevProjects => prevProjects.map(p => {
                if (p.id === project.id) {
                    return {
                        ...p,
                        contentBlocks: p.contentBlocks.filter(b => b.id !== blockId),
                        lastModified: new Date().toISOString(),
                    };
                }
                return p;
            }));
        }
    };

    return (
        <div className="p-4 md:p-8 h-full bg-[var(--background-color)]">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6 noprint">
                    <button onClick={onBack} className="flex items-center gap-1 text-sm primary-text hover:underline">
                        <ChevronLeftIcon /> Back to Projects
                    </button>
                    <div className="flex gap-2">
                         <button onClick={handleOpenChat} className="flex items-center gap-2 px-4 py-2 text-sm primary-bg text-white rounded-lg primary-bg-hover transition-colors">
                            <ChatBubbleIcon className="w-4 h-4" /> Open Chat
                         </button>
                         <button onClick={handlePrintProject} className="px-4 py-2 text-sm bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Export to PDF</button>
                         <button onClick={() => onDeleteRequest(project)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"><TrashIcon/></button>
                    </div>
                </div>
                <div className="printable-area bg-transparent">
                    {isEditingMeta ? (
                        <div className="mb-8 noprint p-4 bg-[var(--input-background-color)] rounded-lg border border-dashed primary-border">
                            <input 
                                type="text"
                                value={editedTitle}
                                onChange={e => setEditedTitle(e.target.value)}
                                className="w-full text-3xl font-bold bg-[var(--card-background-color)] p-2 rounded-md border border-[var(--border-color)] focus:primary-ring focus:outline-none"
                            />
                            <textarea 
                                value={editedDescription}
                                onChange={e => setEditedDescription(e.target.value)}
                                rows={3}
                                className="w-full mt-2 text-[var(--muted-foreground-color)] bg-[var(--card-background-color)] p-2 rounded-md border border-[var(--border-color)] focus:primary-ring focus:outline-none resize-none"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button onClick={handleCancelMetaEdit} title="Cancel" className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full"><CloseIcon className="w-4 h-4" /></button>
                                <button onClick={handleSaveMeta} title="Save" className="p-1.5 text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full"><CheckIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-8 relative group border-b-2 border-[var(--border-color)] pb-4">
                            <h1 className="text-3xl font-bold primary-text print-text-black">{project.title}</h1>
                            <p className="text-[var(--muted-foreground-color)] print-text-black mt-2">{project.description}</p>
                            <button onClick={() => setIsEditingMeta(true)} title="Edit project details" className="noprint absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--muted-foreground-color)] hover:primary-text">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {project.contentBlocks.length > 0 ? project.contentBlocks.map((block) => (
                            <EditableContentBlock 
                                key={block.id} 
                                block={block}
                                onUpdateBlock={handleUpdateBlock}
                                onDeleteBlock={handleDeleteBlock}
                                onShareBlock={onShare}
                                onPrintBlock={handlePrintBlock}
                            />
                        )) : (
                            <p className="text-center text-[var(--muted-foreground-color)] py-8 md:col-span-2 noprint">This project is empty. Pin content from the chatbot to get started.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
};

const EditableContentBlock: React.FC<{
    block: ContentBlock, 
    onUpdateBlock: (b: ContentBlock) => void, 
    onDeleteBlock: (id: string) => void, 
    onShareBlock: (b: ContentBlock) => void,
    onPrintBlock: (id: string) => void,
}> = ({ block, onUpdateBlock, onDeleteBlock, onShareBlock, onPrintBlock }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(block.data);
    const [rawJsonText, setRawJsonText] = useState(() => {
        if (block.type === ContentType.BLAST_RESULT) {
            try { return JSON.stringify(block.data, null, 2); } 
            catch { return "Error: Could not display data."; }
        }
        return '';
    });
    const [jsonError, setJsonError] = useState<string | null>(null);

    const handleSave = () => {
        if (jsonError) return;
        onUpdateBlock({ ...block, data: editData });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData(block.data);
        if (block.type === ContentType.BLAST_RESULT) {
            setJsonError(null);
            setRawJsonText(JSON.stringify(block.data, null, 2));
        }
    };

    const renderDisplayView = () => {
        try {
            switch (block.type) {
                case ContentType.PDB_VIEWER:
                    return <div className="print-bg-white"><PDBViewer pdbId={block.data.pdbId} /></div>;
                case ContentType.TEXT:
                    return <MarkdownRenderer content={block.data} />;
                case ContentType.PUBMED_SUMMARY:
                    return <div className="p-4 my-2 bg-[var(--input-background-color)] print-bg-white rounded-lg border border-[var(--border-color)]"><h3 className="font-bold mb-2 primary-text print-text-black">Literature Summary</h3><MarkdownRenderer content={block.data.summary} /></div>;
                case ContentType.BLAST_RESULT:
                    const hits: BlastHit[] = Array.isArray(block.data) ? block.data : [];
                    return (
                        <div className="p-4 my-2 bg-[var(--input-background-color)] print-bg-white rounded-lg border border-[var(--border-color)]">
                            <h3 className="font-bold mb-2 primary-text print-text-black">BLAST Result</h3>
                            <BlastViewer data={hits} />
                        </div>
                    );
                default:
                    return <p className="text-red-500">Unknown content type</p>;
            }
        } catch (e) {
            console.error("Error rendering content block:", block, e);
            return <div className="p-4 border-2 border-dashed border-red-400 rounded-lg"><p className="text-red-500 font-semibold">Error rendering content</p><p className="text-xs text-slate-500">This content block may be corrupted. You can try editing it to fix the data structure or delete it.</p></div>
        }
    };

    const renderEditView = () => {
        switch (block.type) {
            case ContentType.PDB_VIEWER:
                return <input type="text" value={editData.pdbId} onChange={e => setEditData({ pdbId: e.target.value })} className="w-full bg-[var(--input-background-color)] p-2 rounded-md border border-[var(--border-color)]" />;
            case ContentType.TEXT:
                return <textarea value={editData} onChange={e => setEditData(e.target.value)} rows={5} className="w-full bg-[var(--input-background-color)] p-2 rounded-md border border-[var(--border-color)]" />;
            case ContentType.PUBMED_SUMMARY:
                return <textarea value={editData.summary} onChange={e => setEditData({ summary: e.target.value })} rows={8} className="w-full bg-[var(--input-background-color)] p-2 rounded-md border border-[var(--border-color)]" />;
            case ContentType.BLAST_RESULT:
                const handleBlastDataChange = (value: string) => {
                    setRawJsonText(value);
                    try {
                        const parsed = JSON.parse(value);
                        if (!Array.isArray(parsed)) throw new Error("Data must be an array.");
                        setEditData(parsed);
                        setJsonError(null);
                    } catch (e: any) {
                        setJsonError(`Invalid JSON: ${e.message}`);
                    }
                };
                return (
                    <div>
                        <textarea value={rawJsonText} onChange={e => handleBlastDataChange(e.target.value)} rows={8} className={`w-full bg-[var(--input-background-color)] p-2 rounded-md border ${jsonError ? 'border-red-500' : 'border-[var(--border-color)]'} font-mono text-xs`} />
                        {jsonError && <p className="text-red-500 text-xs mt-1">{jsonError}</p>}
                    </div>
                );
            default: return <p>Editing not supported for this type.</p>
        }
    };
    
    return (
        <div id={`block-${block.id}`} className={`relative group bg-[var(--card-background-color)] p-4 rounded-lg border border-[var(--border-color)] shadow-sm transition-all duration-300 hover:shadow-lg`}>
            <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10 noprint">
                <button onClick={() => onShareBlock(block)} title="Share" className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><ShareIcon className="w-4 h-4" /></button>
                <button onClick={() => onPrintBlock(block.id)} title="Print" className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><PrinterIcon className="w-4 h-4" /></button>
                <button onClick={() => setIsEditing(true)} title="Edit" className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><PencilIcon className="w-4 h-4" /></button>
                <button onClick={() => onDeleteBlock(block.id)} title="Delete" className="p-1.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/80"><TrashIcon className="w-4 h-4" /></button>
            </div>
            {isEditing ? (
                <div className="p-4 bg-[var(--input-background-color)] rounded-lg border border-dashed primary-border">
                    {renderEditView()}
                    <div className="flex justify-end gap-2 mt-2">
                        <button onClick={handleCancel} title="Cancel" className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full"><CloseIcon className="w-4 h-4" /></button>
                        <button onClick={handleSave} title="Save" className="p-1.5 text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full disabled:opacity-50" disabled={!!jsonError}><CheckIcon className="w-4 h-4" /></button>
                    </div>
                </div>
            ) : renderDisplayView()}
        </div>
    );
};

export default ProjectsPage;
