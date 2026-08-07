import React from 'react';

const EmptyState = ({
  icon,
  title = 'Nothing here yet',
  description = '',
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {icon && (
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-400 mb-5">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-neutral-800 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-500 max-w-xs leading-relaxed mb-6">{description}</p>
      )}
      {action && action}
    </div>
  );
};

export default EmptyState;
