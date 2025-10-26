import React from 'react';
import type { Page } from '../types';
import { HomeIcon, ChatBubbleIcon, ClipboardListIcon, SettingsIcon } from './icons';
import { useAppContext } from '../App';

interface BottomNavBarProps {
    currentPage: Page;
}

const NavLink: React.FC<{
    page: Page;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    customOnClick?: () => void;
}> = ({ page, label, icon, isActive, customOnClick }) => {
    const activeClasses = 'primary-text';
    const inactiveClasses = 'text-[var(--muted-foreground-color)] hover:primary-text';
    
    const handleClick = (e: React.MouseEvent) => {
        if (customOnClick) {
            e.preventDefault();
            customOnClick();
        }
    };

    return (
        <a href={`#${page}`} onClick={handleClick} className={`relative flex-1 flex flex-col items-center justify-center p-2 transition-colors duration-300 ${isActive ? activeClasses : inactiveClasses}`}>
             {isActive && (
                <span className="absolute inset-x-4 top-1 h-8 primary-bg opacity-10 rounded-full" />
             )}
            <div className="relative z-10">{icon}</div>
            <span className="text-xs font-medium relative z-10">{label}</span>
        </a>
    );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentPage }) => {
    const navItems: { page: Page; label: string; icon: React.ReactNode, customOnClick?: () => void }[] = [
        { page: 'home', label: 'Home', icon: <HomeIcon className="w-6 h-6" /> },
        { page: 'chatbot', label: 'Chatbot', icon: <ChatBubbleIcon className="w-6 h-6" /> },
        { page: 'projects', label: 'Projects', icon: <ClipboardListIcon className="w-6 h-6" /> },
        { page: 'settings', label: 'Settings', icon: <SettingsIcon className="w-6 h-6" /> },
    ];
    
    return (
        <nav className="row-start-3 flex-shrink-0 h-16 bg-[var(--card-background-color)]/80 backdrop-blur-sm border-t border-[var(--border-color)] flex z-30 md:hidden">
            {navItems.map(item => (
                <NavLink 
                    key={item.page}
                    page={item.page}
                    label={item.label}
                    icon={item.icon}
                    isActive={currentPage === item.page}
                    customOnClick={item.customOnClick}
                />
            ))}
        </nav>
    );
};

export default BottomNavBar;
