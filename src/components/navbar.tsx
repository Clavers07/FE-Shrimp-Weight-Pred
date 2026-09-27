'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  useMock: boolean;
  onToggleMock: (value: boolean) => void;
  onOpenSop: () => void;
}

export function Navbar({ onOpenSop }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header className="site-header">
      <a href="#main-content" className="skip-link">Lewati ke konten utama</a>
      <div className="navbar page-width">
        <Link href="/" className="brand" aria-label="ShrimpWeightAI, beranda">shrimp<span>weight</span><sup>AI</sup></Link>
        <nav className="desktop-nav" aria-label="Navigasi utama">
          <Link href="/#analisis" className={pathname === '/' ? 'active' : ''}>Analisis</Link>
          <Link href="/#deteksi">Cara kerja</Link>
          <Link href="/#informasi">Tentang vannamei</Link>
          <Link href="/history" className={pathname === '/history' ? 'active' : ''} aria-current={pathname === '/history' ? 'page' : undefined}>Riwayat</Link>
        </nav>
        <button className="nav-guide" onClick={onOpenSop}>Panduan foto <ArrowUpRight size={16} /></button>
        <button ref={menuButton} className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? 'Tutup navigasi' : 'Buka navigasi'}>{menuOpen ? <X /> : <Menu />}</button>
      </div>
      {menuOpen && <nav id="mobile-navigation" className="mobile-nav" aria-label="Navigasi seluler"><Link href="/#analisis" onClick={() => setMenuOpen(false)}>Analisis</Link><Link href="/#deteksi" onClick={() => setMenuOpen(false)}>Cara kerja</Link><Link href="/#informasi" onClick={() => setMenuOpen(false)}>Tentang vannamei</Link><Link href="/history" onClick={() => setMenuOpen(false)}>Riwayat</Link><button onClick={() => { setMenuOpen(false); onOpenSop(); }}>Panduan foto</button></nav>}
    </header>
  );
}
