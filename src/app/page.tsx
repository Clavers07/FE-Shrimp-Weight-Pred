'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SopBanner } from '@/components/sop-banner';
import { SopDialog } from '@/components/sop-dialog';
import { ImageCapture } from '@/components/image-capture';
import { PredictionResult } from '@/components/prediction-result';
import { PredictResult, PredictSuccessResponse } from '@/lib/types';
import { ProcessedImageResult } from '@/lib/exif-processor';
import { Ruler, Sparkles, ShieldCheck, Target, ArrowDown } from 'lucide-react';

export default function HomePage() {
  const [useMock, setUseMock] = useState<boolean>(false);
  const [isSopOpen, setIsSopOpen] = useState<boolean>(false);

  const [activeResult, setActiveResult] = useState<PredictSuccessResponse | null>(null);
  const [processedImg, setProcessedImg] = useState<ProcessedImageResult | null>(null);

  const handlePredictionSuccess = (result: PredictResult, processedImage: ProcessedImageResult) => {
    if (result.ok) {
      setActiveResult(result);
      setProcessedImg(processedImage);
    }
  };

  const handleReset = () => {
    setActiveResult(null);
    setProcessedImg(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F9FF] text-[#334155]">
      <Navbar
        useMock={useMock}
        onToggleMock={setUseMock}
        onOpenSop={() => setIsSopOpen(true)}
      />

      <main className="flex-1 relative overflow-hidden">
        {/* Subtle Water Ripple Background Overlay */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-30 select-none overflow-hidden">
          <Image
            src="/assets/water-ripple.svg"
            alt="Water ripple texture"
            fill
            sizes="100vw"
            className="object-cover object-top"
            priority
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
          {/* SOP Notification Banner */}
          <SopBanner onOpenFullSop={() => setIsSopOpen(true)} />

          {/* Hero Section (When Idle) */}
          {!activeResult && (
            <div className="mb-10 lg:mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Hero Text Column */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 px-3.5 py-1 text-xs font-bold text-[#0EA5E9]">
                    <Sparkles className="h-3.5 w-3.5 text-[#E8A33D]" />
                    <span>Inovasi Akuakultur Digital</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-extrabold tracking-tight text-[#0C4A6E] font-heading leading-[1.15]">
                    Estimasi Berat Udang <span className="text-[#0EA5E9]">Kamera Digital</span>
                  </h1>

                  <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-xl">
                    Deteksi poligon instans YOLOv8 dan regresi SVR presisi tinggi dengan jarak pemotretan vertikal konstan <strong className="text-[#0C4A6E]">29 cm</strong> dari atas permukaan alas nampan.
                  </p>

                  {/* Highlights list */}
                  <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
                    <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 border border-sky-200 text-[#334155] shadow-sm">
                      <Target className="h-4 w-4 text-[#F59E0B]" />
                      <span>Jarak 29cm Vertikal</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 border border-sky-200 text-[#334155] shadow-sm">
                      <ShieldCheck className="h-4 w-4 text-[#0EA5E9]" />
                      <span>Tanpa Kalibrasi Koin</span>
                    </div>
                  </div>
                </div>

                {/* Hero Visual Column */}
                <div className="lg:col-span-5">
                  <div className="relative overflow-hidden rounded-[20px] border border-sky-200 bg-white shadow-[0_4px_24px_rgba(14,165,233,0.15)] group">
                    <div className="relative aspect-[16/10] w-full">
                      <Image
                        src="/assets/hero-shrimp.jpg"
                        alt="Pemotretan udang vannamei di atas nampan gelap"
                        fill
                        sizes="(max-width: 1024px) 100vw, 500px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority
                      />
                      {/* Gradient overlay for contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0C4A6E]/70 via-transparent to-transparent opacity-60" />
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-[#0C4A6E]/90 px-3 py-2 text-xs backdrop-blur-md border border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-[#F59E0B] animate-ping" />
                        <span className="font-semibold text-white">Standar Pemotretan 29 cm</span>
                      </div>
                      <span className="text-[11px] text-[#0EA5E9] font-bold">YOLOv8-Seg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Interactive Workflow Card */}
          {activeResult && processedImg ? (
            <PredictionResult
              result={activeResult}
              processedImage={processedImg}
              onReset={handleReset}
            />
          ) : (
            <ImageCapture
              useMock={useMock}
              onSuccess={handlePredictionSuccess}
              onReset={handleReset}
            />
          )}

          {/* Educational Section "Mengapa Harus Tepat 29cm?" (When Idle) */}
          {!activeResult && (
            <section className="mt-12 rounded-[24px] border border-sky-200 bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(14,165,233,0.10)]">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Visual Line-art distance icon */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E0F2FE] border border-sky-200 shadow-inner">
                  <div className="flex flex-col items-center">
                    <Ruler className="h-7 w-7 text-[#F59E0B]" />
                    <span className="text-[9px] font-black tracking-wider text-[#0EA5E9]">29 CM</span>
                  </div>
                </div>

                {/* Explanation text */}
                <div className="flex-1 space-y-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0C4A6E] font-heading flex items-center gap-2">
                    Mengapa Harus Tepat 29 cm?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    Model regresi SVR dikalibrasi secara matematis berdasarkan korelasi rasio piksel asli terhadap ukuran aktual udang pada jarak pemotretan vertikal tegak lurus <strong className="text-[#0C4A6E]">29 cm</strong>. Mengubah ketinggian kamera atau melakukan pemotongan (crop) gambar akan merusak rasio piksel, sehingga perhitungan luas piksel (area) dan keliling (perimeter) menjadi tidak akurat.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer onOpenSop={() => setIsSopOpen(true)} />

      <SopDialog isOpen={isSopOpen} onClose={() => setIsSopOpen(false)} />
    </div>
  );
}

