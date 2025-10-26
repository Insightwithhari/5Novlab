import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNavBar from './components/BottomNavBar';
import HomePage from './pages/HomePage';
import ChatbotPage from './pages/ChatbotPage';
import ProjectsPage from './pages/ProjectsPage';
import SettingsPage from './pages/SettingsPage';
import SupervisorPage from './pages/SupervisorPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';
import QuotesPage from './pages/QuotesPage';
import LoginPage from './pages/LoginPage';
import SnapshotPage from './pages/SnapshotPage';
import CommandPalette from './components/CommandPalette';
import DrRhesusPopup from './components/DrRhesusPopup';
import { RhesusIcon } from './components/icons';

import { AVATAR_OPTIONS } from './constants';
import { Page, Theme, Project, Pipeline, AccentColor, BackgroundColor, Snapshot, ContentType, ApiStatus, MessageAuthor, Message, RecentChat, AppContextType } from './types';
import { THEME_CONFIG } from './theme';

const AppContext = createContext<AppContextType | null>(null);
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within an AppProvider');
    return context;
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const session = localStorage.getItem('userSession');
    if (!session) return false;
    try {
        const { expiresAt } = JSON.parse(session);
        return Date.now() < expiresAt;
    } catch (e) {
        return false;
    }
  });

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isRhesusPopupOpen, setRhesusPopupOpen] = useState(false);
  
  // --- Global State ---
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => (localStorage.getItem('accentColor') as AccentColor) || 'teal');
  const [backgroundColor, setBackgroundColorState] = useState<BackgroundColor>(() => (localStorage.getItem('backgroundColor') as BackgroundColor) || 'slate');
  const [userName, setUserNameState] = useState<string>(() => localStorage.getItem('userName') || 'Scientist');
  const [userTitle, setUserTitleState] = useState<string>(() => localStorage.getItem('userTitle') || 'Bioinformatics Researcher');
  const [avatar, setAvatarState] = useState<string>(() => localStorage.getItem('avatar') || AVATAR_OPTIONS[0]);
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem('projects');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      // FIX: Ensure unknown error type is converted to string for logging.
      console.error("Failed to parse projects from localStorage:", String(error));
      return [];
    }
  });
  
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    const lastId = localStorage.getItem('lastActiveChatId');
    return lastId === 'general' ? null : lastId;
  });

  const [apiStatus, setApiStatus] = useState<ApiStatus>('idle');
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  
  const [isNewChat, setIsNewChat] = useState<boolean>(() => {
    // If there's no record of a last active chat, start fresh.
    return !localStorage.getItem('lastActiveChatId');
  });

  const [pipelines, setPipelines] = useState<Pipeline[]>(() => {
    const storedPipelines = localStorage.getItem('pipelines');
    if (storedPipelines) {
        try {
            return JSON.parse(storedPipelines);
        } catch (error) {
            // FIX: Ensure unknown error type is converted to string for logging.
            console.error("Failed to parse pipelines from localStorage:", String(error));
        }
    }
    // If nothing in storage, or if parsing failed, return default example.
    return [
      {
        id: 'pipe-example-1',
        name: 'Full Protein Analysis',
        description: 'Finds structure, runs BLAST, and searches literature.',
        steps: [
          { id: 'step-1', prompt: 'find best structure for {protein_name}' },
          { id: 'step-2', prompt: 'run blast on {protein_name}' },
          { id: 'step-3', prompt: 'summarize literature about {protein_name}' },
        ],
      },
    ];
  });

  // Derived state for active project name
  const activeProjectName = useMemo(() => {
    return projects.find(p => p.id === activeProjectId)?.title;
  }, [projects, activeProjectId]);

  // --- State Setters with localStorage persistence ---
  const setTheme = (newTheme: Theme) => { setThemeState(newTheme); localStorage.setItem('theme', newTheme); };
  const setAccentColor = (newColor: AccentColor) => { setAccentColorState(newColor); localStorage.setItem('accentColor', newColor); };
  const setBackgroundColor = (newColor: BackgroundColor) => { setBackgroundColorState(newColor); localStorage.setItem('backgroundColor', newColor); };
  const setUserName = (newName: string) => { setUserNameState(newName); localStorage.setItem('userName', newName); };
  const setUserTitle = (newTitle: string) => { setUserTitleState(newTitle); localStorage.setItem('userTitle', newTitle); };
  const setAvatar = (newAvatar: string) => { setAvatarState(newAvatar); localStorage.setItem('avatar', newAvatar); };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('userSession');
  };

  const startNewChat = () => {
    setActiveProjectId(null);
    setIsNewChat(true);
    window.location.hash = '#chatbot';
  };

  const handleLogin = () => {
    const session = {
        expiresAt: Date.now() + 10 * 60 * 60 * 1000 // 10 hours
    };
    localStorage.setItem('userSession', JSON.stringify(session));
    setIsAuthenticated(true);
  };
  
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      const page = hash.split('/')[0] as Page || 'home';
      setCurrentPage(page);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const config = THEME_CONFIG[accentColor]?.[backgroundColor]?.[theme];
    if (config) {
      Object.entries(config).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme, accentColor, backgroundColor]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setCommandPaletteOpen(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  useEffect(() => {
    if (projects) localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (pipelines) localStorage.setItem('pipelines', JSON.stringify(pipelines));
  }, [pipelines]);
  
  // Save the last active chat context to local storage
  useEffect(() => {
    localStorage.setItem('lastActiveChatId', activeProjectId || 'general');
  }, [activeProjectId]);
  
  // Load recent chats from localStorage on initial mount
  useEffect(() => {
    const loadRecentChats = () => {
      const chats: RecentChat[] = [];
      const allProjects = projects; // Use state projects which is already loaded

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('chatHistory_')) {
          try {
            const history: Message[] = JSON.parse(localStorage.getItem(key) || '[]');
            const firstUserMessage = history.find(m => m.author === MessageAuthor.USER);
            
            if (!firstUserMessage) continue; // Don't show empty chats

            const id = key.replace('chatHistory_', '');
            let title = firstUserMessage.rawContent?.substring(0, 40) || 'Untitled Chat';
            if ((firstUserMessage.rawContent?.length || 0) > 40) title += '...';

            if (id === 'general') {
              chats.push({ id, title, type: 'general' });
            } else {
              const project = allProjects.find(p => p.id === id);
              if (project) {
                chats.push({ id, title, type: 'project', projectName: project.title });
              }
            }
          } catch (e) {
            // FIX: Converted unknown error type 'e' to a string to prevent a TypeScript error.
            console.error('Could not parse chat history for key:', key, String(e));
          }
        }
      }
      setRecentChats(chats);
    };
    loadRecentChats();
  }, [projects]);

  if (!isAuthenticated) {
    return <LoginPage onAuthenticate={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'chatbot': return <ChatbotPage />;
      case 'projects': return <ProjectsPage />;
      case 'settings': return <SettingsPage />;
      case 'supervisor': return <SupervisorPage />;
      case 'about': return <AboutUsPage />;
      case 'contact': return <ContactUsPage />;
      case 'quotes': return <QuotesPage />;
      case 'snapshot': return <SnapshotPage />;
      default: return <HomePage />;
    }
  };
  
  const appContextValue: AppContextType = useMemo(() => ({
    theme, setTheme, accentColor, setAccentColor, backgroundColor, setBackgroundColor,
    userName, setUserName, userTitle, setUserTitle, avatar, setAvatar,
    projects, setProjects, pipelines, setPipelines, logout, apiStatus, setApiStatus,
    activeProjectId, setActiveProjectId, activeProjectName,
    recentChats, setRecentChats, startNewChat,
    isNewChat, setIsNewChat
  }), [
    theme, accentColor, backgroundColor, userName, userTitle, avatar, projects,
    pipelines, apiStatus, activeProjectId, activeProjectName, recentChats, isNewChat
  ]);

  const fabVisible = currentPage !== 'snapshot' && currentPage !== 'chatbot';

  return (
    <AppContext.Provider value={appContextValue}>
      <div className="h-dvh w-screen flex flex-col antialiased">
        <Header 
          onToggleSidebar={() => setSidebarOpen(true)} 
          currentPage={currentPage}
          onToggleCommandPalette={() => setCommandPaletteOpen(true)}
        />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} currentPage={currentPage} onToggleCommandPalette={() => setCommandPaletteOpen(true)} />
        <main className="flex-grow overflow-y-auto">
          {renderPage()}
        </main>
        <BottomNavBar currentPage={currentPage} />
        <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
        
        <button
          onClick={() => setRhesusPopupOpen(true)}
          className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30 w-14 h-14 primary-bg text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out
            ${fabVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
          aria-label="About Dr. Rhesus"
        >
          <RhesusIcon className="w-8 h-8" />
        </button>
        <DrRhesusPopup isOpen={isRhesusPopupOpen} onClose={() => setRhesusPopupOpen(false)} />

      </div>
    </AppContext.Provider>
  );
};

export default App;
