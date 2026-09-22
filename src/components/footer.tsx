'use client';

import { ShieldCheck, Ruler, Camera } from 'lucide-react';

interface FooterProps {
  onOpenSop: () => void;
}

export function Footer({ onOpenSop }: FooterProps) {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 py-8 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            Sistem Estimasi Berat Udang Vanamo (YOLOv8-Seg + SVR)
          </p>
          <p className="text-[11px] text-slate-500">
            Kalibrasi jarak fisik vertikal kamera diatur presisi pada **29 cm** di atas permukaan alas.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onOpenSop}
            className="flex items-center gap-1.5 font-medium text-[#0F4C81] hover:underline dark:text-cyan-400"
          >
            <Ruler className="h-3.5 w-3.5" />
            <span>Petunjuk SOP 29cm</span>
          </button>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>API LOCKED v1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
