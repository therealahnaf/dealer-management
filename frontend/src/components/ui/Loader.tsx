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
  const spinnerSize = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  const containerClass = fullScreen 
    ? 'min-h-screen bg-gradient-to-br from-white via-brand-light-orange/30 to-white flex items-center justify-center'
    : 'flex items-center justify-center py-20';

  return (
    <div className={containerClass}>
      <div className="text-center">
        {/* Animated Spinner */}
        <div className={`relative mx-auto ${spinnerSize[size]} mb-6`}>
          {/* Outer ring */}
          <div className={`absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700`}></div>
          
          {/* Animated gradient ring */}
          <div className={`absolute inset-0 rounded-full border-4 border-transparent border-t-brand-orange border-r-brand-orange/60 animate-spin`}></div>
          
          {/* Inner pulsing circle */}
          <div className={`absolute inset-2 rounded-full bg-gradient-to-br from-brand-orange/20 to-brand-orange/5 animate-pulse`}></div>
        </div>

        {/* Message */}
        {message && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{message}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Please wait...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Loader;
