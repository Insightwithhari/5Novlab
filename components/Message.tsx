import React from 'react';
import { Message, MessageAuthor } from '../types';
import { useAppContext } from '../App';
import { SpeakerWaveIcon, ReplyIcon, SpeakerXMarkIcon } from './icons';

interface MessageProps {
  message: Message;
  onToggleAudio: (messageId: string, text: string) => void;
  onReply: (message: Message) => void;
  speakingMessageId: string | null;
}

const MessageComponent: React.FC<MessageProps> = ({ message, onToggleAudio, onReply, speakingMessageId }) => {
  const { avatar, userName } = useAppContext();
  const isUser = message.author === MessageAuthor.USER;
  const isRhesus = message.author === MessageAuthor.RHESUS;
  const isSpeaking = speakingMessageId === message.id;

  if (message.author === MessageAuthor.SYSTEM) {
    return (
      <div className="text-center text-xs text-slate-500 dark:text-slate-400 py-2 italic animate-messageFadeIn">
        {message.rawContent}
      </div>
    );
  }

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 animate-messageFadeIn group ${isUser ? 'flex flex-col items-end' : ''}`}>
      <div className={`flex items-start gap-4 w-full ${isUser ? 'flex-row-reverse' : ''}`}>
        
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-transparent mt-1">
          {isUser ? (
            <img src={avatar} alt="User Avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <img src="https://envs.sh/icl.jpg" alt="Dr. Rhesus Avatar" className="w-8 h-8 rounded-full object-cover" />
          )}
        </div>
        
        <div className={`flex flex-col w-full overflow-hidden ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
            {/* Author Name */}
            <span className="font-bold text-[var(--foreground-color)]">{isUser ? userName : 'Dr. Rhesus'}</span>
            
             {/* Action Buttons */}
            <div className={`flex items-center gap-1 ${isUser ? 'mr-auto' : 'ml-auto'}`}>
              {isRhesus && message.rawContent && (
                  <button 
                      onClick={() => onToggleAudio(message.id, message.rawContent!)}
                      className="p-1 text-[var(--muted-foreground-color)] hover:primary-text rounded-full hover:bg-[var(--input-background-color)] transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Read message aloud"
                  >
                      {isSpeaking ? <SpeakerXMarkIcon className="w-4 h-4 text-red-500" /> : <SpeakerWaveIcon className="w-4 h-4" />}
                  </button>
              )}
               <button 
                  onClick={() => onReply(message)}
                  className="p-1 text-[var(--muted-foreground-color)] hover:primary-text rounded-full hover:bg-[var(--input-background-color)] transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Reply to this message"
              >
                  <ReplyIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ReplyTo Snippet */}
          {message.replyTo && (
              <div className={`mt-1 mb-2 pl-2 border-l-2 border-slate-300 dark:border-slate-600 ${isUser ? 'text-right pr-2 border-l-0 border-r-2' : ''}`}>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Reply to {message.replyTo.author}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2">
                      {message.replyTo.content}
                  </p>
              </div>
          )}

          {/* Content */}
          <div className={`prose prose-sm md:prose-base max-w-none prose-slate dark:prose-invert ${isUser ? 'bg-[var(--input-background-color)] p-3 rounded-xl' : ''}`}>
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MessageComponent);
