import React from 'react';

const variantClasses = {
  blue: 'bg-brand-light text-brand-primary border border-brand-border',
  indigo: 'bg-brand-accent-light text-brand-accent border border-indigo-200',
  green: 'bg-success-light text-success-text border border-success-border',
  yellow: 'bg-warning-light text-warning-text border border-warning-border',
  red: 'bg-danger-light text-danger-text border border-danger-border',
  purple: 'bg-purple-light text-purple-text border border-purple-200',
  gray: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
  dark: 'bg-neutral-800 text-white border border-neutral-700',
};

const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

const Badge = ({ children, variant = 'gray', size = 'md', className = '' }) => {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 font-semibold rounded-full tracking-wide',
        variantClasses[variant] || variantClasses.gray,
        sizeClasses[size] || sizeClasses.md,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
};

export default Badge;
