import type React from 'react';
import { RhesusIcon } from './icons';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <RhesusIcon className="w-8 h-8 primary-text animate-pulse" />
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Dr. Rhesus is thinking...</p>
    </div>
  );
};

export default Loader;