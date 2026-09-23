'use client';

import { useEffect } from 'react';
import { X, Check, AlertTriangle, ArrowDown, Camera, Ruler, Sun, Layers } from 'lucide-react';

interface SopDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SopDialog({ isOpen, onClose }: SopDialogProps) {
  // Listen for Escape key to close modal (Accessibility requirement R-32)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-[#3B9FE8]/30 bg-[#0F2440] p-6 sm:p-8 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition-colors"
          title="Tutup Panduan"
          aria-label="Tutup Panduan SOP"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Dialog Header */}
        <div className="flex items-center gap-3.5 border-b border-white/10 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A1A2F] border border-[#3B9FE8]/40 text-[#3B9FE8] shadow-md">
            <Camera className="h-6 w-6 text-[#E8A33D]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white font-heading">
              SOP Pemotretan Udang (Jarak 29 cm)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Panduan resmi untuk akurasi estimasi berat berbasis regresi fitur piksel.
            </p>
          </div>
        </div>

        {/* Visual Diagram */}
        <div className="my-6 rounded-[20px] border border-white/10 bg-[#0A1A2F] p-6 text-white shadow-inner">
          <div className="flex flex-col items-center">
            {/* Phone/Camera icon */}
            <div className="flex items-center gap-2 rounded-full bg-[#3B9FE8]/20 border border-[#3B9FE8]/40 px-4 py-2">
              <Camera className="h-4 w-4 text-[#3B9FE8]" />
              <span className="text-xs font-extrabold text-[#3B9FE8]">Lensa Kamera HP (Posisi Datar)</span>
            </div>

            {/* Distance line */}
            <div className="my-2.5 flex flex-col items-center">
              <div className="h-5 w-0.5 border-r border-dashed border-[#3B9FE8]"></div>
              <div className="my-1.5 flex items-center gap-2 rounded-full bg-[#E8A33D] px-4 py-1.5 text-xs font-black text-[#0A1A2F] shadow-lg">
                <ArrowDown className="h-4 w-4" />
                <span>TINGGI TEGAK LURUS = 29 CM</span>
              </div>
              <div className="h-5 w-0.5 border-r border-dashed border-[#3B9FE8]"></div>
            </div>

            {/* Base platform */}
            <div className="w-full max-w-sm rounded-2xl bg-[#0F2440] p-4 text-center border border-white/10 shadow-md">
              <div className="mx-auto h-3 w-20 rounded-full bg-[#E8A33D]/60 shadow-sm animate-pulse-subtle mb-2"></div>
              <span className="text-xs font-bold text-slate-200">
                Alas Peletakan Udang (Polos & Netral Tanpa Motif)
              </span>
            </div>
          </div>
        </div>

        {/* Steps Grid with Custom Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-2xl border border-white/10 bg-[#0A1A2F]/60 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[#E8A33D] font-bold">
              <Ruler className="h-4 w-4 text-[#E8A33D]" />
              <h4 className="font-heading text-sm text-white">1. Ukur Jarak 29 cm</h4>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Pastikan lensa kamera berada tepat pada ketinggian 29 cm tegak lurus (kemiringan 90°) dari permukaan alas.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0A1A2F]/60 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[#3B9FE8] font-bold">
              <Layers className="h-4 w-4 text-[#3B9FE8]" />
              <h4 className="font-heading text-sm text-white">2. Alas Kontras Bersih</h4>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Gunakan nampan atau papan polos berwarna gelap atau kontras tanpa corak agar poligon udang terdeteksi presisi.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0A1A2F]/60 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[#10B981] font-bold">
              <Camera className="h-4 w-4 text-[#10B981]" />
              <h4 className="font-heading text-sm text-white">3. Dilarang Memotong (No Crop)</h4>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Unggah foto dalam rasio aspek asli. Cropping manual merusak kalibrasi rasio piksel terhadap ukuran aktual.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0A1A2F]/60 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[#E8A33D] font-bold">
              <Sun className="h-4 w-4 text-[#E8A33D]" />
              <h4 className="font-heading text-sm text-white">4. Cahaya Cukup & Merata</h4>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Pastikan pencahayaan cukup dan hindari pantulan silau atau bayangan gelap tubuh udang di atas alas.
            </p>
          </div>
        </div>

        {/* DOs and DONTs */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 border-t border-white/10 text-xs">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4">
            <h5 className="flex items-center gap-2 font-bold text-emerald-300 mb-2 font-heading">
              <Check className="h-4 w-4 text-emerald-400" /> Boleh Dilakukan
            </h5>
            <ul className="space-y-1.5 text-emerald-200/90 text-[11px]">
              <li>• Mengambil foto lewat kamera HP atau galeri</li>
              <li>• Deteksi satu ekor atau beberapa ekor sekaligus</li>
              <li>• Pastikan fokus kamera tajam dan tidak kabur</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4">
            <h5 className="flex items-center gap-2 font-bold text-rose-300 mb-2 font-heading">
              <AlertTriangle className="h-4 w-4 text-rose-400" /> Larangan Mutlak
            </h5>
            <ul className="space-y-1.5 text-rose-200/90 text-[11px]">
              <li>• Dilarang memotong (crop) rasio foto</li>
              <li>• Dilarang memiringkan sudut kamera dari 90°</li>
              <li>• Dilarang menggunakan alas bermotif atau berbayang pekat</li>
            </ul>
          </div>
        </div>

        {/* Final CTA Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-[#E8A33D] hover:bg-[#D6922C] py-3.5 text-sm font-extrabold text-[#0A1A2F] shadow-lg hover:shadow-[0_0_20px_rgba(232,163,61,0.35)] transition-all min-h-[48px]"
        >
          Saya Mengerti, Tutup Panduan
        </button>
      </div>
    </div>
  );
}

