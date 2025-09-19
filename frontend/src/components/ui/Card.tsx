import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
  glass?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = true,
  hover = false,
  glass = false
}) => {
  const baseClasses = 'rounded-2xl border transition-all duration-300';
  const paddingClasses = padding ? 'p-6' : '';
  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';
  const glassClasses = glass ? 'bg-white/80 backdrop-blur-sm border-white/20 shadow-soft' : 'bg-white border-gray-200 shadow-soft';

  return (
    <div className={`${baseClasses} ${paddingClasses} ${hoverClasses} ${glassClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;