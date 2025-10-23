import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ 
  type = 'info', 
  title, 
  children, 
  className = '' 
}) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const styles = {
    success: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50 text-green-800',
    error: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200/50 text-red-800',
    warning: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200/50 text-yellow-800',
    info: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50 text-blue-800'
  };

  const iconStyles = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };

  const Icon = icons[type];

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-sm ${styles[type]} ${className} animate-fade-in`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconStyles[type]}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-semibold mb-1">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Alert;