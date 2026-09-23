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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-sky-200 bg-white p-6 sm:p-8 text-[#0C4A6E] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-[#0C4A6E] hover:bg-sky-100 transition-colors"
          title="Tutup Panduan"
          aria-label="Tutup Panduan SOP"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Dialog Header */}
        <div className="flex items-center gap-3.5 border-b border-sky-100 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E0F2FE] border border-sky-200 text-[#0EA5E9] shadow-sm">
            <Camera className="h-6 w-6 text-[#F59E0B]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0C4A6E] font-heading">
              SOP Pemotretan Udang (Jarak 29 cm)
            </h2>
            <p className="text-xs sm:text-sm text-[#475569]">
              Panduan resmi untuk akurasi estimasi berat berbasis regresi fitur piksel.
            </p>
          </div>
        </div>

        {/* Visual Diagram */}
        <div className="my-6 rounded-[20px] border border-sky-200 bg-[#F0F9FF] p-6 shadow-inner">
          <div className="flex flex-col items-center">
            {/* Phone/Camera icon */}
            <div className="flex items-center gap-2 rounded-full bg-[#0EA5E9]/10 border border-sky-200 px-4 py-2">
              <Camera className="h-4 w-4 text-[#0EA5E9]" />
              <span className="text-xs font-extrabold text-[#0EA5E9]">Lensa Kamera HP (Posisi Datar)</span>
            </div>

            {/* Distance line */}
            <div className="my-2.5 flex flex-col items-center">
              <div className="h-5 w-0.5 border-r border-dashed border-[#0EA5E9]"></div>
              <div className="my-1.5 flex items-center gap-2 rounded-full bg-[#EA580C] px-4 py-1.5 text-xs font-black text-white shadow-md">
                <ArrowDown className="h-4 w-4" />
                <span>TINGGI TEGAK LURUS = 29 CM</span>
              </div>
              <div className="h-5 w-0.5 border-r border-dashed border-[#0EA5E9]"></div>
            </div>

            {/* Base platform */}
            <div className="w-full max-w-sm rounded-2xl bg-white p-4 text-center border border-sky-200 shadow-sm">
              <div className="mx-auto h-3 w-20 rounded-full bg-[#EA580C]/30 shadow-sm mb-2"></div>
              <span className="text-xs font-bold text-[#475569]">
                Alas Peletakan Udang (Polos & Netral Tanpa Motif)
              </span>
            </div>
          </div>
        </div>

        {/* Steps Grid with Custom Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-2xl border border-sky-100 bg-[#F8FAFC] p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[#F59E0B] font-bold">
              <Ruler className="h-4 w-4 text-[#F59E0B]" />
              <h4 className="font-heading text-sm text-[#0C4A6E]">1. Ukur Jarak 29 cm</h4>
            </div>
            <p className="text-[#475569] leading-relaxed text-[11px]">
              Pastikan lensa kamera berada tepat pada ketinggian 29 cm tegak lurus (kemiringan 90°) dari permukaan alas.
            </p>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-[#F8FAFC] p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[#0EA5E9] font-bold">
              <Layers className="h-4 w-4 text-[#0EA5E9]" />
              <h4 className="font-heading text-sm text-[#0C4A6E]">2. Alas Kontras Bersih</h4>
            </div>
            <p className="text-[#475569] leading-relaxed text-[11px]">
              Gunakan nampan atau papan polos berwarna gelap atau kontras tanpa corak agar poligon udang terdeteksi presisi.
            </p>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-[#F8FAFC] p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[#10B981] font-bold">
              <Camera className="h-4 w-4 text-[#10B981]" />
              <h4 className="font-heading text-sm text-[#0C4A6E]">3. Dilarang Memotong (No Crop)</h4>
            </div>
            <p className="text-[#475569] leading-relaxed text-[11px]">
              Unggah foto dalam rasio aspek asli. Cropping manual merusak kalibrasi rasio piksel terhadap ukuran aktual.
            </p>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-[#F8FAFC] p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[#F59E0B] font-bold">
              <Sun className="h-4 w-4 text-[#F59E0B]" />
              <h4 className="font-heading text-sm text-[#0C4A6E]">4. Cahaya Cukup & Merata</h4>
            </div>
            <p className="text-[#475569] leading-relaxed text-[11px]">
              Pastikan pencahayaan cukup dan hindari pantulan silau atau bayangan gelap tubuh udang di atas alas.
            </p>
          </div>
        </div>

        {/* DOs and DONTs */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 border-t border-sky-100 text-xs">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <h5 className="flex items-center gap-2 font-bold text-emerald-700 mb-2 font-heading">
              <Check className="h-4 w-4 text-emerald-500" /> Boleh Dilakukan
            </h5>
            <ul className="space-y-1.5 text-emerald-800 text-[11px]">
              <li>• Mengambil foto lewat kamera HP atau galeri</li>
              <li>• Deteksi satu ekor atau beberapa ekor sekaligus</li>
              <li>• Pastikan fokus kamera tajam dan tidak kabur</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <h5 className="flex items-center gap-2 font-bold text-rose-700 mb-2 font-heading">
              <AlertTriangle className="h-4 w-4 text-rose-500" /> Larangan Mutlak
            </h5>
            <ul className="space-y-1.5 text-rose-800 text-[11px]">
              <li>• Dilarang memotong (crop) rasio foto</li>
              <li>• Dilarang memiringkan sudut kamera dari 90°</li>
              <li>• Dilarang menggunakan alas bermotif atau berbayang pekat</li>
            </ul>
          </div>
        </div>

        {/* Final CTA Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-[#EA580C] hover:bg-[#C2410C] py-3.5 text-sm font-extrabold text-white shadow-md hover:shadow-lg transition-all min-h-[48px]"
        >
          Saya Mengerti, Tutup Panduan
        </button>
      </div>
    </div>
  );
}
