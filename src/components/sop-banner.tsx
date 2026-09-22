'use client';

import { useState } from 'react';
import { Ruler, CheckCircle2, Info, X, ExternalLink } from 'lucide-react';

interface SopBannerProps {
  onOpenFullSop: () => void;
}

export function SopBanner({ onOpenFullSop }: SopBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <div className="mb-4 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-2 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Aturan Presisi: Jarak Kamera Vertikal ke Udang = <strong>29 cm</strong></span>
        </div>
        <button
          onClick={onOpenFullSop}
          className="flex items-center gap-1 font-semibold text-[#0F4C81] hover:underline dark:text-cyan-300"
        >
          <span>SOP</span>
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-cyan-200/80 bg-gradient-to-r from-cyan-50/90 via-sky-50/50 to-emerald-50/80 p-4 shadow-sm dark:border-cyan-900/40 dark:from-slate-900 dark:via-cyan-950/20 dark:to-slate-900">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 rounded-full p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        title="Sembunyikan Banner SOP"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F4C81] to-[#028090] text-white shadow-sm">
            <Ruler className="h-6 w-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Standar Operasional Pemotretan (SOP Presisi 29 cm)
              </h3>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Wajib
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Posisikan kamera tegak lurus pada jarak tepat <strong>29 cm</strong> dari alas peletakan udang. Gunakan alas polos dengan kontras jelas & cahaya cukup.
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Jarak 29 cm Konstan
              </span>
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Aspek Rasio Asli (No Crop)
              </span>
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Pencahayaan Cukup
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenFullSop}
          className="self-start sm:self-center shrink-0 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-[#0F4C81] shadow-xs ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-cyan-300 dark:ring-slate-700 dark:hover:bg-slate-700 transition-all"
        >
          Lihat Panduan Lengkap
        </button>
      </div>
    </div>
  );
}
