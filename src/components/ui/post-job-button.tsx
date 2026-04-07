'use client';
import { Plus } from 'lucide-react';

export function PostJobButton() {
  return (
    <button 
      onClick={() => alert('Job Posting capabilities are coming soon!')}
      className="inline-flex items-center px-8 py-3.5 bg-primary text-white rounded-xl font-bold shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-all active:scale-95">
      <Plus className="mr-2 w-5 h-5" />
      Post a New Job
    </button>
  );
}
