'use client';

import { ShieldCheck, Ruler } from 'lucide-react';

interface FooterProps {
  onOpenSop: () => void;
}

export function Footer({ onOpenSop }: FooterProps) {
  return (
    <footer className="w-full border-t border-sky-200 bg-[#0C4A6E] py-8 text-xs text-sky-200">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-4 sm:flex-row sm:px-6">
        <div className="flex flex-col items-center gap-1 sm:items-start text-center sm:text-left">
          <p className="font-bold text-white font-heading">
            Sistem Estimasi Berat Udang Vannamei (YOLOv8-Seg + SVR)
          </p>
          <p className="text-[11px] text-sky-300">
            Kalibrasi jarak fisik vertikal kamera diatur presisi pada <strong className="text-white">29 cm</strong> tegak lurus di atas permukaan alas.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onOpenSop}
            className="flex items-center gap-1.5 font-bold text-sky-300 hover:text-white hover:underline transition-colors min-h-[44px] px-2"
          >
            <Ruler className="h-4 w-4 text-[#F59E0B]" />
            <span>Petunjuk SOP 29cm</span>
          </button>

          <span className="text-sky-700">|</span>

          <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-900/30 px-3 py-1 text-[11px] font-semibold text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>API LOCKED v1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

