import React, { useState } from 'react';
import { useAppContext } from '../App';
import { SUPERVISOR_QUOTE } from '../constants';
import { ChatBubbleIcon, ClipboardListIcon, RhesusIcon, DocumentTextIcon } from '../components/icons';

const DashboardCard: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = React.memo(({ title, children, icon }) => (
  <div className="bg-[var(--card-background-color)]/50 backdrop-blur-sm rounded-lg border border-[var(--border-color)] p-6 transition-all duration-300 hover:shadow-xl hover:border-[var(--primary-color)]/50 h-full">
    <div className="flex items-center gap-4 mb-3">
      <div className="w-10 h-10 rounded-lg bg-[var(--input-background-color)] flex items-center justify-center primary-text">
        {icon}
      </div>
      <h3 className="font-bold text-lg text-[var(--card-foreground-color)]">{title}</h3>
    </div>
    <div className="text-sm text-[var(--muted-foreground-color)]">
      {children}
    </div>
  </div>
));

const QuickStartCard: React.FC<{ title: string; description: string; icon: React.ReactNode; prompt: string; }> = ({ title, description, icon, prompt }) => {
    const handleAction = () => {
        sessionStorage.setItem('initialQuery', prompt);
        window.location.hash = '#chatbot';
    };

    return (
        <button onClick={handleAction} className="text-left w-full h-full p-4 bg-[var(--card-background-color)] rounded-lg border border-[var(--border-color)] transition-all duration-300 hover:shadow-lg hover:border-[var(--primary-color)]/50 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-2">
                <div className="primary-text">{icon}</div>
                <h4 className="font-semibold text-[var(--card-foreground-color)]">{title}</h4>
            </div>
            <p className="text-xs text-[var(--muted-foreground-color)]">{description}</p>
        </button>
    );
};


const HomePage: React.FC = () => {
  const { userName, projects } = useAppContext();
  const [homeInput, setHomeInput] = useState('');

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 3);

  const handleHomeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!homeInput.trim()) return;
      sessionStorage.setItem('initialQuery', homeInput);
      window.location.hash = '#chatbot';
  };

  return (
    <div className="min-h-full p-4 md:p-8 relative">
        <div 
            className="absolute inset-0 z-0 bg-cover bg-center opacity-25 dark:opacity-30 animate-subtle-pan"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
        ></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[var(--background-color)]/40 to-[var(--background-color)]"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="mb-12 text-center animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground-color)]">
            Welcome back, <span className="primary-text bg-gradient-to-r from-teal-400 to-sky-500 bg-clip-text text-transparent animate-gradient-x">{userName}</span>.
          </h1>
          <p className="mt-2 text-lg text-[var(--muted-foreground-color)]">
            What will you discover today?
          </p>
          <form onSubmit={handleHomeSubmit} className="mt-6 max-w-2xl mx-auto">
              <input
                type="text"
                value={homeInput}
                onChange={(e) => setHomeInput(e.target.value)}
                placeholder="Ask Dr. Rhesus anything... e.g., 'Show me the structure of caffeine'"
                className="w-full p-4 bg-[var(--card-background-color)]/80 backdrop-blur-sm border border-[var(--border-color)] rounded-full shadow-lg focus:outline-none focus:ring-2 primary-ring transition-all"
              />
          </form>
        </header>

        <div className="mb-12 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-bold text-center mb-6 text-[var(--foreground-color)]">Quick Start</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <QuickStartCard 
                    title="Visualize a Molecule"
                    description="View the 3D structure of the COVID-19 Spike Protein."
                    icon={<RhesusIcon className="w-6 h-6" />}
                    prompt="Show me 6M0J"
                />
                <QuickStartCard 
                    title="Explore Literature"
                    description="Get a summary of recent scientific papers on CRISPR-Cas9."
                    icon={<DocumentTextIcon className="w-6 h-6" />}
                    prompt="Summarize recent papers on CRISPR-Cas9"
                />
                <QuickStartCard 
                    title="Run a BLAST Search"
                    description="Find proteins with sequences similar to human insulin."
                    icon={<ChatBubbleIcon className="w-6 h-6" />}
                    prompt="Run a BLAST search for human insulin"
                />
            </div>
        </div>

        <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <DashboardCard title="Recent Projects" icon={<ClipboardListIcon className="w-6 h-6" />}>
              {recentProjects.length > 0 ? (
                <ul className="space-y-3">
                  {recentProjects.map(p => (
                    <li key={p.id}>
                      <a href={`#projects`} className="block p-3 -m-3 rounded-md hover:bg-[var(--input-background-color)] transition-colors">
                        <p className="font-semibold text-[var(--card-foreground-color)]">{p.title}</p>
                        <p className="text-xs text-[var(--muted-foreground-color)] line-clamp-1">{p.description}</p>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Your recent work will appear here. Pin findings from the chatbot to a <a href="#projects" className="font-semibold primary-text hover:underline">new project!</a></p>
              )}
            </DashboardCard>
        </div>

        {/* Supervisor Quote */}
        <div className="mt-16 text-center animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            <blockquote className="text-md italic text-[var(--muted-foreground-color)] max-w-3xl mx-auto">
                "{SUPERVISOR_QUOTE.text}"
            </blockquote>
            <cite className="block mt-4 font-semibold primary-text not-italic">
                - {SUPERVISOR_QUOTE.author}
            </cite>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
