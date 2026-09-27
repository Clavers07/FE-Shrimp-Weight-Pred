'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function Footer({ onOpenSop }: { onOpenSop: () => void }) {
  return (
    <footer className="site-footer">
      <div className="footer-main page-width"><div><Link href="/" className="brand">shrimp<span>weight</span><sup>AI</sup></Link><p>Kenali sampelnya.<br /><em>Pahami pertumbuhannya.</em></p></div><div className="footer-links"><Link href="/#analisis">Analisis foto</Link><Link href="/history">Riwayat pengamatan</Link><button onClick={onOpenSop}>Panduan pemotretan <ArrowUpRight size={15} /></button></div></div>
      <div className="footer-bottom page-width"><span>Pengamatan udang vannamei melalui citra digital.</span><span>Dirancang oleh Tim Pengembang Politeknik Manufaktur Negeri Bangka Belitung</span></div>
    </footer>
  );
}
