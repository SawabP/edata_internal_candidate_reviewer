import Link from 'next/link';
import { Search, Bell } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="flex justify-between items-center px-8 py-4 w-full max-w-[1600px] mx-auto">
        <div className="flex items-center gap-10">
          <span className="text-2xl font-extrabold text-primary tracking-tight">Executive Talent</span>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-primary font-bold border-b-2 border-primary py-1" href="/">Dashboard</Link>
            <Link className="text-slate-500 hover:text-primary transition-colors duration-200 font-semibold py-1" href="/jobs">Jobs</Link>
            <Link className="text-slate-500 hover:text-primary transition-colors duration-200 font-semibold py-1" href="/candidates">Candidates</Link>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
            <input className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 w-72 transition-all" placeholder="Search talent pool..." type="text"/>
          </div>
          <button className="text-slate-500 p-2 hover:bg-slate-50 rounded-full transition-colors"><Bell className="w-5 h-5" /></button>
          <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img alt="User avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCWUS_Sp7Yh-svfh05O27r53eg1h1Qx42g_bkBA_Nde6Q62A_Yua-C1HMOPqjA74FbQRvHk2TB2J5TgLyLAd8zg7ZrMku7gPGadn55zFdezm2Dbf_6Co6K-spkSoECxkUbDyitDRmLVBXkG6RyxkCPQQo9R1L8UMZIuF4xfvY1HieB7fXa1AB1jVTLCceJ1pr7BTQjml3UXs0eLuN9HlmT_L28u0f9IQOqGpr7QiNcnBpQh4EIXFkSCeyy6g5wIm6BYMskss63TE0"/>
          </div>
        </div>
      </div>
    </header>
  );
}
