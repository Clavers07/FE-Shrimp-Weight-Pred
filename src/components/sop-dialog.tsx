'use client';

import { X, Check, AlertTriangle, ArrowDown, Camera, Sun, Layers } from 'lucide-react';

interface SopDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SopDialog({ isOpen, onClose }: SopDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F4C81] text-white">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              SOP Pemotretan Udang (Jarak 29 cm)
            </h2>
            <p className="text-xs text-slate-500">
              Panduan resmi untuk akurasi estimasi berat berbasis regresi fitur piksel.
            </p>
          </div>
        </div>

        {/* Visual Diagram */}
        <div className="my-5 rounded-2xl bg-gradient-to-b from-sky-900 to-slate-900 p-6 text-white shadow-inner">
          <div className="flex flex-col items-center">
            {/* Phone/Camera icon */}
            <div className="flex items-center gap-2 rounded-lg bg-cyan-500/20 px-3 py-1.5 ring-1 ring-cyan-400/40">
              <Camera className="h-5 w-5 text-cyan-300" />
              <span className="text-xs font-bold text-cyan-200">Lensa Kamera HP</span>
            </div>

            {/* Distance line */}
            <div className="my-2 flex flex-col items-center">
              <div className="h-4 w-0.5 bg-dashed bg-cyan-400"></div>
              <div className="my-1 flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-slate-950 shadow-md">
                <ArrowDown className="h-3.5 w-3.5" />
                <span>TINGGI TEGAK LURUS = 29 CM</span>
              </div>
              <div className="h-4 w-0.5 bg-dashed bg-cyan-400"></div>
            </div>

            {/* Base platform */}
            <div className="w-full max-w-xs rounded-xl bg-slate-800 p-3 text-center ring-1 ring-slate-700">
              <div className="mx-auto h-3 w-16 rounded-full bg-amber-300/80 shadow-sm animate-pulse-subtle mb-1"></div>
              <span className="text-[11px] font-semibold text-slate-300">
                Alas Peletakan Udang (Polos & Netral)
              </span>
            </div>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 font-bold text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
              1
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Ukur Jarak 29 cm Tegak Lurus</h4>
              <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                Pastikan posisi lensa kamera berada tepat 29 cm di atas alas peletakan udang secara vertikal (kemiringan 90°).
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 font-bold text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
              2
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Gunakan Alas Kontras Tanpa Motif</h4>
              <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                Gunakan papan / nampan berwarna kontras netral (misalnya putih atau biru polos) agar kontur poligon udang terdeteksi presisi oleh YOLOv8.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 font-bold text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
              3
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Dilarang Memotong (Crop) Gambar</h4>
              <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                Sistem secara otomatis menyesuaikan resolusi gambar tanpa memotong piksel. Cropping manual akan merusak akurasi perhitungan luas piksel (area) & keliling (perimeter).
              </p>
            </div>
          </div>
        </div>

        {/* DOs and DONTs */}
        <div className="mt-6 grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/40">
            <h5 className="flex items-center gap-1 font-bold text-emerald-900 dark:text-emerald-300 mb-1">
              <Check className="h-4 w-4 text-emerald-600" /> Boleh dilakukan
            </h5>
            <ul className="space-y-1 text-emerald-800 dark:text-emerald-400">
              <li>• Ambil foto dari kamera HP / Galeri</li>
              <li>• Deteksi 1 udang atau banyak udang sekaligus</li>
              <li>• Pastikan fokus jelas dan tidak terdistorsi</li>
            </ul>
          </div>

          <div className="rounded-xl bg-rose-50 p-3 dark:bg-rose-950/40">
            <h5 className="flex items-center gap-1 font-bold text-rose-900 dark:text-rose-300 mb-1">
              <AlertTriangle className="h-4 w-4 text-rose-600" /> Larangan Mutlak
            </h5>
            <ul className="space-y-1 text-rose-800 dark:text-rose-400">
              <li>• Jangan ubah rasio / crop bebas</li>
              <li>• Jangan miringkan kamera dari 90°</li>
              <li>• Jangan gunakan alas yang terlalu berbayang</li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-[#0F4C81] py-3 text-xs font-bold text-white shadow-md hover:bg-[#0a3154] transition-colors"
        >
          Saya Mengerti, Tutup Panduan
        </button>
      </div>
    </div>
  );
}
