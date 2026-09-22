'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SopBanner } from '@/components/sop-banner';
import { SopDialog } from '@/components/sop-dialog';
import { ImageCapture } from '@/components/image-capture';
import { PredictionResult } from '@/components/prediction-result';
import { PredictResult, PredictSuccessResponse } from '@/lib/types';
import { ProcessedImageResult } from '@/lib/exif-processor';
import { Waves, Sparkles, Ruler } from 'lucide-react';

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
    <div className="flex min-h-screen flex-col">
      <Navbar
        useMock={useMock}
        onToggleMock={setUseMock}
        onOpenSop={() => setIsSopOpen(true)}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          {/* SOP Notification Banner */}
          <SopBanner onOpenFullSop={() => setIsSopOpen(true)} />

          {/* Section Title */}
          {!activeResult && (
            <div className="mb-6 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Estimasi Berat Udang <span className="text-[#028090]">Kamera Digital</span>
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Segmentasi instans YOLOv8 & Regresi SVR presisi tinggi dengan jarak konstan <strong>29 cm</strong>.
              </p>
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

          {/* SOP Quick Reference Section when Idle */}
          {!activeResult && (
            <div className="mt-12 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Ruler className="h-4 w-4 text-[#028090]" />
                Mengapa Harus Tepat 29 cm?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Model regresi SVR dikalibrasi berdasarkan hubungan rasio piksel asli terhadap ukuran aktual udang pada jarak pemotretan vertikal tegak lurus <strong>29 cm</strong>. Mengubah jarak atau melakukan cropping gambar secara acak akan mengubah rasio piksel dan merusak akurasi perhitungan luas piksel (area) serta keliling (perimeter).
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer onOpenSop={() => setIsSopOpen(true)} />

      <SopDialog isOpen={isSopOpen} onClose={() => setIsSopOpen(false)} />
    </div>
  );
}
