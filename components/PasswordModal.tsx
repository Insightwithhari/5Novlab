import React, { useState, useEffect } from 'react';
import { SUPERVISOR_PASSWORD } from '../constants';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SUPERVISOR_PASSWORD) {
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm p-6 text-center transform transition-transform duration-300 scale-95 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Required</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">Please enter the password to proceed.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-700 text-center p-3 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 primary-ring"
            placeholder="Password"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className="w-full mt-4 py-2 primary-bg text-white font-semibold rounded-md primary-bg-hover transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;