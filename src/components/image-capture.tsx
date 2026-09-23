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
  FileImage,
  Info,
  Sparkles,
  RotateCcw,
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
        <div className="rounded-[24px] border-2 border-dashed border-[#3B9FE8]/30 bg-[#0F2440] hover:border-[#3B9FE8] p-8 sm:p-12 text-center shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-all group">
          {/* Custom Camera Icon filled with --accent-gold */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#0A1A2F] border border-[#E8A33D]/40 text-[#E8A33D] shadow-lg shadow-black/30 mb-5 group-hover:scale-105 transition-transform">
            <Camera className="h-10 w-10 fill-[#E8A33D]/20 text-[#E8A33D]" />
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
            Pilih atau Ambil Foto Udang
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Posisikan kamera HP tegak lurus pada jarak tepat <strong className="text-white">29 cm</strong> di atas permukaan alas udang. Format didukung: JPG, JPEG, PNG.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary button: Gunakan Kamera HP with accent-gold */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-[#E8A33D] hover:bg-[#D6922C] px-8 py-3.5 text-sm font-extrabold text-[#0A1A2F] shadow-lg hover:shadow-[0_0_20px_rgba(232,163,61,0.35)] transition-all min-h-[48px]"
            >
              <Camera className="h-4 w-4" />
              <span>Gunakan Kamera HP</span>
            </button>

            {/* Secondary button: Pilih Dari Galeri with outline accent-blue */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-[#3B9FE8] bg-transparent hover:bg-[#3B9FE8]/10 px-8 py-3.5 text-sm font-extrabold text-white transition-all min-h-[48px]"
            >
              <Upload className="h-4 w-4 text-[#3B9FE8]" />
              <span>Pilih Dari Galeri</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 2: PROCESSING EXIF & RESIZE */}
      {uiState === 'processing_exif' && (
        <div className="rounded-[24px] border border-white/10 bg-[#0F2440] p-10 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A1A2F] text-[#3B9FE8] border border-[#3B9FE8]/30 mb-4">
            <RefreshCw className="h-8 w-8 animate-spin text-[#3B9FE8]" />
          </div>
          <p className="text-base font-bold text-white font-heading">
            Mengoreksi Orientasi EXIF & Resolusi Piksel...
          </p>
          <p className="mt-1.5 text-xs text-slate-300 max-w-md mx-auto">
            Memastikan orientasi foto sesuai sensor kamera asli tanpa mengubah rasio aspek 100%.
          </p>
        </div>
      )}

      {/* STATE 3: PREVIEWING */}
      {uiState === 'previewing' && processedData && (
        <div className="rounded-[24px] border border-white/10 bg-[#0F2440] p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <FileImage className="h-5 w-5 text-[#3B9FE8]" />
              <h4 className="text-sm sm:text-base font-extrabold text-white font-heading">
                Pratinjau Foto Sebelum Analisis
              </h4>
            </div>

            <button
              onClick={handleRetake}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 min-h-[36px] px-2 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              <span>Ambil Ulang</span>
            </button>
          </div>

          {/* Preview Frame */}
          <div className="relative mx-auto max-h-[420px] overflow-hidden rounded-[20px] bg-[#0A1A2F] flex items-center justify-center border border-white/10 p-2 shadow-inner">
            {/* eslint-disable-next-html-element */}
            <img
              src={processedData.previewUrl}
              alt="Pratinjau foto udang"
              className="max-h-[390px] w-auto object-contain rounded-xl"
            />
          </div>

          {/* Resized notification if applied */}
          {processedData.wasResized && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-950/40 p-3 text-xs text-amber-200">
              <Info className="h-4 w-4 shrink-0 text-[#E8A33D] mt-0.5" />
              <span>
                Ukuran file awal <strong>{formatBytes(processedData.originalSizeBytes)}</strong> disesuaikan secara proporsional menjadi{' '}
                <strong>{formatBytes(processedData.processedSizeBytes)}</strong> ({processedData.processedDimensions.width}×{processedData.processedDimensions.height}px) agar proses inferensi lebih efisien di lapangan.
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleStartSubmit}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#E8A33D] hover:bg-[#D6922C] py-3.5 px-6 text-sm font-extrabold text-[#0A1A2F] shadow-lg hover:shadow-[0_0_20px_rgba(232,163,61,0.3)] transition-all min-h-[48px]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Mulai Analisis & Estimasi Berat</span>
            </button>

            <button
              onClick={handleRetake}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent hover:bg-white/5 py-3.5 px-6 text-xs font-bold text-slate-300 hover:text-white transition-all min-h-[48px]"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Ganti Foto</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 4: UPLOADING & COMPUTING */}
      {uiState === 'uploading' && (
        <div className="rounded-[24px] border border-[#3B9FE8]/30 bg-gradient-to-b from-[#0F2440] to-[#0A1A2F] p-10 text-center shadow-xl">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#0A1A2F] border border-[#3B9FE8]/40 text-[#3B9FE8] shadow-lg mb-5">
            <RefreshCw className="h-9 w-9 animate-spin text-[#3B9FE8]" />
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-white font-heading">
            Mengirim Gambar & Memproses Inferensi AI...
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Model YOLOv8-Seg sedang mengekstrak poligon dan model SVR mengestimasi gramatur udang.
          </p>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleCancelUpload}
              className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-950/40 px-5 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-900/40 transition-colors min-h-[44px]"
            >
              <XCircle className="h-4 w-4" />
              <span>Batalkan Pengunggahan</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 5: ERROR STATE */}
      {uiState === 'error' && errorDetails && (
        <div className="rounded-[24px] border border-rose-500/40 bg-[#0F2440] p-6 sm:p-8 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <AlertCircle className="h-6 w-6" />
            </div>

            <div className="flex-1">
              {(() => {
                const mapped = formatErrorCode(
                  (errorDetails.code as any) || 'UNKNOWN_ERROR'
                );
                return (
                  <>
                    <h4 className="text-base font-extrabold text-white font-heading">
                      {mapped.title}
                    </h4>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-300">
                      {errorDetails.message || mapped.message}
                    </p>
                    <p className="mt-3 text-xs font-semibold text-rose-300">
                      Petunjuk: {mapped.action}
                    </p>
                  </>
                );
              })()}

              {errorDetails.requestId && (
                <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
                  <span>Log Request ID:</span>
                  <code className="rounded-lg bg-[#0A1A2F] px-2 py-0.5 font-mono text-[#3B9FE8] border border-white/10">
                    {errorDetails.requestId}
                  </code>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleRetake}
                  className="rounded-full bg-[#E8A33D] hover:bg-[#D6922C] px-6 py-2.5 text-xs font-extrabold text-[#0A1A2F] transition-colors min-h-[44px]"
                >
                  Ambil Ulang Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

