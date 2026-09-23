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
        <div className="rounded-[24px] border-2 border-dashed border-sky-300 bg-white hover:border-[#0EA5E9] p-8 sm:p-12 text-center shadow-[0_4px_24px_rgba(14,165,233,0.10)] transition-all group">
          {/* Custom Camera Icon with Marine Navy and Amber Accent */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F0F9FF] border border-sky-200 text-[#0284C7] shadow-sm mb-5 group-hover:scale-105 transition-transform">
            <Camera className="h-10 w-10 text-[#0EA5E9]" />
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-[#0C4A6E] font-heading">
            Pilih atau Ambil Foto Udang
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#475569] max-w-lg mx-auto leading-relaxed">
            Posisikan kamera HP tegak lurus pada jarak tepat <strong className="text-[#0C4A6E]">29 cm</strong> di atas permukaan alas udang. Format didukung: JPG, JPEG, PNG.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary button: Gunakan Kamera HP with Coral/Amber CTA */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-[#EA580C] hover:bg-[#C2410C] px-8 py-3.5 text-sm font-extrabold text-white shadow-md hover:shadow-lg transition-all min-h-[48px]"
            >
              <Camera className="h-4 w-4" />
              <span>Gunakan Kamera HP</span>
            </button>

            {/* Secondary button: Pilih Dari Galeri with Ocean Outline */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-[#0EA5E9] bg-white hover:bg-sky-50 px-8 py-3.5 text-sm font-extrabold text-[#0284C7] transition-all min-h-[48px]"
            >
              <Upload className="h-4 w-4 text-[#0EA5E9]" />
              <span>Pilih Dari Galeri</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 2: PROCESSING EXIF & RESIZE */}
      {uiState === 'processing_exif' && (
        <div className="rounded-[24px] border border-sky-200 bg-white p-10 text-center shadow-[0_4px_24px_rgba(14,165,233,0.10)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-[#0EA5E9] border border-sky-200 mb-4">
            <RefreshCw className="h-8 w-8 animate-spin text-[#0EA5E9]" />
          </div>
          <p className="text-base font-bold text-[#0C4A6E] font-heading">
            Mengoreksi Orientasi EXIF & Resolusi Piksel...
          </p>
          <p className="mt-1.5 text-xs text-[#475569] max-w-md mx-auto">
            Memastikan orientasi foto sesuai sensor kamera asli tanpa mengubah rasio aspek 100%.
          </p>
        </div>
      )}

      {/* STATE 3: PREVIEWING */}
      {uiState === 'previewing' && processedData && (
        <div className="rounded-[24px] border border-sky-200 bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(14,165,233,0.10)]">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-sky-100">
            <div className="flex items-center gap-2.5">
              <FileImage className="h-5 w-5 text-[#0EA5E9]" />
              <h4 className="text-sm sm:text-base font-extrabold text-[#0C4A6E] font-heading">
                Pratinjau Foto Sebelum Analisis
              </h4>
            </div>

            <button
              onClick={handleRetake}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 min-h-[36px] px-2 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              <span>Ambil Ulang</span>
            </button>
          </div>

          {/* Preview Frame */}
          <div className="relative mx-auto max-h-[420px] overflow-hidden rounded-[20px] bg-[#F8FAFC] flex items-center justify-center border border-sky-200 p-2 shadow-inner">
            {/* eslint-disable-next-html-element */}
            <img
              src={processedData.previewUrl}
              alt="Pratinjau foto udang"
              className="max-h-[390px] w-auto object-contain rounded-xl"
            />
          </div>

          {/* Resized notification if applied */}
          {processedData.wasResized && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <Info className="h-4 w-4 shrink-0 text-[#EA580C] mt-0.5" />
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
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#EA580C] hover:bg-[#C2410C] py-3.5 px-6 text-sm font-extrabold text-white shadow-md hover:shadow-lg transition-all min-h-[48px]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Mulai Analisis & Estimasi Berat</span>
            </button>

            <button
              onClick={handleRetake}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-sky-300 bg-white hover:bg-sky-50 py-3.5 px-6 text-xs font-bold text-[#0C4A6E] transition-all min-h-[48px]"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Ganti Foto</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 4: UPLOADING & COMPUTING */}
      {uiState === 'uploading' && (
        <div className="rounded-[24px] border border-sky-200 bg-white p-10 text-center shadow-[0_4px_24px_rgba(14,165,233,0.10)]">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-50 border border-sky-200 text-[#0EA5E9] shadow-sm mb-5">
            <RefreshCw className="h-9 w-9 animate-spin text-[#0EA5E9]" />
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-[#0C4A6E] font-heading">
            Mengirim Gambar & Memproses Inferensi AI...
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#475569] max-w-md mx-auto">
            Model YOLOv26-Seg sedang mengekstrak poligon dan model SVR mengestimasi gramatur udang.
          </p>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleCancelUpload}
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors min-h-[44px]"
            >
              <XCircle className="h-4 w-4" />
              <span>Batalkan Pengunggahan</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 5: ERROR STATE */}
      {uiState === 'error' && errorDetails && (
        <div className="rounded-[24px] border border-rose-200 bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(244,63,94,0.10)]">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-600">
              <AlertCircle className="h-6 w-6" />
            </div>

            <div className="flex-1">
              {(() => {
                const mapped = formatErrorCode(
                  (errorDetails.code as any) || 'UNKNOWN_ERROR'
                );
                return (
                  <>
                    <h4 className="text-base font-extrabold text-[#0C4A6E] font-heading">
                      {mapped.title}
                    </h4>
                    <p className="mt-1.5 text-xs sm:text-sm text-[#475569]">
                      {errorDetails.message || mapped.message}
                    </p>
                    <p className="mt-3 text-xs font-semibold text-rose-600">
                      Petunjuk: {mapped.action}
                    </p>
                  </>
                );
              })()}

              {errorDetails.requestId && (
                <div className="mt-4 flex items-center gap-2 text-[11px] text-[#64748B]">
                  <span>Log Request ID:</span>
                  <code className="rounded-lg bg-sky-50 px-2 py-0.5 font-mono text-[#0284C7] border border-sky-200">
                    {errorDetails.requestId}
                  </code>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleRetake}
                  className="rounded-full bg-[#EA580C] hover:bg-[#C2410C] px-6 py-2.5 text-xs font-extrabold text-white transition-colors min-h-[44px]"
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

