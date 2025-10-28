import React from 'react';

interface LoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ 
  message = 'Loading...', 
  size = 'md',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const containerClass = fullScreen 
    ? 'min-h-screen bg-gray-50 flex items-center justify-center'
    : 'flex items-center justify-center py-20';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="relative mx-auto w-20 h-20 mb-3">
          <div className={`absolute inset-0 rounded-full border-4 border-gray-200 ${sizeClasses[size]}`}></div>
          <div className={`absolute inset-0 rounded-full border-4 border-gray-600 border-t-transparent animate-spin ${sizeClasses[size]}`}></div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{message}</h3>
      </div>
    </div>
  );
};

export default Loader;
