import React, { useState } from 'react';
import { SUPERVISOR_PASSWORD } from '../constants';
import { RhesusIcon, ChatBubbleIcon, ClipboardListIcon, PlayIcon } from '../components/icons';

interface LoginPageProps {
  onAuthenticate: () => void;
}

const Feature: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center text-teal-300">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-slate-400">{description}</p>
        </div>
    </div>
);


const LoginPage: React.FC<LoginPageProps> = ({ onAuthenticate }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === SUPERVISOR_PASSWORD) {
            setError('');
            onAuthenticate();
        } else {
            setError('Incorrect password. Please try again.');
            setPassword('');
        }
    };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 shadow-2xl lg:rounded-xl overflow-hidden min-h-screen lg:min-h-[600px] bg-white dark:bg-slate-800">
            {/* Left Panel - Info */}
            <div className="flex flex-col justify-center p-8 sm:p-10 bg-slate-800 text-white relative gap-8">
                 <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>
                 <div className="absolute top-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl"></div>
                 <div className="absolute bottom-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold">The Dream Lab</h1>
                    <p className="mt-2 text-slate-300">Your AI-Powered Bioinformatics Command Center.</p>
                </div>
                <div className="relative z-10 space-y-6 sm:hidden lg:block">
                    <Feature icon={<ChatBubbleIcon className="w-6 h-6"/>} title="AI-Powered Chat" description="Converse with an expert assistant for complex bioinformatics queries." />
                    <Feature icon={<RhesusIcon className="w-6 h-6"/>} title="Interactive Visualizers" description="View and manipulate 3D protein structures directly in your chat." />
                    <Feature icon={<ClipboardListIcon className="w-6 h-6"/>} title="Dynamic Notebooks" description="Organize your findings, charts, and summaries into editable lab notebooks." />
                    <Feature icon={<PlayIcon className="w-6 h-6"/>} title="Automated Pipelines" description="Create and run multi-step workflows to automate your research tasks." />
                </div>
                <div className="relative z-10 text-xs text-slate-500 mt-auto">&copy; {new Date().getFullYear()} The Dream Lab. All Rights Reserved.</div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex flex-col items-center justify-center p-8 md:p-12 bg-[var(--card-background-color)]">
                <div className="w-full max-w-sm text-center">
                    <h2 className="text-3xl font-bold text-[var(--foreground-color)]">Welcome Back</h2>
                    <p className="mt-2 text-[var(--muted-foreground-color)]">Enter the password to access your dashboard.</p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full text-lg text-center tracking-widest bg-[var(--input-background-color)] p-3 rounded-md border border-[var(--border-color)] focus:outline-none focus:ring-2 primary-ring"
                            placeholder="••••••••"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button
                            type="submit"
                            className="w-full py-3 primary-bg text-white font-semibold rounded-lg shadow-lg primary-bg-hover transition-all transform hover:scale-105"
                        >
                            Access Platform
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;
