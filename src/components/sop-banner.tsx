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
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-sky-200 bg-sky-50 px-5 py-3 text-xs text-[#334155] shadow-sm">
        <div className="flex items-center gap-2.5">
          <Info className="h-4 w-4 text-[#0EA5E9]" />
          <span>Aturan Presisi: Jarak Kamera Vertikal ke Udang = <strong className="text-[#0C4A6E]">29 cm</strong></span>
        </div>
        <button
          onClick={onOpenFullSop}
          className="flex items-center gap-1.5 font-bold text-[#F59E0B] hover:underline transition-colors min-h-[36px] px-2"
        >
          <span>Buka Panduan SOP</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative mb-8 overflow-hidden rounded-[24px] border border-sky-200 bg-gradient-to-r from-[#EFF6FF] via-[#F0F9FF] to-[#E0F2FE] p-6 shadow-[0_4px_24px_rgba(14,165,233,0.12)]">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#0EA5E9]/10 blur-3xl" />

      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-sky-100 hover:text-[#0C4A6E] transition-colors"
        title="Sembunyikan Banner SOP"
        aria-label="Tutup banner SOP"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-[#0369A1] text-white shadow-md shadow-sky-200">
            <Ruler className="h-6 w-6" />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-extrabold text-[#0C4A6E] font-heading">
                Standar Operasional Pemotretan (SOP Presisi 29 cm)
              </h3>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Wajib
              </span>
            </div>

            <p className="mt-1.5 text-xs text-[#475569] leading-relaxed max-w-2xl">
              Posisikan kamera tegak lurus pada jarak tepat <strong className="text-[#0C4A6E]">29 cm</strong> dari alas peletakan udang. Gunakan alas polos dengan kontras jelas dan pencahayaan merata tanpa bayangan tajam.
            </p>

            {/* Checklist items formatted as pill badges */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0EA5E9]/40 bg-[#0EA5E9]/10 px-3 py-1 text-xs font-semibold text-[#0369A1]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#0EA5E9]" /> Jarak 29 cm Konstan
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0EA5E9]/40 bg-[#0EA5E9]/10 px-3 py-1 text-xs font-semibold text-[#0369A1]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#0EA5E9]" /> Aspek Rasio Asli (No Crop)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0EA5E9]/40 bg-[#0EA5E9]/10 px-3 py-1 text-xs font-semibold text-[#0369A1]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#0EA5E9]" /> Pencahayaan Cukup
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenFullSop}
          className="self-start lg:self-center shrink-0 rounded-full border-2 border-[#F59E0B] bg-transparent px-5 py-2.5 text-xs font-bold text-[#D97706] hover:bg-[#F59E0B]/10 hover:shadow-[0_0_16px_rgba(245,158,11,0.25)] transition-all min-h-[44px] flex items-center justify-center"
        >
          Lihat Panduan Lengkap
        </button>
      </div>
    </div>
  );
}

