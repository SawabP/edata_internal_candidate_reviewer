'use client';

import React from 'react';

export function ComingSoonButton({
  children,
  className,
  featureName = 'This feature'
}: {
  children: React.ReactNode;
  className?: string;
  featureName?: string;
}) {
  return (
    <button 
      onClick={() => alert(`${featureName} is coming soon!`)}
      className={className}
    >
      {children}
    </button>
  );
}
