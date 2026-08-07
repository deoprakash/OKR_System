import React from 'react';

const Skeleton = ({ className = '', lines = 1, circle = false }) => {
  if (circle) {
    return (
      <div
        className={`rounded-full bg-neutral-200 animate-pulse ${className}`}
      />
    );
  }

  if (lines > 1) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 rounded-lg bg-neutral-200 animate-pulse"
            style={{ width: i === lines - 1 ? '60%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`h-4 rounded-lg bg-neutral-200 animate-pulse ${className}`}
    />
  );
};

export const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-6 animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-10 h-10 rounded-full bg-neutral-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-neutral-200 rounded-lg w-3/4" />
        <div className="h-3 bg-neutral-100 rounded-lg w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-neutral-100 rounded-lg" />
      <div className="h-3 bg-neutral-100 rounded-lg w-5/6" />
      <div className="h-3 bg-neutral-100 rounded-lg w-4/6" />
    </div>
  </div>
);

export const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-neutral-100">
    {[1, 2, 3, 4, 5].map(i => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-neutral-200 rounded-lg" style={{ width: `${60 + i * 8}%` }} />
      </td>
    ))}
  </tr>
);

export default Skeleton;
