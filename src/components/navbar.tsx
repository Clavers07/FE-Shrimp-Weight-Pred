'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale, History, HelpCircle, Waves } from 'lucide-react';
import { ServerStatusBadge } from './server-status';

interface NavbarProps {
  useMock: boolean;
  onToggleMock: (val: boolean) => void;
  onOpenSop: () => void;
}

export function Navbar({ useMock, onToggleMock, onOpenSop }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0F4C81] to-[#028090] text-white shadow-md shadow-cyan-900/20">
            <Waves className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-base font-bold tracking-tight text-slate-900 dark:text-white">
              ShrimpWeight<span className="text-[#028090] dark:text-cyan-400">AI</span>
            </span>
            <span className="block text-[10px] font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
              Estimator Jarak 29cm
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold sm:text-sm transition-colors ${
              pathname === '/'
                ? 'bg-slate-100 text-[#0F4C81] dark:bg-slate-800 dark:text-cyan-400'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Scale className="h-4 w-4" />
            <span>Estimasi</span>
          </Link>

          <Link
            href="/history"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold sm:text-sm transition-colors ${
              pathname === '/history'
                ? 'bg-slate-100 text-[#0F4C81] dark:bg-slate-800 dark:text-cyan-400'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Riwayat</span>
          </Link>

          <button
            onClick={onOpenSop}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold sm:text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            title="Lihat SOP Kamera 29cm"
          >
            <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">SOP 29cm</span>
          </button>
        </nav>

        {/* Server Status & Mock Toggle */}
        <div className="flex items-center gap-2">
          <ServerStatusBadge useMock={useMock} onToggleMock={onToggleMock} />
        </div>
      </div>
    </header>
  );
}
