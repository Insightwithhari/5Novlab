// FIX: Changed `import type React` to `import React` because this file uses JSX.
import React from 'react';

const IconWrapper: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );

export const RhesusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4c0 5.523 4.477 10 10 10" />
        <path d="M20 20c0-5.523-4.477-10-10-10" />
        <path d="M10 4c0 5.523-4.477 10-10 10" />
        <path d="M14 20c0-5.523 4.477-10 10-10" />
    </svg>
);

export const MicrophoneIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( <IconWrapper className={className}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></IconWrapper> );
export const StopCircleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( <IconWrapper className={className}><circle cx="12" cy="12" r="10"></circle><rect x="9" y="9" width="6" height="6"></rect></IconWrapper> );
export const SpeakerWaveIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => ( <IconWrapper className={className}><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></IconWrapper> );
export const SpeakerXMarkIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => ( <IconWrapper className={className}><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></IconWrapper> );
export const CommandLineIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( <IconWrapper className={className}><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></IconWrapper> );
export const DownloadIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( <IconWrapper className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></IconWrapper> );
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => ( <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.523.074-.797.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg> );
export const TelegramIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => ( <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23l7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3L3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.28 1.4.24 1.15.99l-2.64 12.14c-.21.98-1.23 1.2-1.87.72l-4.2-3.21l-2.02 1.93c-.23.23-.42.42-.83.42z" /></svg> );
export const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => ( <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" /></svg> );
export const XIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => ( <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> );
export const EnvelopeIcon: React.FC<{ className?: string }> = ({ className }) => ( <IconWrapper className={className}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></IconWrapper> );
export const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => ( <IconWrapper className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></IconWrapper> );
export const SunIcon: React.FC<{ className?: string }> = ({ className }) => ( <IconWrapper className={className}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></IconWrapper> );
export const MoonIcon: React.FC<{ className?: string }> = ({ className }) => ( <IconWrapper className={className}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></IconWrapper> );
export const CloseIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => ( <IconWrapper className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></IconWrapper> );
export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => ( <IconWrapper className={className}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></IconWrapper> );
export const HomeIcon: React.FC<{ className?: string }> = ({ className }) => ( <IconWrapper className={className}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></IconWrapper> );
export const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className }) => ( <IconWrapper className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></IconWrapper> );
export const ClipboardListIcon: React.FC<{ className?: string }> = ({ className }) => ( <IconWrapper className={className}><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><line x1="12" x2="12" y1="16" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line><line x1="8" y1="16" x2="10" y2="16"></line></IconWrapper> );
export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => ( <IconWrapper className={className}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></IconWrapper> );
export const PaperclipIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( <IconWrapper className={className}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></IconWrapper> );
export const SendIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( <IconWrapper className={className}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></IconWrapper> );
export const PinIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => ( <IconWrapper className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></IconWrapper> );
export const ShareIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => ( <IconWrapper className={className}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></IconWrapper> );
export const ClipboardDocumentIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => ( <IconWrapper className={className}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></IconWrapper> );
export const CheckIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => ( <IconWrapper className={className}><polyline points="20 6 9 17 4 12"></polyline></IconWrapper> );
export const PlayIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( <IconWrapper className={className}><polygon points="5 3 19 12 5 21 5 3"></polygon></IconWrapper> );
export const Cog8ToothIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( <IconWrapper className={className}><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path><circle cx="12" cy="12" r="3"></circle></IconWrapper> );
export const PlusIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( <IconWrapper className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></IconWrapper> );
export const TrashIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( <IconWrapper className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></IconWrapper> );
export const PencilIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( <IconWrapper className={className}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></IconWrapper> );
export const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( <IconWrapper className={className}><polyline points="15 18 9 12 15 6"></polyline></IconWrapper> );
export const DocumentTextIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( <IconWrapper className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></IconWrapper> );
export const QuestionMarkCircleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( <IconWrapper className={className}><path d="M9.09,9a3,3,0,0,1,5.83,1c0,2-3,3-3,3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line><circle cx="12" cy="12" r="10"></circle></IconWrapper> );
export const ExclamationTriangleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( <IconWrapper className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></IconWrapper> );
export const PrinterIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => ( <IconWrapper className={className}><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></IconWrapper> );
export const ReplyIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => ( <IconWrapper className={className}><path d="M9 10l-5 5 5 5" /><path d="M20 18v-4a4 4 0 0 0-4-4H4" /></IconWrapper> );
export const SearchIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( <IconWrapper className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></IconWrapper> );
export const FilePlusIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( <IconWrapper className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></IconWrapper> );


// --- FAQ Illustrations ---
const IllustrationWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto text-[var(--muted-foreground-color)]">
        {children}
    </svg>
);

export const FaqChatInputIllustration: React.FC = () => (
    <IllustrationWrapper>
        <rect x="10" y="20" width="80" height="20" rx="10" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="15" y="25" width="40" height="10" rx="5" fill="currentColor" opacity="0.3" />
        <circle cx="80" cy="30" r="8" fill="var(--primary-color)" />
        <path d="M 78 28 L 82 30 L 78 32 Z" fill="white" stroke="none" />
    </IllustrationWrapper>
);

export const FaqPipelineIllustration: React.FC = () => (
    <IllustrationWrapper>
        <rect x="10" y="15" width="35" height="30" rx="5" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M 22 25 L 32 30 L 22 35 Z" fill="var(--primary-color)" />
        <path d="M 48 30 L 68 30" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
        <path d="M 65 27 L 68 30 L 65 33" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="70" y="20" width="20" height="20" rx="5" fill="currentColor" opacity="0.3" />
    </IllustrationWrapper>
);

export const FaqPinIllustration: React.FC = () => (
    <IllustrationWrapper>
        <rect x="10" y="5" width="80" height="50" rx="5" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="15" y="10" width="70" height="35" rx="3" fill="currentColor" opacity="0.3" />
        <circle cx="80" cy="15" r="7" fill="var(--primary-color)" />
        <path d="M80 12 v6" stroke="white" strokeWidth="1.5" />
        <path d="M77 15 h6" stroke="white" strokeWidth="1.5" />
    </IllustrationWrapper>
);

export const FaqShareIllustration: React.FC = () => (
    <IllustrationWrapper>
        <rect x="10" y="5" width="80" height="50" rx="5" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="15" y="10" width="70" height="35" rx="3" fill="currentColor" opacity="0.3" />
        <circle cx="80" cy="15" r="7" fill="var(--primary-color)" />
        <path d="M 80 11 L 80 17 M 77 14 L 80 11 L 83 14" stroke="white" strokeWidth="1.5" fill="none"/>
    </IllustrationWrapper>
);

export const FaqSettingsAppearanceIllustration: React.FC = () => (
    <IllustrationWrapper>
        <circle cx="25" cy="30" r="10" stroke="var(--primary-color)" strokeWidth="2" fill="none" />
        <circle cx="50" cy="30" r="10" fill="currentColor" opacity="0.3" />
        <circle cx="75" cy="30" r="10" fill="currentColor" opacity="0.3" />
    </IllustrationWrapper>
);