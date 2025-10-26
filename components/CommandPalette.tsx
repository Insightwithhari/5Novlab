import React, { useState, useEffect, useRef } from 'react';
import { HomeIcon, ChatBubbleIcon, ClipboardListIcon, SettingsIcon, PlusIcon } from './icons';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { name: 'Home', action: () => (window.location.hash = '#home'), icon: <HomeIcon className="w-5 h-5" /> },
    { name: 'Chatbot', action: () => (window.location.hash = '#chatbot'), icon: <ChatBubbleIcon className="w-5 h-5" /> },
    { name: 'Projects', action: () => (window.location.hash = '#projects'), icon: <ClipboardListIcon className="w-5 h-5" /> },
    { name: 'Settings', action: () => (window.location.hash = '#settings'), icon: <SettingsIcon className="w-5 h-5" /> },
    { name: 'New Project', action: () => (window.location.hash = '#projects'), icon: <PlusIcon className="w-5 h-5" /> }, // Simplified: goes to projects page
  ];

  const filteredCommands = commands.filter(cmd => cmd.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearch('');
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const command = filteredCommands[activeIndex];
      if (command) {
        command.action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };
  
  const handleSelect = (command: typeof commands[0]) => {
      command.action();
      onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-[var(--popover-background-color)] rounded-lg shadow-2xl border border-[var(--border-color)] transform transition-all duration-200 animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-2 border-b border-[var(--border-color)]">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className="w-full bg-transparent p-2 text-[var(--popover-foreground-color)] placeholder-slate-400 focus:outline-none"
          />
        </div>
        <ul className="p-2 max-h-80 overflow-y-auto">
          {filteredCommands.length > 0 ? filteredCommands.map((cmd, index) => (
            <li
              key={cmd.name}
              onClick={() => handleSelect(cmd)}
              className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${index === activeIndex ? 'primary-bg text-white' : 'hover:bg-[var(--input-background-color)]'}`}
            >
              {cmd.icon}
              <span>{cmd.name}</span>
            </li>
          )) : (
            <li className="p-4 text-center text-sm text-[var(--muted-foreground-color)]">No commands found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CommandPalette;