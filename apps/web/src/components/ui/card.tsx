import React from 'react';
import { cn } from '../../lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  as?: 'div' | 'article' | 'section';
}

export function Card({
  padding = 'md',
  hover = false,
  as: Comp = 'div',
  className,
  children,
  ...props
}: CardProps) {
  const paddingClass =
    padding === 'none'
      ? ''
      : padding === 'sm'
        ? 'p-4'
        : padding === 'lg'
          ? 'p-6 sm:p-8'
          : 'p-5 sm:p-6';

  return (
    <Comp
      className={cn(
        'rounded-xl bg-white border border-[#E2E8F0] shadow-xs',
        paddingClass,
        hover &&
          'transition-all duration-200 hover:border-[#CBD5E1] hover:shadow-sm hover:-translate-y-0.5',
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
