'use client';
import { Download } from 'lucide-react';

export function ExportButton() {
  return (
    <button 
      onClick={() => alert('Exporting capabilities are coming soon!')}
      className="w-full py-4 bg-white text-slate-900 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
      <Download className="w-5 h-5" />
      Export PDF Report
    </button>
  );
}
