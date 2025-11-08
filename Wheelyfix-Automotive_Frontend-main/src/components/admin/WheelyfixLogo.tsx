import React from 'react';
import { cn } from '@/lib/utils';
import logoImage from '../../assets/logo.jpg';

interface WheelyfixLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const WheelyfixLogo: React.FC<WheelyfixLogoProps> = ({ 
  className, 
  showText = true, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* Logo Image */}
      <img
        src={logoImage}
        alt="WHEELYFIX AUTOMOTIVE"
        className={cn(
          'object-contain',
          sizeClasses[size]
        )}
      />
      
      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            'font-bold text-gray-900 leading-tight',
            textSizeClasses[size]
          )}>
            WHEELYFIX
          </span>
          <span className={cn(
            'font-medium text-gray-600 leading-tight -mt-1',
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          )}>
            AUTOMOTIVE
          </span>
        </div>
      )}
    </div>
  );
};
