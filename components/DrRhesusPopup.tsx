import React from 'react';
import { CloseIcon } from './icons';

interface DrRhesusPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const DrRhesusPopup: React.FC<DrRhesusPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-8 pt-16 text-center relative transform transition-transform duration-300 scale-95 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <CloseIcon />
        </button>
        <img 
            src="https://envs.sh/icl.jpg" 
            alt="Dr. Rhesus" 
            className="w-28 h-28 rounded-full border-4 primary-border absolute -top-14 left-1/2 -translate-x-1/2 object-cover"
        />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dr. Rhesus</h2>
        <p className="primary-text font-medium">Expert Bioinformatics Research Assistant</p>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            I specialize in protein design and analysis. I can help you find PDB structures, visualize molecules, perform in-silico mutations, and conduct literature searches to accelerate your research.
        </p>
        <div className="mt-6 flex flex-col items-center space-y-3">
            <a 
                href="#about"
                onClick={onClose}
                className="inline-block px-5 py-2 text-sm font-medium text-white primary-bg primary-bg-hover rounded-full transition-colors"
            >
                Learn More About The Lab
            </a>
            <a
                href="#contact"
                onClick={onClose}
                className="text-sm primary-text hover:underline"
            >
                Contact Us
            </a>
        </div>
      </div>
    </div>
  );
};

export default DrRhesusPopup;