import React from 'react';
import { MenuIcon, CommandLineIcon, FilePlusIcon, ChevronLeftIcon } from './icons';
import type { Page } from '../types';
import { useAppContext } from '../App';
import ApiStatusIndicator from './ApiStatusIndicator';

interface HeaderProps {
    onToggleSidebar: () => void;
    currentPage: Page;
    onToggleCommandPalette: () => void;
}

const pageTitles: Record<Page, string> = {
    home: "Home",
    chatbot: "Dr. Rhesus",
    projects: "Projects",
    settings: "Settings",
    supervisor: "Supervisors",
    about: "About Us",
    contact: "Contact Us",
    quotes: "Quotes",
    snapshot: "Research Snapshot"
};

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, currentPage, onToggleCommandPalette }) => {
    const { apiStatus, activeProjectName, setActiveProjectId, startNewChat } = useAppContext();
    const title = pageTitles[currentPage] || "The Dream Lab";

    const renderTitle = () => {
        if (currentPage === 'chatbot' && activeProjectName) {
            return (
                <div className="flex items-center gap-2">
                    <button onClick={() => setActiveProjectId(null)} className="p-1 rounded-full hover:bg-[var(--input-background-color)] transition-colors">
                       <ChevronLeftIcon className="w-5 h-5"/>
                    </button>
                    <div className="flex flex-col items-start leading-tight">
                        <span className="text-sm font-normal text-[var(--muted-foreground-color)]">Project</span>
                        <h1 className="text-lg font-bold primary-text -mt-1">{activeProjectName}</h1>
                    </div>
                </div>
            );
        }
        return <h1 className="text-lg font-bold primary-text">{title}</h1>;
    };

    return (
        <header className="row-start-1 flex-shrink-0 h-16 bg-[var(--card-background-color)]/80 backdrop-blur-sm border-b border-[var(--border-color)] flex items-center justify-between px-4 z-20 noprint">
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-full hover:bg-[var(--input-background-color)] transition-colors"
                    aria-label="Open navigation menu"
                >
                    <MenuIcon className="w-6 h-6 text-[var(--muted-foreground-color)]" />
                </button>
                <ApiStatusIndicator status={apiStatus} />
            </div>
            
            {renderTitle()}

            <div className="flex items-center gap-1">
                {currentPage === 'chatbot' && (
                    <button
                        onClick={startNewChat}
                        className="p-2 rounded-full hover:bg-[var(--input-background-color)] transition-colors"
                        aria-label="Start a new chat"
                    >
                        <FilePlusIcon className="w-6 h-6 text-[var(--muted-foreground-color)]" />
                    </button>
                )}
                <button 
                    onClick={onToggleCommandPalette}
                    className="p-2 rounded-full hover:bg-[var(--input-background-color)] transition-colors"
                    aria-label="Open command palette"
                >
                    <CommandLineIcon className="w-6 h-6 text-[var(--muted-foreground-color)]" />
                </button>
            </div>
        </header>
    );
};

export default Header;
