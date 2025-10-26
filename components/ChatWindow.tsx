import React, { useEffect, useRef, useMemo } from 'react';
import type { Message } from '../types';
import MessageComponent from './Message';
import Loader from './Loader';
import { RhesusIcon, DocumentTextIcon, ChatBubbleIcon } from './icons';
import { useAppContext } from '../App';


interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onPromptClick: (prompt: string) => void;
  onToggleAudio: (messageId: string, text: string) => void;
  onReply: (message: Message) => void;
  speakingMessageId: string | null;
}

const SuggestionCard: React.FC<{ title: string; prompt: string; icon: React.ReactNode; onClick: (prompt: string) => void; }> = ({ title, prompt, icon, onClick }) => {
    return (
        <button
            onClick={() => onClick(prompt)}
            className="p-4 bg-[var(--card-background-color)] border border-[var(--border-color)] rounded-lg text-left hover:bg-[var(--input-background-color)] transition-colors w-full"
        >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-[var(--input-background-color)] rounded-full primary-text">{icon}</div>
              <h3 className="font-semibold text-sm text-[var(--foreground-color)]">{title}</h3>
            </div>
        </button>
    );
};


const ChatWelcome: React.FC<{ onPromptClick: (prompt: string) => void; }> = ({ onPromptClick }) => {
    const { userName } = useAppContext();

    const suggestions = [
      { title: "Visualize the COVID-19 Spike Protein", prompt: "Show me 6M0J", icon: <RhesusIcon className="w-5 h-5" /> },
      { title: "Summarize recent papers on CRISPR-Cas9", prompt: "Summarize recent papers on CRISPR-Cas9", icon: <DocumentTextIcon className="w-5 h-5"/>},
      { title: "Run a BLAST search for human insulin", prompt: "Run a BLAST search for human insulin", icon: <ChatBubbleIcon className="w-5 h-5"/> },
      { title: "Explain the mechanism of PCR", prompt: "Explain the mechanism of PCR in simple terms", icon: <RhesusIcon className="w-5 h-5"/> }
    ];

    return (
        <div className="flex-1 flex flex-col justify-center items-center p-8 animate-fadeIn">
            <div className="w-full max-w-4xl mx-auto">
                 <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground-color)]">
                    <span className="primary-text bg-gradient-to-r from-teal-400 to-sky-500 bg-clip-text text-transparent animate-gradient-x">
                        Hello, {userName}.
                    </span>
                </h1>
                <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--muted-foreground-color)] mt-1">How can I help you today?</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
                    {suggestions.map(s => (
                        <SuggestionCard key={s.title} {...s} onClick={onPromptClick} />
                    ))}
                </div>
            </div>
        </div>
    );
};


const ChatWindow: React.FC<ChatWindowProps> = ({ 
    messages, isLoading, onPromptClick, 
    onToggleAudio, onReply, speakingMessageId
}) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {messages.length === 0 && !isLoading ? (
        <ChatWelcome onPromptClick={onPromptClick} />
      ) : (
        <div className="flex-1 p-4 space-y-6">
          {messages.map((msg) => (
              <MessageComponent key={msg.id} message={msg} onToggleAudio={onToggleAudio} onReply={onReply} speakingMessageId={speakingMessageId} />
          ))}
          {isLoading && <div className="w-full max-w-4xl mx-auto px-4"><Loader /></div>}
          <div ref={endOfMessagesRef} />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
