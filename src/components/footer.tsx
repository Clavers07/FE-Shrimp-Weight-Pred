'use client';

import { ShieldCheck, Ruler } from 'lucide-react';

interface FooterProps {
  onOpenSop: () => void;
}

export function Footer({ onOpenSop }: FooterProps) {
  return (
    <footer className="w-full border-t border-sky-200 bg-white py-8 text-xs text-[#475569]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-4 sm:flex-row sm:px-6">
        <div className="flex flex-col items-center gap-1 sm:items-start text-center sm:text-left">
          <p className="font-bold text-[#0C4A6E] font-heading">
            Sistem Estimasi Berat Udang Vannamei (YOLO26-Seg + SVR)
          </p>
          <p className="text-[11px] text-[#475569]">
            Kalibrasi jarak fisik vertikal kamera diatur presisi pada <strong className="text-[#0C4A6E]">29 cm</strong> tegak lurus di atas permukaan alas.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onOpenSop}
            className="flex items-center gap-1.5 font-bold text-[#0EA5E9] hover:text-[#0369A1] hover:underline transition-colors min-h-[44px] px-2"
          >
            <Ruler className="h-4 w-4 text-[#F59E0B]" />
            <span>Petunjuk SOP 29cm</span>
          </button>

          <span className="text-sky-200">|</span>

          <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-600">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>API LOCKED v1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
