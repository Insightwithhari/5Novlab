import React from 'react';

export const ClipboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    </svg>
);

export const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

export const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" x2="12" y1="15" y2="3"></line>
    </svg>
);

export const RhesusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.09 14.53a1 1 0 01-1.41-1.41l1.41-1.41a1 1 0 111.41 1.41l-1.41 1.41zm3.5-3.5a1 1 0 010 1.41l-3.18 3.18a1 1 0 11-1.41-1.41l3.18-3.18a1 1 0 011.41 0zm-2.12-2.12a1 1 0 011.41 0l1.41 1.41a1 1 0 01-1.41 1.41l-1.41-1.41a1 1 0 010-1.41zM10.5 9.2a1 1 0 01-1.41 1.41l-1.41-1.41A1 1 0 019.09 7.8l1.41 1.41zM14 6a1 1 0 01.7.3l2 2a1 1 0 11-1.4 1.4L14 8.4l-.3.3a1 1 0 01-1.4-1.4l2-2A1 1 0 0114 6zm-8 8a1 1 0 01-.7-.3l-2-2a1 1 0 111.4-1.4L6 11.6l.3-.3a1 1 0 111.4 1.4l-2 2a1 1 0 01-.7.3z"/>
    </svg>
);

export const PaperAirplaneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.53l4.949-1.414a.75.75 0 00-.531-.95L3.105 2.289zM15 8a.75.75 0 01-.75.75h-4.5a.75.75 0 010-1.5h4.5A.75.75 0 0115 8zM8 15a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 018 15z" />
        <path fillRule="evenodd" d="M12.553 2.64a.75.75 0 01.286 1.03l-2.073 4.146a.75.75 0 01-1.03.286L8 7.353l-4.146 2.073a.75.75 0 01-1.03-.286L.75 5.003a.75.75 0 01.286-1.03L5.003.75a.75.75 0 011.03.286l2.073 4.146L9.646 4.93l4.146-2.073a.75.75 0 011.03.286L17.353 8l-2.073 1.036a.75.75 0 01-.286-1.03l2.073-4.146zm-6 6l-2.073 4.146a.75.75 0 01-1.03.286L.75 14.997a.75.75 0 01.286-1.03L5.003 11.25a.75.75 0 011.03.286L8.106 15.68l.284.568 2.073-4.146a.75.75 0 011.03-.286L15.646 13l-4.146-2.073a.75.75 0 01-.286-1.03l4.146-2.073L14.997 19.25a.75.75 0 01-1.03.286L11.25 17.464a.75.75 0 01-.286-1.03L13.036 12.29l-.568-.284-4.146 2.073z" clipRule="evenodd" />
    </svg>
);

export const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2a3 3 0 00-3 3v6a3 3 0 106 0V5a3 3 0 00-3-3z" />
        <path d="M19 11a7 7 0 11-14 0" />
    </svg>
);

export const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
    </svg>
);

export const PinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M16.5 3.75a.75.75 0 00-1.06 0L8.25 10.94l-1.72-1.72a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l8.25-8.25a.75.75 0 000-1.06z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M12.56 12l-2.25 2.25a.75.75 0 001.06 1.06l2.25-2.25a.75.75 0 00-1.06-1.06zM15.56 9l-2.25 2.25a.75.75 0 001.06 1.06l2.25-2.25a.75.75 0 00-1.06-1.06z" clipRule="evenodd" />
        <path d="M12 2.25a.75.75 0 00-.75.75v12a.75.75 0 001.5 0V3a.75.75 0 00-.75-.75z" />
        <path d="M8.25 18.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75z" />
    </svg>
);

export const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M15.75 4.5a3 3 0 013 3v10.5a3 3 0 01-3 3h-9a3 3 0 01-3-3V7.5a3 3 0 013-3h9zm-9 1.5a1.5 1.5 0 00-1.5 1.5v10.5a1.5 1.5 0 001.5 1.5h9a1.5 1.5 0 001.5-1.5V7.5a1.5 1.5 0 00-1.5-1.5h-9z" clipRule="evenodd" />
        <path d="M12.75 6a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0V6z" />
        <path d="M10.5 8.25a.75.75 0 00-1.5 0v.5a.75.75 0 001.5 0v-.5z" />
        <path d="M13.5 8.25a.75.75 0 00-1.5 0v.5a.75.75 0 001.5 0v-.5z" />
        <path d="M10.5 10.5a.75.75 0 00-1.5 0v.5a.75.75 0 001.5 0v-.5z" />
        <path d="M13.5 10.5a.75.75 0 00-1.5 0v.5a.75.75 0 001.5 0v-.5z" />
    </svg>
);

export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.006a.75.75 0 01-.749.715H5.832a.75.75 0 01-.749-.751l-1.005-13.006-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.9h1.368c1.603 0 2.816 1.336 2.816 2.9zM5.07 6.095l.98 12.748h11.9l.98-12.748H5.07z" clipRule="evenodd" />
    </svg>
);
