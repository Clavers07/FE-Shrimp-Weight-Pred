'use client';

import { useState, useEffect } from 'react';
import { PredictSuccessResponse, ShrimpPrediction } from '@/lib/types';
import { ProcessedImageResult } from '@/lib/exif-processor';
import { saveScanResultToHistory } from '@/lib/storage';
import { PolygonCanvas } from './polygon-canvas';
import confetti from 'canvas-confetti';
import {
  Scale,
  Share2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  ChevronRight,
  Layers,
  Ruler,
  Maximize2,
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
        colors: ['#00F0FF', '#10B981', '#0F4C81'],
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
    const textToShare = `[ShrimpWeightAI] Hasil Estimasi Berat Udang:\n- Total Terdeteksi: ${total_detected} udang\n- Total Berat: ${totalWeightGram.toFixed(
      2
    )} gram\n- Rata-rata Berat: ${avgWeightGram.toFixed(2)} gram/udang`;

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
      <div className="rounded-3xl border border-amber-200/80 bg-amber-50/50 p-8 text-center shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 mb-4">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
          Tidak Ada Udang Terdeteksi
        </h3>
        <p className="mt-1 text-xs text-amber-800 dark:text-amber-300 max-w-md mx-auto leading-relaxed">
          Model segmentasi YOLOv8 tidak menemukan objek udang yang jelas. Pastikan posisi udang tidak tertutup, alas peletakan polos, dan kamera berada pada jarak <strong>29 cm</strong>.
        </p>

        <div className="mt-6">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0F4C81] px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-[#0a3154] transition-all"
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F4C81] via-[#028090] to-[#05668D] p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold text-cyan-100 backdrop-blur-xs">
                YOLOv8-Seg + SVR Model Active
              </span>
              {saved && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-300">
                  <BookmarkPlus className="h-3.5 w-3.5" /> Tersimpan ke Riwayat
                </span>
              )}
            </div>

            <h2 className="mt-3 text-xs font-medium uppercase tracking-wider text-cyan-200">
              {total_detected === 1 ? 'Estimasi Berat Udang' : `Total Estimasi (${total_detected} Udang)`}
            </h2>

            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm">
                {totalWeightGram.toFixed(2)}
              </span>
              <span className="text-xl font-bold text-cyan-200">gram</span>
            </div>

            {total_detected > 1 && (
              <p className="mt-2 text-xs text-cyan-100">
                Rata-rata: <strong>{avgWeightGram.toFixed(2)} gram</strong> / ekor
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition-all border border-white/20"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Share2 className="h-4 w-4" />}
              <span>{copied ? 'Tersalin!' : 'Bagikan Hasil'}</span>
            </button>

            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-[#0F4C81] px-4 py-2.5 text-xs font-bold shadow-md hover:bg-slate-100 transition-all"
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
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Visualisasi Overlay Segmentasi Poligon
              </h3>
              <span className="text-[11px] font-semibold text-[#028090]">
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

            <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
              * Koordinat poligon disesuaikan otomatis dari piksel asli foto tanpa distorsi aspek rasio.
            </p>
          </div>
        </div>

        {/* Right Column: Shrimp Extracted Features Table (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
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
                        ? 'border-[#028090] bg-cyan-50/80 ring-2 ring-[#028090]/40 dark:bg-cyan-950/40'
                        : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#0F4C81] text-xs font-bold text-white">
                          #{pred.id}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Udang Objek #{pred.id}
                        </span>
                      </div>

                      <span className="text-base font-extrabold text-[#0F4C81] dark:text-cyan-400">
                        {pred.berat_gram.toFixed(2)} g
                      </span>
                    </div>

                    {/* Extracted Features List Dynamic */}
                    <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                      {Object.entries(pred.features_extracted).map(([key, val]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-slate-400 uppercase text-[9px] font-semibold tracking-wider">
                            {key}
                          </span>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
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
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/60">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                Metadata Model Inferensi Backend
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div>
                  Waktu Proses: <strong>{result.meta.processing_time_ms || '-'} ms</strong>
                </div>
                <div>
                  YOLO Version: <strong>{result.meta.model_yolo_version || '-'}</strong>
                </div>
                <div className="col-span-2">
                  SVR Combination: <strong>{result.meta.model_svr_combination || '-'}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
