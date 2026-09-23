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
    <header className="sticky top-0 z-40 w-full border-b border-sky-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 sm:h-20 max-w-6xl items-center justify-between px-3 sm:px-6 gap-2">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-[#0369A1] shadow-md shadow-sky-200">
            <Waves className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <span className="block text-base sm:text-lg font-extrabold tracking-tight text-[#0C4A6E] font-heading leading-tight">
              ShrimpWeight<span className="text-[#0EA5E9]">AI</span>
            </span>
            <span className="hidden sm:block text-[10px] font-semibold tracking-wider text-sky-400 uppercase">
              Jarak Presisi 29 cm
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
              pathname === '/'
                ? 'bg-[#0EA5E9] text-white shadow-[0_0_16px_rgba(14,165,233,0.35)]'
                : 'text-[#334155] hover:bg-sky-50 hover:text-[#0EA5E9]'
            }`}
            title="Estimasi"
          >
            <Scale className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Estimasi</span>
          </Link>

          <Link
            href="/history"
            className={`flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
              pathname === '/history'
                ? 'bg-[#0EA5E9] text-white shadow-[0_0_16px_rgba(14,165,233,0.35)]'
                : 'text-[#334155] hover:bg-sky-50 hover:text-[#0EA5E9]'
            }`}
            title="Riwayat"
          >
            <History className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Riwayat</span>
          </Link>

          <button
            onClick={onOpenSop}
            className="flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-[#334155] hover:bg-sky-50 hover:text-[#0EA5E9] transition-all min-h-[44px]"
            title="Lihat SOP Pemotretan 29 cm"
          >
            <HelpCircle className="h-4 w-4 shrink-0 text-[#F59E0B]" />
            <span className="hidden sm:inline">SOP 29cm</span>
          </button>
        </nav>

        {/* Server Status & Mock Toggle Switch */}
        <div className="flex items-center shrink-0">
          <ServerStatusBadge useMock={useMock} onToggleMock={onToggleMock} />
        </div>
      </div>
    </header>
  );
}


