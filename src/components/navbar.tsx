'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Scale, History, HelpCircle, Waves, ScanSearch, Info, Menu, X } from 'lucide-react';
import { ServerStatusBadge } from './server-status';

interface NavbarProps {
  useMock: boolean;
  onToggleMock: (val: boolean) => void;
  onOpenSop: () => void;
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Navbar({ useMock, onToggleMock, onOpenSop }: NavbarProps) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId?: string) => {
    setMobileMenuOpen(false);
    if (sectionId && isHome) {
      scrollToSection(sectionId);
    }
  };

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

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
              isHome
                ? 'bg-[#0EA5E9] text-white shadow-[0_0_16px_rgba(14,165,233,0.35)]'
                : 'text-[#334155] hover:bg-sky-50 hover:text-[#0EA5E9]'
            }`}
            title="Estimasi"
          >
            <Scale className="h-4 w-4 shrink-0" />
            <span>Estimasi</span>
          </Link>

          <Link
            href="/#deteksi"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                scrollToSection('deteksi');
              }
            }}
            className="flex items-center gap-2 rounded-full px-3.5 py-2 text-xs sm:text-sm font-bold text-[#334155] hover:bg-sky-50 hover:text-[#0EA5E9] transition-all min-h-[44px]"
            title="Cara Kerja Deteksi"
          >
            <ScanSearch className="h-4 w-4 shrink-0 text-[#0EA5E9]" />
            <span>Deteksi</span>
          </Link>

          <Link
            href="/#informasi"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                scrollToSection('informasi');
              }
            }}
            className="flex items-center gap-2 rounded-full px-3.5 py-2 text-xs sm:text-sm font-bold text-[#334155] hover:bg-sky-50 hover:text-[#0EA5E9] transition-all min-h-[44px]"
            title="Informasi Udang Vannamei"
          >
            <Info className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>Informasi</span>
          </Link>

          <Link
            href="/history"
            className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
              pathname === '/history'
                ? 'bg-[#0EA5E9] text-white shadow-[0_0_16px_rgba(14,165,233,0.35)]'
                : 'text-[#334155] hover:bg-sky-50 hover:text-[#0EA5E9]'
            }`}
            title="Riwayat"
          >
            <History className="h-4 w-4 shrink-0" />
            <span>Riwayat</span>
          </Link>

          <button
            onClick={onOpenSop}
            className="flex items-center gap-2 rounded-full px-3.5 py-2 text-xs sm:text-sm font-bold text-[#334155] hover:bg-sky-50 hover:text-[#0EA5E9] transition-all min-h-[44px]"
            title="Lihat SOP Pemotretan 29 cm"
          >
            <HelpCircle className="h-4 w-4 shrink-0 text-[#F59E0B]" />
            <span>SOP 29cm</span>
          </button>
        </nav>

        {/* Server Status, Mock Toggle & Mobile Menu Button */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <ServerStatusBadge useMock={useMock} onToggleMock={onToggleMock} />

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-[#0C4A6E] hover:bg-sky-100 transition-colors"
            title="Menu Navigasi"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sky-100 bg-white px-4 py-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1.5">
            <Link
              href="/"
              onClick={() => handleNavClick()}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all min-h-[44px] ${
                isHome ? 'bg-[#0EA5E9] text-white' : 'text-[#334155] hover:bg-sky-50 hover:text-[#0EA5E9]'
              }`}
            >
              <Scale className="h-4 w-4 shrink-0" />
              <span>Estimasi Berat</span>
            </Link>

            <Link
              href="/#deteksi"
              onClick={(e) => {
                if (isHome) {
                  e.preventDefault();
                  handleNavClick('deteksi');
                } else {
                  setMobileMenuOpen(false);
                }
              }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#334155] hover:bg-sky-50 hover:text-[#0EA5E9] transition-all min-h-[44px]"
            >
              <ScanSearch className="h-4 w-4 shrink-0 text-[#0EA5E9]" />
              <span>Cara Kerja Deteksi</span>
            </Link>

            <Link
              href="/#informasi"
              onClick={(e) => {
                if (isHome) {
                  e.preventDefault();
                  handleNavClick('informasi');
                } else {
                  setMobileMenuOpen(false);
                }
              }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#334155] hover:bg-sky-50 hover:text-[#0EA5E9] transition-all min-h-[44px]"
            >
              <Info className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>Informasi Udang Vannamei</span>
            </Link>

            <Link
              href="/history"
              onClick={() => handleNavClick()}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all min-h-[44px] ${
                pathname === '/history' ? 'bg-[#0EA5E9] text-white' : 'text-[#334155] hover:bg-sky-50 hover:text-[#0EA5E9]'
              }`}
            >
              <History className="h-4 w-4 shrink-0" />
              <span>Riwayat Pemindaian</span>
            </Link>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSop();
              }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-[#334155] hover:bg-sky-50 hover:text-[#0EA5E9] transition-all min-h-[44px]"
            >
              <HelpCircle className="h-4 w-4 shrink-0 text-[#F59E0B]" />
              <span>Petunjuk SOP 29 cm</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}


