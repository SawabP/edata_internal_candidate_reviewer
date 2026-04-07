'use client';
import { useState } from 'react';

export function AvatarImage({ srcs, initials }: { srcs: string[]; initials: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter out any empty strings ahead of time
  const validSrcs = srcs.filter(Boolean);

  if (currentIndex >= validSrcs.length || validSrcs.length === 0) {
    return <span className="text-5xl font-black text-slate-300 uppercase z-10 relative">{initials}</span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      key={validSrcs[currentIndex]}
      src={validSrcs[currentIndex]} 
      alt="Profile" 
      className="w-full h-full object-cover relative z-10 bg-slate-50 transition-opacity duration-300"
      onError={() => {
        // Only increment if we have more sources to try
        if (currentIndex < validSrcs.length) {
          setCurrentIndex((prev) => prev + 1);
        }
      }}
    />
  );
}
