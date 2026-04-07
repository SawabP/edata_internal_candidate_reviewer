'use client';

import { Search } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTerm(value);
    
    // We update the URL query string
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative group w-full sm:w-auto">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
      <input 
        className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-64 transition-all placeholder:text-slate-400 text-slate-800 font-medium shadow-sm" 
        placeholder="Search candidates..." 
        type="text"
        value={term}
        onChange={handleSearch}
      />
    </div>
  );
}
