import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'default' | 'narrow' | 'wide' | 'full';
}

const sizeClasses = {
  default: 'max-w-7xl',
  narrow: 'max-w-3xl',
  wide: 'max-w-[1400px]',
  full: 'max-w-full',
};

export const Container = ({
  children,
  className,
  size = 'default'
}: ContainerProps) => {
  return (
    <div className={cn(
      sizeClasses[size],
      'mx-auto px-4 sm:px-6 lg:px-8',
      className
    )}>
      {children}
    </div>
  );
};
