'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Users, BarChart3, Settings } from 'lucide-react';
import eDataLogo from '@/components/Logo/eData Logo - new - 1x_png.png';

export function Sidebar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/candidates', label: 'Candidates', icon: Users },
  ];

  return (
    <aside className="w-64 flex flex-col p-6 border-r border-slate-50 hidden lg:flex overflow-y-auto bg-[#fafbfc]">
      <div className="mb-8 px-2 flex items-center h-12">
        <Link href="/">
          <Image src={eDataLogo} alt="eData Logo" className="w-[140px] h-auto" priority />
        </Link>
      </div>
      <nav className="flex-1 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          // Determine if the current route matches the tab. 
          // Root Dashboard strictly matches '/', others loosely match nested routes (e.g. /candidates/[id])
          const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

          return (
            <Link 
              key={link.href}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive ? 'bg-primary/5 text-primary' : 'text-slate-500 hover:bg-slate-50'
              }`} 
              href={link.href}
            >
              <Icon className="mr-3 w-5 h-5" />
              <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
