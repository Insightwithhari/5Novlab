import React from 'react';
import type { Page } from '../types';
import LiveClock from './LiveClock';
import { RhesusIcon, HomeIcon, ChatBubbleIcon, ClipboardListIcon, SettingsIcon, FilePlusIcon } from './icons';
import { useAppContext } from '../App';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: Page;
  onToggleCommandPalette: () => void;
}

// FIX: Added isOpen prop to NavLink to control animations.
const NavLink: React.FC<{ page: Page; label: string; delay: number; icon: React.ReactNode; isPrimary: boolean; customOnClick?: () => void; onClose: () => void; isActive: boolean; isOpen: boolean; }> = ({ page, label, delay, icon, isPrimary, customOnClick, onClose, isActive, isOpen }) => {
    
    const activeClasses = isPrimary 
      ? 'bg-slate-700 text-white primary-border border-l-4' 
      : 'bg-slate-700/50 text-white';
    const inactiveClasses = isPrimary 
      ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white border-l-4 border-transparent' 
      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white';
    
    const textStyle = isPrimary ? 'font-semibold' : 'font-mono text-sm';
    const padding = isPrimary ? 'px-4 py-3' : 'px-4 py-2';

    const handleClick = (e: React.MouseEvent) => {
        if (customOnClick) {
            e.preventDefault();
            customOnClick();
        }
        onClose();
    };

    return (
      <li 
        className={`transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-10'}`}
        style={{ transitionDelay: `${isOpen ? delay : 0}ms`}}
      >
        <a
          href={`#${page}`}
          onClick={handleClick}
          className={`w-full text-left block transition-all duration-300 flex items-center gap-3 rounded-r-md ${padding} ${textStyle} ${isActive ? activeClasses : inactiveClasses}`}
        >
          {icon}
          <span>{label}</span>
        </a>
      </li>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPage, onToggleCommandPalette }) => {
  const { recentChats, activeProjectId, setActiveProjectId, startNewChat, isNewChat, setIsNewChat } = useAppContext();

  const handleRecentChatClick = (id: string | null) => {
    setActiveProjectId(id);
    setIsNewChat(false);
    onClose();
    window.location.hash = '#chatbot';
  };

  const navItemsPrimary: { page: Page; label: string; icon: React.ReactNode, customOnClick?: () => void }[] = [
    { page: 'home', label: 'Home', icon: <HomeIcon className="w-5 h-5" /> },
    { page: 'chatbot', label: 'Chatbot', icon: <ChatBubbleIcon className="w-5 h-5" /> },
    { page: 'projects', label: 'Projects', icon: <ClipboardListIcon className="w-5 h-5" /> },
    { page: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  const navItemsSecondary: { page: Page; label: string }[] = [
    { page: 'supervisor', label: 'Supervisor Page' },
    { page: 'about', label: 'About Us' },
    { page: 'contact', label: 'Contact Us' },
    { page: 'quotes', label: 'Quotes' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sidebar Panel */}
      <aside
        className={`row-start-1 row-span-3 col-start-1 fixed top-0 left-0 h-full w-64 bg-slate-800 shadow-xl z-40 transform transition-transform duration-300 ease-in-out flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex`}
      >
        <div className="p-4 border-b border-slate-700 flex items-center gap-3">
          <RhesusIcon className="w-8 h-8 text-white" />
          <h2 className="text-xl font-bold text-white">The Dream Lab</h2>
        </div>
        <div className="p-2 border-b border-slate-700">
            <button onClick={onToggleCommandPalette} className="w-full flex items-center justify-between text-sm p-2 rounded-md bg-slate-900 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-colors">
                <span>Quick Command</span>
                <span className="text-xs border border-slate-600 rounded px-1.5 py-0.5">⌘K</span>
            </button>
        </div>
        <nav className="p-2 flex-grow overflow-y-auto">
          {/* Primary Navigation */}
          <ul className="space-y-1">
            {navItemsPrimary.map((item, index) => (
                <NavLink 
                    key={item.page}
                    page={item.page} 
                    label={item.label} 
                    delay={100 + index * 50}
                    icon={item.icon}
                    isPrimary={true}
                    isActive={currentPage === item.page}
                    onClose={onClose}
                    customOnClick={item.customOnClick}
                    isOpen={isOpen}
                />
            ))}
          </ul>
          
          {currentPage === 'chatbot' && (
            <>
              <hr className="my-4 border-slate-700" />
              <div 
                className={`transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-10'}`}
                style={{ transitionDelay: `${isOpen ? 300 : 0}ms`}}
              >
                  <div className="px-2 flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-slate-400">Recent Chats</h3>
                    <button onClick={() => { startNewChat(); onClose(); }} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md" title="New Chat">
                        <FilePlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <ul className="space-y-1 text-sm">
                      {recentChats.map(chat => {
                          const isActive = !isNewChat && chat.id === (activeProjectId || 'general');
                          return (
                              <li key={chat.id}>
                                  <button 
                                      onClick={() => handleRecentChatClick(chat.type === 'general' ? null : chat.id)}
                                      className={`w-full text-left p-2 rounded-md truncate ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700/50'}`}
                                  >
                                      {chat.title}
                                      {chat.type === 'project' && <span className="block text-xs text-teal-400 opacity-80">{chat.projectName}</span>}
                                  </button>
                              </li>
                          )
                      })}
                  </ul>
              </div>
            </>
          )}

          <hr className="my-4 border-slate-700" />

          {/* Secondary Navigation */}
          <ul className="space-y-1">
             {navItemsSecondary.map((item, index) => (
                <NavLink 
                    key={item.page}
                    page={item.page}
                    label={item.label}
                    delay={300 + index * 50}
                    icon={<span className="w-5 h-5"></span>}
                    isPrimary={false}
                    isActive={currentPage === item.page}
                    onClose={onClose}
                    isOpen={isOpen}
                />
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-700">
            <LiveClock />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
