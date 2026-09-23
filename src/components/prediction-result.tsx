'use client';

import { useState, useEffect } from 'react';
import { PredictSuccessResponse } from '@/lib/types';
import { ProcessedImageResult } from '@/lib/exif-processor';
import { saveScanResultToHistory } from '@/lib/storage';
import { PolygonCanvas } from './polygon-canvas';
import confetti from 'canvas-confetti';
import {
  Share2,
  Check,
  RotateCcw,
  BookmarkPlus,
  AlertTriangle,
} from 'lucide-react';

interface PredictionResultProps {
  result: PredictSuccessResponse;
  processedImage: ProcessedImageResult;
  onReset: () => void;
}

export function PredictionResult({ result, processedImage, onReset }: PredictionResultProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const { total_detected, predictions } = result.data;

  // Calculate totals
  const totalWeightGram = predictions.reduce((acc, curr) => acc + curr.berat_gram, 0);
  const avgWeightGram = total_detected > 0 ? totalWeightGram / total_detected : 0;

  // Trigger light success micro-interaction on mount if detection > 0
  useEffect(() => {
    if (total_detected > 0) {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#3B9FE8', '#E8A33D', '#FFFFFF'],
      });

      // Auto-save scan result to localStorage
      saveScanResultToHistory({
        imageName: processedImage.file.name,
        imageDataUrl: processedImage.previewUrl,
        originalWidth: processedImage.processedDimensions.width,
        originalHeight: processedImage.processedDimensions.height,
        totalDetected: total_detected,
        totalWeightGram,
        averageWeightGram: avgWeightGram,
        predictions,
        meta: result.meta,
        requestId: result.request_id,
      });
      setSaved(true);
    }
  }, [result, processedImage, total_detected, totalWeightGram, avgWeightGram, predictions]);

  const handleShare = async () => {
    const textToShare = `[ShrimpWeightAI] Hasil Estimasi Berat Udang:\n: Total Terdeteksi: ${total_detected} udang\n: Total Berat: ${totalWeightGram.toFixed(
      2
    )} gram\n: Rata-rata Berat: ${avgWeightGram.toFixed(2)} gram/udang`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hasil Estimasi Berat Udang',
          text: textToShare,
        });
      } catch (err) {
        console.warn('[Share] Web Share API cancelled or failed:', err);
      }
    } else {
      await navigator.clipboard.writeText(textToShare);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // STATE 1: EMPTY RESULT (0 shrimp detected)
  if (total_detected === 0) {
    return (
      <div className="rounded-[24px] border border-amber-500/30 bg-[#0F2440] p-8 sm:p-12 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-[#E8A33D] mb-4">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <h3 className="text-xl font-extrabold text-white font-heading">
          Tidak Ada Udang Terdeteksi
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
          Model segmentasi YOLOv8 tidak menemukan objek udang yang jelas. Pastikan posisi udang tidak tertutup, alas peletakan polos tanpa motif, dan kamera berada pada jarak tepat <strong className="text-white">29 cm</strong>.
        </p>

        <div className="mt-6">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-full bg-[#E8A33D] hover:bg-[#D6922C] px-8 py-3.5 text-xs font-extrabold text-[#0A1A2F] shadow-lg transition-all min-h-[44px]"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Foto Ulang Dengan SOP 29cm</span>
          </button>
        </div>
      </div>
    );
  }

  // STATE 2: SUCCESS RESULT
  return (
    <div className="space-y-6">
      {/* Top Banner & Main Prominent Weight Display */}
      <div className="relative overflow-hidden rounded-[24px] border border-[#3B9FE8]/30 bg-gradient-to-r from-[#0F2440] via-[#0D2038] to-[#0A1A2F] p-6 sm:p-8 text-white shadow-2xl">
        {/* Glow accent */}
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[#3B9FE8]/10 blur-3xl" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full border border-[#3B9FE8]/30 bg-[#3B9FE8]/15 px-3 py-1 text-xs font-semibold text-[#3B9FE8]">
                Model YOLOv8-Seg + SVR Aktif
              </span>
              {saved && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <BookmarkPlus className="h-3.5 w-3.5" /> Tersimpan ke Riwayat
                </span>
              )}
            </div>

            <h2 className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-300 font-heading">
              {total_detected === 1 ? 'Estimasi Berat Udang' : `Total Estimasi (${total_detected} Udang)`}
            </h2>

            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-4xl sm:text-6xl font-black tracking-tight text-[#E8A33D] font-heading drop-shadow-md">
                {totalWeightGram.toFixed(2)}
              </span>
              <span className="text-2xl font-bold text-slate-300">gram</span>
            </div>

            {total_detected > 1 && (
              <p className="mt-2 text-xs sm:text-sm text-slate-300">
                Rata-rata: <strong className="text-white">{avgWeightGram.toFixed(2)} gram</strong> / ekor
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-5 py-3 text-xs font-bold text-white backdrop-blur-md transition-all min-h-[44px]"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4 text-[#3B9FE8]" />}
              <span>{copied ? 'Tersalin!' : 'Bagikan Hasil'}</span>
            </button>

            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-full bg-[#E8A33D] hover:bg-[#D6922C] text-[#0A1A2F] px-6 py-3 text-xs font-extrabold shadow-lg hover:shadow-[0_0_20px_rgba(232,163,61,0.35)] transition-all min-h-[44px]"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Pindai Foto Lain</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Canvas Overlay + Shrimp List Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Polygon Canvas Visualizer (7 cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-[24px] border border-white/10 bg-[#0F2440] p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-300 font-heading">
                Visualisasi Overlay Segmentasi Poligon
              </h3>
              <span className="rounded-full bg-[#3B9FE8]/20 border border-[#3B9FE8]/40 px-3 py-0.5 text-xs font-bold text-[#3B9FE8]">
                {total_detected} Objek
              </span>
            </div>

            <PolygonCanvas
              imageSrc={processedImage.previewUrl}
              originalWidth={processedImage.processedDimensions.width}
              originalHeight={processedImage.processedDimensions.height}
              predictions={predictions}
              selectedPredictionId={selectedId}
              onSelectPrediction={setSelectedId}
            />

            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              * Koordinat poligon disesuaikan otomatis dari piksel asli foto tanpa distorsi aspek rasio.
            </p>
          </div>
        </div>

        {/* Right Column: Shrimp Extracted Features Table (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-[24px] border border-white/10 bg-[#0F2440] p-5 sm:p-6 shadow-xl">
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-300 font-heading mb-4">
              Rincian Objek & Fitur Geometri
            </h3>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {predictions.map((pred) => {
                const isSelected = selectedId === pred.id;
                return (
                  <div
                    key={pred.id}
                    onClick={() => setSelectedId(isSelected ? null : pred.id)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? 'border-[#E8A33D] bg-[#E8A33D]/10 ring-2 ring-[#E8A33D]/40'
                        : 'border-white/10 bg-[#0A1A2F]/60 hover:border-[#3B9FE8]/40 hover:bg-[#0A1A2F]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#3B9FE8] text-xs font-black text-[#0A1A2F]">
                          #{pred.id}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-white">
                          Udang Objek #{pred.id}
                        </span>
                      </div>

                      <span className="text-base sm:text-lg font-black text-[#E8A33D] font-heading">
                        {pred.berat_gram.toFixed(2)} g
                      </span>
                    </div>

                    {/* Extracted Features List */}
                    <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-xs">
                      {Object.entries(pred.features_extracted).map(([key, val]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                            {key}
                          </span>
                          <span className="font-mono font-bold text-white">
                            {typeof val === 'number' ? val.toFixed(1) : val || '-'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Metadata */}
          {result.meta && (
            <div className="rounded-[20px] border border-white/10 bg-[#0A1A2F]/80 p-4 text-xs text-slate-300">
              <h4 className="font-bold text-white mb-2 font-heading">
                Metadata Model Inferensi Backend
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div>
                  Waktu Proses: <strong className="text-white">{result.meta.processing_time_ms || '-'} ms</strong>
                </div>
                <div>
                  YOLO Version: <strong className="text-white">{result.meta.model_yolo_version || '-'}</strong>
                </div>
                <div className="col-span-2">
                  SVR Combination: <strong className="text-[#3B9FE8]">{result.meta.model_svr_combination || '-'}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

