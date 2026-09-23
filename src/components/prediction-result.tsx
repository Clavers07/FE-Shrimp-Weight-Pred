'use client';

import { useState, useEffect, useRef } from 'react';
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
  Scale,
  Layers,
  TrendingUp,
  Info,
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
  const hasSavedRef = useRef<boolean>(false);

  const { total_detected, predictions } = result.data;

  // Calculate totals
  const totalWeightGram = predictions.reduce((acc, curr) => acc + curr.berat_gram, 0);
  const avgWeightGram = total_detected > 0 ? totalWeightGram / total_detected : 0;

  // Farm & Market Metrics:
  // Size = Ekor per kilogram (1000g / rata-rata berat)
  const sizePerKg = avgWeightGram > 0 ? Math.round(1000 / avgWeightGram) : 0;

  // Min & Max weight for uniformity analysis
  const weights = predictions.map((p) => p.berat_gram);
  const minWeight = weights.length > 0 ? Math.min(...weights) : 0;
  const maxWeight = weights.length > 0 ? Math.max(...weights) : 0;

  // Growth Stage classification based on Litopenaeus vannamei standards
  const getGrowthStage = (avgG: number) => {
    if (avgG < 2) return { label: 'Juvenil Awal', desc: 'Fase Adaptasi & Pembesaran Awal', color: 'text-sky-400', bg: 'bg-sky-500/20', border: 'border-sky-500/30' };
    if (avgG < 10) return { label: 'Sub-Dewasa', desc: 'Fase Pertumbuhan Cepat (DOC 30-60)', color: 'text-violet-400', bg: 'bg-violet-500/20', border: 'border-violet-500/30' };
    if (avgG < 16) return { label: 'Panen Parsial (Size 60-100)', desc: 'Ukuran Pasar Domestik / Parsial', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' };
    if (avgG < 25) return { label: 'Ukuran Ekspor (Size 40-60)', desc: 'Ukuran Premium Siap Panen Total', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' };
    return { label: 'Ukuran Super (Size < 40)', desc: 'Kategori Jumbo / Indukan', color: 'text-teal-400', bg: 'bg-teal-500/20', border: 'border-teal-500/30' };
  };

  const stage = getGrowthStage(avgWeightGram);

  // Trigger light success micro-interaction on mount if detection > 0
  useEffect(() => {
    if (total_detected > 0 && !hasSavedRef.current) {
      hasSavedRef.current = true;

      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#3B9FE8', '#E8A33D', '#FFFFFF'],
      });

      // Auto-save scan result to localStorage (creates persistent base64 thumbnail)
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
      }).then(() => {
        setSaved(true);
      });
    }
  }, [result, processedImage, total_detected, totalWeightGram, avgWeightGram, predictions]);

  const handleShare = async () => {
    const textToShare = `[ShrimpWeightAI] Hasil Estimasi Berat Udang:\n• Terdeteksi: ${total_detected} ekor\n• Total Berat: ${totalWeightGram.toFixed(2)} gram\n• Rata-rata: ${avgWeightGram.toFixed(2)} gram/ekor\n• Estimasi Size: ~${sizePerKg} ekor/kg\n• Kategori: ${stage.label}`;

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
      <div className="rounded-[24px] border border-amber-300 bg-white p-8 sm:p-12 text-center shadow-[0_4px_24px_rgba(245,158,11,0.12)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-[#EA580C] border border-amber-200 mb-4">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <h3 className="text-xl font-extrabold text-[#0C4A6E] font-heading">
          Tidak Ada Udang Terdeteksi
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-[#475569] max-w-md mx-auto leading-relaxed">
          Model segmentasi YOLO26 tidak menemukan objek udang yang jelas. Pastikan posisi udang tidak tertutup, alas peletakan polos tanpa motif, dan kamera berada pada jarak tepat <strong className="text-[#0C4A6E]">29 cm</strong>.
        </p>

        <div className="mt-6">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-full bg-[#EA580C] hover:bg-[#C2410C] px-8 py-3.5 text-xs font-extrabold text-white shadow-md transition-all min-h-[44px]"
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
      <div className="relative overflow-hidden rounded-[24px] border border-sky-200 bg-gradient-to-br from-white via-[#F0F9FF] to-[#E0F2FE] p-6 sm:p-8 text-[#0C4A6E] shadow-[0_4px_24px_rgba(14,165,233,0.12)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full border border-sky-300 bg-white px-3 py-1 text-xs font-bold text-[#0284C7] shadow-xs">
                Model YOLOv26-Seg + SVR Aktif
              </span>
              {saved && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  <BookmarkPlus className="h-3.5 w-3.5" /> Tersimpan ke Riwayat
                </span>
              )}
            </div>

            <h2 className="mt-4 text-xs font-bold uppercase tracking-wider text-[#64748B] font-heading">
              {total_detected === 1 ? 'Estimasi Berat Udang' : `Total Estimasi (${total_detected} Udang)`}
            </h2>

            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-4xl sm:text-6xl font-black tracking-tight text-[#EA580C] font-heading">
                {totalWeightGram.toFixed(2)}
              </span>
              <span className="text-2xl font-bold text-[#475569]">gram</span>
            </div>

            {total_detected > 1 && (
              <p className="mt-2 text-xs sm:text-sm text-[#475569]">
                Rata-rata: <strong className="text-[#0C4A6E]">{avgWeightGram.toFixed(2)} gram</strong> / ekor
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white hover:bg-sky-50 px-5 py-3 text-xs font-bold text-[#0C4A6E] shadow-xs transition-all min-h-[44px]"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4 text-[#0EA5E9]" />}
              <span>{copied ? 'Tersalin!' : 'Bagikan Hasil'}</span>
            </button>

            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white px-6 py-3 text-xs font-extrabold shadow-md hover:shadow-lg transition-all min-h-[44px]"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Pindai Foto Lain</span>
            </button>
          </div>
        </div>

        {/* Aquaculture & Market Insight Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-sky-200/80">
          {/* Card 1: Size Udang (Count per Kg) */}
          <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#0284C7]">Estimasi Size Pasar</span>
              <Scale className="h-4 w-4 text-[#0EA5E9]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#0C4A6E] font-heading">
                Size ~{sizePerKg}
              </span>
              <span className="text-xs text-[#64748B] font-medium">ekor/kg</span>
            </div>
            <p className="mt-1 text-[11px] text-[#475569] leading-tight">
              Standar acuan transaksi dan klasifikasi harga jual panen.
            </p>
          </div>

          {/* Card 2: Growth Stage Classification */}
          <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-700">Fase Budidaya</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-[#0C4A6E] font-heading">
                {stage.label}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[#475569] leading-tight">
              {stage.desc}
            </p>
          </div>

          {/* Card 3: Uniformity & Min-Max Range */}
          <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700">Rentang Bobot Sampel</span>
              <Layers className="h-4 w-4 text-[#EA580C]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-extrabold text-[#0C4A6E] font-heading">
                {minWeight.toFixed(1)}g - {maxWeight.toFixed(1)}g
              </span>
              {total_detected > 1 && (
                <span className="text-[10px] text-amber-700 font-mono font-bold">
                  (Δ {(maxWeight - minWeight).toFixed(1)}g)
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-[#475569] leading-tight">
              {total_detected > 1 && (maxWeight - minWeight) < 4
                ? 'Ukuran sampel tergolong seragam (uniform).'
                : 'Variasi bobot dalam satu nampan sampel.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Canvas Overlay + Shrimp List Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Polygon Canvas Visualizer (7 cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-[24px] border border-sky-200 bg-white p-5 sm:p-6 shadow-[0_4px_24px_rgba(14,165,233,0.10)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#0C4A6E] font-heading">
                Visualisasi Overlay Segmentasi Poligon
              </h3>
              <span className="rounded-full bg-sky-50 border border-sky-200 px-3 py-0.5 text-xs font-bold text-[#0284C7]">
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

            <p className="mt-3 text-xs text-[#64748B] leading-relaxed">
              * Koordinat poligon disesuaikan otomatis dari piksel asli foto tanpa distorsi aspek rasio.
            </p>
          </div>
        </div>

        {/* Right Column: Shrimp Extracted Features Table (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-[24px] border border-sky-200 bg-white p-5 sm:p-6 shadow-[0_4px_24px_rgba(14,165,233,0.10)]">
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#0C4A6E] font-heading mb-4">
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
                        ? 'border-[#EA580C] bg-orange-50/70 ring-2 ring-[#EA580C]/40'
                        : 'border-sky-100 bg-[#F8FAFC] hover:border-sky-300 hover:bg-sky-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-100 border border-sky-200 text-xs font-black text-[#0284C7]">
                          #{pred.id}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-[#0C4A6E]">
                          Udang Objek #{pred.id}
                        </span>
                      </div>

                      <span className="text-base sm:text-lg font-black text-[#EA580C] font-heading">
                        {pred.berat_gram.toFixed(2)} g
                      </span>
                    </div>

                    {/* Extracted Features List */}
                    <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-sky-100 text-xs">
                      {Object.entries(pred.features_extracted).map(([key, val]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-[#64748B] uppercase text-[10px] font-bold tracking-wider">
                            {key}
                          </span>
                          <span className="font-mono font-bold text-[#0C4A6E]">
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
            <div className="rounded-[20px] border border-sky-200 bg-[#F0F9FF] p-4 text-xs text-[#475569]">
              <h4 className="font-bold text-[#0C4A6E] mb-2 font-heading">
                Metadata Model Inferensi Backend
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div>
                  Waktu Proses: <strong className="text-[#0C4A6E]">{result.meta.processing_time_ms || '-'} ms</strong>
                </div>
                <div>
                  YOLO Version: <strong className="text-[#0C4A6E]">{result.meta.model_yolo_version || '-'}</strong>
                </div>
                <div className="col-span-2">
                  SVR Combination: <strong className="text-[#0284C7]">{result.meta.model_svr_combination || '-'}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

