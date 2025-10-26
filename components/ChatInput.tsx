import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { SendIcon, PaperclipIcon, PlayIcon, MicrophoneIcon, StopCircleIcon, CloseIcon } from './icons';
import type { Message } from '../types';

interface ChatInputProps {
  onSendMessage: (message: string, file?: File, replyTo?: Message | null) => void;
  isLoading: boolean;
  onRunPipeline: () => void;
  input: string;
  setInput: (value: string) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  isSpeechSupported: boolean;
  replyingTo: Message | null;
  onCancelReply: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
    onSendMessage, isLoading, onRunPipeline, 
    input, setInput, isRecording, onToggleRecording, isSpeechSupported,
    replyingTo, onCancelReply
}) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useLayoutEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      const scrollHeight = ta.scrollHeight;
      // Set a max height (e.g., 200px)
      if (scrollHeight > 200) {
        ta.style.height = '200px';
        ta.style.overflowY = 'auto';
      } else {
        ta.style.height = `${scrollHeight}px`;
        ta.style.overflowY = 'hidden';
      }
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || (!input.trim() && !file)) return;
    onSendMessage(input, file || undefined, replyingTo);
    setInput('');
    setFile(null);
    onCancelReply();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
     if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const showSendButton = !isRecording && (!!input.trim() || !!file);

  return (
    <div className="flex-shrink-0 w-full px-4 pb-4 pt-2 bg-gradient-to-t from-[var(--background-color)] via-[var(--background-color)] to-transparent">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdb"
        />

        <div className="w-full max-w-4xl mx-auto">
            {replyingTo && (
                <div className="mb-2 p-2 bg-[var(--card-background-color)] border border-[var(--border-color)] rounded-lg text-sm shadow-sm">
                    <div className="flex justify-between items-center">
                        <p className="text-[var(--muted-foreground-color)]">Replying to <span className="font-semibold">{replyingTo.author}</span></p>
                        <button onClick={onCancelReply} type="button" className="p-1 rounded-full hover:bg-[var(--border-color)]"><CloseIcon className="w-4 h-4"/></button>
                    </div>
                    <p className="line-clamp-1 text-xs text-[var(--muted-foreground-color)] italic mt-1">"{replyingTo.rawContent}"</p>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex items-end gap-2 bg-[var(--card-background-color)] border border-[var(--border-color)] rounded-2xl p-2 shadow-lg">
                <button
                    type="button"
                    onClick={handleUploadClick}
                    className="flex-shrink-0 p-2 text-[var(--muted-foreground-color)] hover:text-[var(--foreground-color)] rounded-full hover:bg-[var(--input-background-color)] transition-colors"
                    aria-label="Attach PDB file"
                >
                    <PaperclipIcon />
                </button>
                <button
                    type="button"
                    onClick={onRunPipeline}
                    className="flex-shrink-0 p-2 text-[var(--muted-foreground-color)] hover:text-[var(--foreground-color)] rounded-full hover:bg-[var(--input-background-color)] transition-colors"
                    aria-label="Run a research pipeline"
                >
                    <PlayIcon />
                </button>

                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder={isRecording ? "Listening..." : (isLoading ? "Waiting for response..." : "Ask Dr. Rhesus...")}
                        className="w-full bg-transparent p-2 pr-12 focus:outline-none resize-none overflow-y-hidden"
                        rows={1}
                        disabled={isLoading}
                    />
                    {file && (
                        <div className="absolute -top-6 left-0 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-2">
                            <PaperclipIcon className="w-3 h-3"/>
                            {file.name}
                            <button type="button" onClick={() => setFile(null)} className="font-bold text-blue-600 hover:text-blue-800">x</button>
                        </div>
                    )}
                </div>
                
                <div className="flex-shrink-0">
                    {showSendButton ? (
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="p-3 primary-bg text-white rounded-full primary-bg-hover disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                            aria-label="Send message"
                        >
                            <SendIcon />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onToggleRecording}
                            disabled={isLoading || !isSpeechSupported}
                            className={`p-3 text-white rounded-full transition-all duration-300 transform hover:scale-110 disabled:cursor-not-allowed ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse-strong' : 'primary-bg primary-bg-hover disabled:bg-slate-400'}`}
                            aria-label={isRecording ? "Stop recording" : "Start voice input"}
                        >
                            {isRecording ? <StopCircleIcon /> : <MicrophoneIcon />}
                        </button>
                    )}
                </div>
            </form>
        </div>
    </div>
  );
};

export default ChatInput;
