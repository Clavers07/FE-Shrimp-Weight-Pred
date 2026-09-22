'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { processShrimpImage, ProcessedImageResult } from '@/lib/exif-processor';
import { uploadShrimpImage } from '@/lib/api';
import { PredictResult } from '@/lib/types';
import { formatErrorCode, formatBytes } from '@/lib/utils';
import {
  Camera,
  Upload,
  RefreshCw,
  XCircle,
  AlertCircle,
  CheckCircle2,
  FileImage,
  Info,
  Scale,
  Sparkles,
} from 'lucide-react';

interface ImageCaptureProps {
  useMock: boolean;
  onSuccess: (result: PredictResult, processedImage: ProcessedImageResult) => void;
  onReset: () => void;
}

type UiState = 'idle' | 'processing_exif' | 'previewing' | 'uploading' | 'error';

export function ImageCapture({ useMock, onSuccess, onReset }: ImageCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [uiState, setUiState] = useState<UiState>('idle');
  const [processedData, setProcessedData] = useState<ProcessedImageResult | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ code?: string; message?: string; requestId?: string } | null>(
    null
  );

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const rawFile = files[0];
    setUiState('processing_exif');
    setErrorDetails(null);

    try {
      // Process EXIF rotation & uniform compression if >8MB
      const processed = await processShrimpImage(rawFile);
      setProcessedData(processed);
      setUiState('previewing');
    } catch (err) {
      console.error('[Capture] Error processing image EXIF:', err);
      setErrorDetails({
        message: 'Gagal memproses file gambar. Pastikan file gambar tidak korup.',
      });
      setUiState('error');
    }
  };

  const handleStartSubmit = async () => {
    if (!processedData) return;

    // Abort previous ongoing request if user submits again
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setUiState('uploading');
    setErrorDetails(null);

    try {
      const res = await uploadShrimpImage(processedData.file, controller.signal, {
        useMock,
      });

      if (res.ok) {
        setUiState('idle');
        onSuccess(res, processedData);
      } else {
        setErrorDetails({
          code: res.error_code,
          message: res.message,
          requestId: res.requestId,
        });
        setUiState('error');
      }
    } catch (err) {
      console.error('[Upload] Error submitting image:', err);
      setErrorDetails({
        code: 'NETWORK_ERROR',
        message: 'Koneksi ke server terputus.',
      });
      setUiState('error');
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setUiState('previewing');
  };

  const handleRetake = () => {
    if (processedData?.previewUrl) {
      URL.revokeObjectURL(processedData.previewUrl);
    }
    setProcessedData(null);
    setErrorDetails(null);
    setUiState('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    onReset();
  };

  return (
    <div className="w-full">
      {/* Hidden Native File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* STATE 1: IDLE */}
      {uiState === 'idle' && (
        <div className="rounded-3xl border-2 border-dashed border-cyan-200 bg-white p-8 text-center shadow-xs dark:border-cyan-900/50 dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0F4C81] to-[#028090] text-white shadow-md shadow-cyan-900/20 mb-4">
            <Camera className="h-8 w-8" />
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Pilih atau Ambil Foto Udang
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Gunakan kamera HP tegak lurus pada jarak <strong>29 cm</strong> dari permukaan alas udang. Format JPG/PNG.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F4C81] to-[#028090] px-5 py-3 text-xs font-bold text-white shadow-md hover:opacity-95 transition-all"
            >
              <Camera className="h-4 w-4" />
              <span>Gunakan Kamera HP</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <Upload className="h-4 w-4" />
              <span>Pilih Dari Galeri</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 2: PROCESSING EXIF & RESIZE */}
      {uiState === 'processing_exif' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#028090]" />
          <p className="mt-3 text-xs font-bold text-slate-800 dark:text-slate-200">
            Mengoreksi Orientasi EXIF & Resolusi Piksel...
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Memastikan orientasi foto sesuai sensor tanpa merusak aspek rasio 100%.
          </p>
        </div>
      )}

      {/* STATE 3: PREVIEWING */}
      {uiState === 'previewing' && processedData && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FileImage className="h-4 w-4 text-[#028090]" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Pratinjau Foto Sebelum Analisis
              </h4>
            </div>

            <button
              onClick={handleRetake}
              className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Ambil Ulang</span>
            </button>
          </div>

          {/* Preview Frame */}
          <div className="relative mx-auto max-h-[380px] overflow-hidden rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800">
            {/* eslint-disable-next-html-element */}
            <img
              src={processedData.previewUrl}
              alt="Pratinjau foto udang"
              className="max-h-[360px] w-auto object-contain"
            />
          </div>

          {/* Resized notification if applied */}
          {processedData.wasResized && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-2.5 text-[11px] text-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <span>
                Ukuran file awal <strong>{formatBytes(processedData.originalSizeBytes)}</strong> disesuaikan uniform ke{' '}
                <strong>{formatBytes(processedData.processedSizeBytes)}</strong> ({processedData.processedDimensions.width}×{processedData.processedDimensions.height}px) agar pengunggahan lebih cepat di lapangan.
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleStartSubmit}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F4C81] to-[#028090] py-3 text-xs font-bold text-white shadow-md hover:opacity-95 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Mulai Analisis & Estimasi Berat</span>
            </button>

            <button
              onClick={handleRetake}
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
            >
              Ganti Foto
            </button>
          </div>
        </div>
      )}

      {/* STATE 4: UPLOADING & COMPUTING */}
      {uiState === 'uploading' && (
        <div className="rounded-3xl border border-cyan-200 bg-gradient-to-b from-cyan-50/50 to-white p-8 text-center shadow-md dark:border-cyan-900/40 dark:from-slate-900 dark:to-slate-900">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F4C81] text-white shadow-lg mb-4">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Mengirim Gambar & Memproses Inferensi AI...
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Model YOLOv8-Seg mengekstrak poligon & SVR mengestimasi gramatur udang.
          </p>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleCancelUpload}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              <span>Batalkan Pengunggahan</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 5: ERROR STATE */}
      {uiState === 'error' && errorDetails && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/20">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white">
              <AlertCircle className="h-5 w-5" />
            </div>

            <div className="flex-1">
              {(() => {
                const mapped = formatErrorCode(
                  (errorDetails.code as any) || 'UNKNOWN_ERROR'
                );
                return (
                  <>
                    <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                      {mapped.title}
                    </h4>
                    <p className="mt-1 text-xs text-rose-800 dark:text-rose-300">
                      {errorDetails.message || mapped.message}
                    </p>
                    <p className="mt-2 text-xs font-medium text-rose-950 dark:text-rose-100">
                      👉 <strong>Aksi:</strong> {mapped.action}
                    </p>
                  </>
                );
              })()}

              {errorDetails.requestId && (
                <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
                  <span>Log Request ID:</span>
                  <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                    {errorDetails.requestId}
                  </code>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleRetake}
                  className="rounded-xl bg-rose-700 px-4 py-2 text-xs font-bold text-white hover:bg-rose-800 transition-colors"
                >
                  Coba Ambil Ulang Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
