import React from 'react';
import type { ApiStatus } from '../types';

interface ApiStatusIndicatorProps {
  status: ApiStatus;
}

const ApiStatusIndicator: React.FC<ApiStatusIndicatorProps> = ({ status }) => {
  const statusConfig = {
    idle: { color: 'bg-slate-400', text: 'API Status: Idle' },
    healthy: { color: 'bg-green-500', text: 'API Connection: Healthy' },
    error: { color: 'bg-red-500', text: 'API Connection: Error' },
  };

  const { color, text } = statusConfig[status] || statusConfig.idle;

  return (
    <div className="group relative flex items-center">
      <span className={`w-3 h-3 rounded-full ${color} transition-colors`} />
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-max px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {text}
      </div>
    </div>
  );
};

export default ApiStatusIndicator;