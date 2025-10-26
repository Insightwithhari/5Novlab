import React, { useState, useRef } from 'react';
import { useAppContext } from '../App';
import { AVATAR_OPTIONS, FAQ_DATA } from '../constants';
import { Pipeline, PipelineStep, AccentColor, BackgroundColor, Theme } from '../types';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon, 
    QuestionMarkCircleIcon, 
    SunIcon, 
    MoonIcon,
    FaqChatInputIllustration, 
    FaqPipelineIllustration, 
    FaqPinIllustration, 
    FaqShareIllustration, 
    FaqSettingsAppearanceIllustration 
} from '../components/icons';
import { THEME_CONFIG } from '../theme';

// Map string IDs to actual components to be rendered in the TSX file
const FaqIllustrations: Record<string, React.ReactNode> = {
    FaqChatInputIllustration: <FaqChatInputIllustration />,
    FaqPipelineIllustration: <FaqPipelineIllustration />,
    FaqPinIllustration: <FaqPinIllustration />,
    FaqShareIllustration: <FaqShareIllustration />,
    FaqSettingsAppearanceIllustration: <FaqSettingsAppearanceIllustration />,
};

const SettingsPage: React.FC = () => {
    const { 
        userName, setUserName, 
        userTitle, setUserTitle,
        avatar, setAvatar, 
        theme, setTheme,
        accentColor, setAccentColor,
        backgroundColor, setBackgroundColor,
        pipelines, setPipelines,
        logout
    } = useAppContext();

    const [isProfileExpanded, setIsProfileExpanded] = useState(false);
    const [isEditingPipeline, setIsEditingPipeline] = useState<Pipeline | null>(null);
    const [feedback, setFeedback] = useState('');
    const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'success'>('idle');
    const importFileRef = useRef<HTMLInputElement>(null);

    const handleReset = () => {
        if (window.confirm("Are you sure? This will delete all your projects, pipelines, chat history, and custom settings.")) {
            localStorage.clear();
            window.location.reload();
        }
    };
    
    const handleExportData = () => {
        const dataToExport: Record<string, any> = {};
        const keysToExport = ['userName', 'userTitle', 'avatar', 'theme', 'accentColor', 'backgroundColor', 'projects', 'pipelines', 'chatHistory_general', 'tourCompleted'];
        
        keysToExport.forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                try { dataToExport[key] = JSON.parse(item); } catch { dataToExport[key] = item; }
            }
        });

        // Also export project-specific chats
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('chatHistory_proj-')) {
                 dataToExport[key] = JSON.parse(localStorage.getItem(key) || '[]');
            }
        }

        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dr_rhesus_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => importFileRef.current?.click();

    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const importedData = JSON.parse(text);

                if (window.confirm("Importing will overwrite all current data. Proceed?")) {
                    Object.keys(importedData).forEach(key => {
                        const value = typeof importedData[key] === 'object' ? JSON.stringify(importedData[key]) : importedData[key];
                        localStorage.setItem(key, value);
                    });
                    alert("Import successful! The app will now reload.");
                    window.location.reload();
                }
            } catch (error) { alert("Import failed: Invalid backup file."); }
        };
        reader.readAsText(file);
    };

    const handleSavePipeline = (pipeline: Pipeline) => {
        setPipelines(prev => prev.find(p => p.id === pipeline.id) ? prev.map(p => p.id === pipeline.id ? pipeline : p) : [...prev, pipeline]);
        setIsEditingPipeline(null);
    };
    
    const handleDeletePipeline = (pipelineId: string) => {
        if(window.confirm("Delete this pipeline?")) setPipelines(prev => prev.filter(p => p.id !== pipelineId));
    };

    const handleFeedbackSubmit = () => {
        if (!feedback.trim()) return;
        setFeedbackStatus('success');
        setFeedback('');
        setTimeout(() => setFeedbackStatus('idle'), 3000);
    };
    
    if (isEditingPipeline) {
        return <PipelineEditor pipeline={isEditingPipeline} onSave={handleSavePipeline} onCancel={() => setIsEditingPipeline(null)} />;
    }
  
    return (
      <div className="p-4 md:p-8 min-h-full">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold primary-text mb-8">Settings</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <SettingsCard title="Profile">
                    {isProfileExpanded ? (
                        <div className="space-y-4">
                            <TextInput label="Display Name" value={userName} onChange={e => setUserName(e.target.value)} />
                            <TextInput label="Title" value={userTitle} onChange={e => setUserTitle(e.target.value)} />
                            <div>
                                <label className="block text-sm font-medium text-[var(--muted-foreground-color)] mb-2">Avatar</label>
                                <div className="flex flex-wrap gap-3">
                                    {AVATAR_OPTIONS.map(url => <AvatarOption key={url} url={url} selected={avatar} onClick={() => setAvatar(url)} />)}
                                </div>
                            </div>
                            <button onClick={() => setIsProfileExpanded(false)} className="mt-4 w-full text-center px-4 py-2 text-sm text-[var(--foreground-color)] bg-[var(--input-background-color)] border border-[var(--border-color)] hover:bg-[var(--border-color)] rounded-md">
                                Save and Collapse
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img src={avatar} alt="User Avatar" className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <p className="font-bold text-lg text-[var(--card-foreground-color)]">{userName}</p>
                                    <p className="text-sm text-[var(--muted-foreground-color)]">{userTitle}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsProfileExpanded(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--input-background-color)] rounded-md hover:bg-[var(--border-color)]">
                                <PencilIcon className="w-4 h-4" /> Edit
                            </button>
                        </div>
                    )}
                </SettingsCard>
                <SettingsCard title="Appearance">
                    <div className="space-y-6">
                        <ThemeSelector currentTheme={theme} onSelect={setTheme} />
                        <ColorPalette title="Accent Color" colors={Object.keys(THEME_CONFIG) as AccentColor[]} selected={accentColor} onSelect={color => setAccentColor(color as AccentColor)} type="accent" />
                        <ColorPalette title="Background Tone" colors={Object.keys(THEME_CONFIG.teal) as BackgroundColor[]} selected={backgroundColor} onSelect={color => setBackgroundColor(color as BackgroundColor)} type="background" />
                    </div>
                </SettingsCard>

                <SettingsCard title="Research Pipelines" actions={<button onClick={() => setIsEditingPipeline({id: `pipe-${Date.now()}`, name:'', description:'', steps:[]})} className="flex items-center gap-1 text-sm primary-bg text-white px-3 py-1 rounded-md"><PlusIcon className="w-4 h-4" /> New</button>}>
                    <div className="space-y-2">
                        {pipelines.length > 0 
                            ? pipelines.map(p => (
                                <div key={p.id} className="flex justify-between items-center p-2 bg-[var(--input-background-color)] rounded-md">
                                    <div>
                                        <p className="font-semibold text-[var(--card-foreground-color)]">{p.name}</p>
                                        <p className="text-xs text-[var(--muted-foreground-color)]">{p.description}</p>
                                    </div>
                                    <div className="flex gap-2 text-[var(--muted-foreground-color)]">
                                        <button onClick={() => setIsEditingPipeline(p)} className="p-1.5 hover:primary-text"><PencilIcon className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeletePipeline(p.id)} className="p-1.5 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            )) 
                            : <ExamplePipeline />
                        }
                    </div>
                </SettingsCard>
            </div>
            <div className="lg:col-span-1 space-y-8">
                <SettingsCard title="Help & Feedback">
                    <div className="space-y-2">
                        {FAQ_DATA.map((faq, i) => <FAQItem key={i} question={faq.question} answer={faq.answer} illustrationId={faq.illustrationId} />)}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                        <h3 className="text-md font-medium text-[var(--card-foreground-color)] mb-2">Send Feedback</h3>
                        <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} placeholder="Your feedback..." className="w-full bg-[var(--input-background-color)] p-3 rounded-md border border-[var(--border-color)] focus:primary-ring focus:outline-none resize-none" />
                        <button onClick={handleFeedbackSubmit} className="mt-2 px-4 py-2 primary-bg text-white text-sm font-semibold rounded-lg primary-bg-hover transition-colors">Submit</button>
                        {feedbackStatus === 'success' && <p className="text-emerald-500 text-sm mt-2">Feedback sent!</p>}
                    </div>
                </SettingsCard>
                <SettingsCard title="Data Management">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-r-lg mb-4 text-sm text-yellow-800 dark:text-yellow-300">
                        All data is stored locally. Export backups regularly.
                    </div>
                    <div className="space-y-3">
                        <button onClick={handleExportData} className="w-full px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors text-sm">Export Data</button>
                        <input type="file" ref={importFileRef} onChange={handleImportData} accept=".json" className="hidden" />
                        <button onClick={handleImportClick} className="w-full px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors text-sm">Import Data</button>
                        <button onClick={handleReset} className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors text-sm">Reset Application</button>
                    </div>
                </SettingsCard>
                 <button onClick={logout} className="w-full text-center px-4 py-2 text-sm text-[var(--foreground-color)] bg-[var(--card-background-color)] border border-[var(--border-color)] hover:bg-[var(--input-background-color)] rounded-md">Logout</button>
            </div>
          </div>
        </div>
      </div>
    );
};

// --- Sub Components ---
const SettingsCard: React.FC<{title: string, children: React.ReactNode, actions?: React.ReactNode}> = ({ title, children, actions }) => (
    <div className="bg-[var(--card-background-color)] p-6 rounded-lg shadow-sm border border-[var(--border-color)]">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[var(--card-foreground-color)]">{title}</h2>
            {actions}
        </div>
        {children}
    </div>
);
const TextInput: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-[var(--muted-foreground-color)] mb-1">{label}</label>
        <input type="text" value={value} onChange={onChange} className="w-full bg-[var(--input-background-color)] p-3 rounded-md border border-[var(--border-color)] focus:primary-ring focus:outline-none" />
    </div>
);
const AvatarOption: React.FC<{url: string, selected: string, onClick: () => void}> = ({ url, selected, onClick }) => (
    <button type="button" onClick={onClick} className={`w-14 h-14 rounded-full p-1 transition-all ${selected === url ? 'ring-2 primary-ring' : 'ring-1 ring-slate-300 dark:ring-slate-600 hover:ring-2 hover:primary-ring'}`}>
        <img src={url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
    </button>
);
const ThemeSelector: React.FC<{currentTheme: Theme, onSelect: (t: Theme) => void}> = ({ currentTheme, onSelect }) => (
    <div>
        <h3 className="text-md font-medium text-[var(--muted-foreground-color)] mb-2">Mode</h3>
        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => onSelect('light')} className={`p-4 rounded-lg border-2 ${currentTheme === 'light' ? 'primary-border' : 'border-[var(--border-color)]'}`}>
                <div className="flex items-center gap-2"><SunIcon className="w-5 h-5"/> Light</div>
            </button>
            <button onClick={() => onSelect('dark')} className={`p-4 rounded-lg border-2 ${currentTheme === 'dark' ? 'primary-border' : 'border-[var(--border-color)]'}`}>
                <div className="flex items-center gap-2"><MoonIcon className="w-5 h-5"/> Dark</div>
            </button>
        </div>
    </div>
);

const ColorPalette: React.FC<{title: string, colors: string[], selected: string, onSelect: (c: string) => void, type: 'accent' | 'background'}> = ({ title, colors, selected, onSelect, type }) => (
    <div>
        <h3 className="text-md font-medium text-[var(--muted-foreground-color)] mb-2">{title}</h3>
        <div className="flex flex-wrap gap-3">
            {colors.map(color => {
                const style: React.CSSProperties = {};
                if (type === 'accent') {
                    style.backgroundColor = THEME_CONFIG[color as AccentColor].slate.light['primary-color'];
                } else {
                    style.backgroundColor = THEME_CONFIG.teal[color as BackgroundColor].light['background-color'];
                    style.borderColor = THEME_CONFIG.teal[color as BackgroundColor].light['border-color'];
                }
                return (
                    <button key={color} onClick={() => onSelect(color)} className={`w-10 h-10 rounded-full capitalize text-xs flex items-center justify-center border-2 transition-all ${selected === color ? 'primary-border ring-2 primary-ring' : 'border-slate-300 dark:border-slate-600'}`} style={style}>
                       {type === 'background' && <div className={`w-4 h-4 rounded-full`} style={{backgroundColor: THEME_CONFIG.teal[color as BackgroundColor].dark['background-color']}}/>}
                    </button>
                )
            })}
        </div>
    </div>
);
const FAQItem: React.FC<{question: string, answer: string, illustrationId?: string}> = ({ question, answer, illustrationId }) => {
    const illustration = illustrationId ? FaqIllustrations[illustrationId] : null;
    return (
        <details className="p-3 bg-[var(--input-background-color)] rounded-lg text-sm group">
            <summary className="font-semibold cursor-pointer flex items-center gap-2 text-[var(--foreground-color)] list-none group-open:primary-text">
                <QuestionMarkCircleIcon className="w-5 h-5 primary-text flex-shrink-0 transition-colors duration-300" /> 
                <span className="flex-1">{question}</span>
                <span className="ml-auto group-open:rotate-90 transition-transform duration-300 transform-gpu">&#9656;</span>
            </summary>
            <div className="mt-2 text-[var(--muted-foreground-color)] pl-7 space-y-3">
                <p>{answer}</p>
                {illustration && (
                    <div className="p-2 border border-[var(--border-color)] rounded-md bg-[var(--card-background-color)]">
                        {illustration}
                    </div>
                )}
            </div>
        </details>
    );
};

const ExamplePipeline: React.FC = () => (
    <div className="p-4 bg-[var(--input-background-color)] rounded-lg border-2 border-dashed border-[var(--border-color)] opacity-60 pointer-events-none">
      <p className="text-xs font-semibold text-center text-[var(--muted-foreground-color)] mb-2">EXAMPLE</p>
      <div className="flex justify-between items-center p-2 bg-[var(--card-background-color)] rounded-md">
          <div>
              <p className="font-semibold text-[var(--muted-foreground-color)]">Full Protein Analysis</p>
              <p className="text-xs text-[var(--muted-foreground-color)]">Finds structure, runs BLAST, etc.</p>
          </div>
          <div className="flex gap-2 text-slate-400">
              <PencilIcon className="w-4 h-4" />
              <TrashIcon className="w-4 h-4" />
          </div>
      </div>
       <p className="text-sm text-center mt-3 text-[var(--muted-foreground-color)]">Automate multi-step research tasks by creating a new pipeline.</p>
    </div>
  );

const PipelineEditor: React.FC<{pipeline: Pipeline, onSave: (p: Pipeline) => void, onCancel: () => void}> = ({ pipeline, onSave, onCancel }) => {
    const [edited, setEdited] = useState(pipeline);

    const handleStepChange = (index: number, value: string) => {
        const newSteps = [...edited.steps];
        newSteps[index].prompt = value;
        setEdited({...edited, steps: newSteps});
    };
    const addStep = () => setEdited({...edited, steps: [...edited.steps, { id: `step-${Date.now()}`, prompt: '' }]});
    const removeStep = (index: number) => setEdited({...edited, steps: edited.steps.filter((_, i) => i !== index)});
    
    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold primary-text mb-6">Edit Pipeline</h1>
            <div className="space-y-4">
                <TextInput label="Pipeline Name" value={edited.name} onChange={e => setEdited({...edited, name: e.target.value})} />
                <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground-color)] mb-1">Description</label>
                    <textarea value={edited.description} onChange={e => setEdited({...edited, description: e.target.value})} rows={2} className="w-full bg-[var(--input-background-color)] p-3 rounded-md border border-[var(--border-color)] focus:primary-ring focus:outline-none resize-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground-color)] mb-2">Steps</label>
                    <div className="space-y-2">
                        {edited.steps.map((step, index) => (
                            <div key={step.id} className="flex items-center gap-2">
                                <span className="text-[var(--muted-foreground-color)] font-mono text-sm">{index+1}.</span>
                                <textarea value={step.prompt} onChange={e => handleStepChange(index, e.target.value)} placeholder="e.g., Visualize PDB ID {protein_name}" rows={2} className="flex-1 bg-[var(--input-background-color)] p-2 rounded-md border border-[var(--border-color)] resize-none"/>
                                <button onClick={() => removeStep(index)} className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addStep} className="mt-2 text-sm flex items-center gap-1 primary-text hover:underline"><PlusIcon className="w-4 h-4"/> Add Step</button>
                    <p className="text-xs text-[var(--muted-foreground-color)] mt-1">Use <code className="bg-slate-200 dark:bg-slate-600 px-1 rounded-sm">{'{protein_name}'}</code> as a placeholder for your target.</p>
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
                <button onClick={onCancel} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md text-sm">Cancel</button>
                <button onClick={() => onSave(edited)} className="px-4 py-2 primary-bg text-white rounded-md text-sm">Save Pipeline</button>
            </div>
        </div>
    );
};

export default SettingsPage;
