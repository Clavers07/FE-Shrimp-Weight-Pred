'use client';

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { processShrimpImage, type ProcessedImageResult } from '@/lib/exif-processor';
import { uploadShrimpImage } from '@/lib/api';
import { type ErrorCode, type PredictResult } from '@/lib/types';
import { formatErrorCode, formatBytes } from '@/lib/utils';
import { AlertCircle, Camera, Check, FileImage, LoaderCircle, RotateCcw, ScanLine, Upload, X } from 'lucide-react';
import styles from './image-capture.module.css';

interface ImageCaptureProps {
  useMock: boolean;
  onSuccess: (result: PredictResult, processedImage: ProcessedImageResult) => void;
  onReset: () => void;
}

type UiState = 'idle' | 'processing_exif' | 'previewing' | 'uploading' | 'error';
type CaptureError = { code: ErrorCode; message?: string; requestId?: string };

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

export function ImageCapture({ useMock, onSuccess, onReset }: ImageCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const processingIdRef = useRef(0);
  const previewUrlRef = useRef<string | null>(null);
  const dragDepthRef = useRef(0);
  const stateHeadingRef = useRef<HTMLHeadingElement>(null);

  const [uiState, setUiState] = useState<UiState>('idle');
  const [processedData, setProcessedData] = useState<ProcessedImageResult | null>(null);
  const [errorDetails, setErrorDetails] = useState<CaptureError | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => () => {
    processingIdRef.current += 1;
    abortControllerRef.current?.abort();
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  useEffect(() => {
    if (uiState === 'previewing' || uiState === 'error') {
      stateHeadingRef.current?.focus({ preventScroll: true });
    }
  }, [uiState]);

  const clearPreview = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setProcessedData(null);
  };

  const handleFile = async (rawFile: File) => {
    const processingId = ++processingIdRef.current;
    clearPreview();
    setErrorDetails(null);
    setIsDragging(false);
    dragDepthRef.current = 0;

    if (!ACCEPTED_TYPES.includes(rawFile.type.toLowerCase()) &&
        !(rawFile.type === '' && /\.(jpe?g|png)$/i.test(rawFile.name))) {
      setErrorDetails({ code: 'UNSUPPORTED_TYPE', message: 'Foto ini belum didukung. Pilih file JPG atau PNG.' });
      setUiState('error');
      return;
    }

    if (rawFile.size === 0) {
      setErrorDetails({ code: 'EMPTY_FILE', message: 'File foto kosong. Pilih foto lain dari perangkat Anda.' });
      setUiState('error');
      return;
    }

    setUiState('processing_exif');

    try {
      const processed = await processShrimpImage(rawFile);
      if (processingId !== processingIdRef.current) {
        URL.revokeObjectURL(processed.previewUrl);
        return;
      }
      if (processed.file.size > MAX_UPLOAD_BYTES) {
        URL.revokeObjectURL(processed.previewUrl);
        setErrorDetails({
          code: 'FILE_TOO_LARGE',
          message: `Ukuran foto masih ${formatBytes(processed.file.size)} setelah disesuaikan. Pilih foto dengan ukuran maksimal 15 MB.`,
        });
        setUiState('error');
        return;
      }
      previewUrlRef.current = processed.previewUrl;
      setProcessedData(processed);
      setUiState('previewing');
    } catch {
      if (processingId !== processingIdRef.current) return;
      setErrorDetails({ code: 'INVALID_IMAGE', message: 'Foto tidak dapat dibaca. Coba pilih foto lain atau ambil ulang dengan kamera.' });
      setUiState('error');
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawFile = event.target.files?.[0];
    event.target.value = '';
    if (rawFile) void handleFile(rawFile);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragging(false);
    if (event.dataTransfer.files.length > 1) {
      setErrorDetails({ code: 'INVALID_IMAGE', message: 'Pilih satu foto untuk setiap analisis. Satu foto dapat memuat beberapa udang.' });
      setUiState('error');
      return;
    }
    const rawFile = event.dataTransfer.files[0];
    if (rawFile) void handleFile(rawFile);
  };

  const handleStartSubmit = async () => {
    if (!processedData || abortControllerRef.current) return;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setUiState('uploading');
    setErrorDetails(null);

    try {
      const result = await uploadShrimpImage(processedData.file, controller.signal, { useMock });
      // A cancelled request may still resolve; only the current request owns this view.
      if (controller.signal.aborted || abortControllerRef.current !== controller) return;
      if (result.ok) {
        previewUrlRef.current = null;
        onSuccess(result, processedData);
      } else {
        setErrorDetails({ code: result.error_code, message: result.message, requestId: result.requestId });
        setUiState('error');
      }
    } catch {
      if (controller.signal.aborted || abortControllerRef.current !== controller) return;
      setErrorDetails({ code: 'NETWORK_ERROR', message: 'Koneksi terputus. Periksa jaringan Anda, lalu coba analisis kembali.' });
      setUiState('error');
    } finally {
      if (abortControllerRef.current === controller) abortControllerRef.current = null;
    }
  };

  const handleCancelUpload = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setUiState('previewing');
  };

  const handleRetake = () => {
    processingIdRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    clearPreview();
    setErrorDetails(null);
    setUiState('idle');
    onReset();
  };

  const mappedError = errorDetails ? formatErrorCode(errorDetails.code) : null;
  const statusText = uiState === 'processing_exif'
    ? 'Menyiapkan foto.'
    : uiState === 'uploading'
      ? 'Analisis foto sedang berlangsung.'
      : uiState === 'previewing'
        ? 'Foto siap. Periksa foto sebelum memulai analisis.'
        : '';

  return (
    <div className={styles.capture}>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" hidden onChange={handleFileChange} aria-label="Pilih foto udang" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFileChange} aria-label="Ambil foto udang" />
      <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{statusText}</p>

      {uiState === 'idle' && (
        <div
          className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
          onDragEnter={(event) => {
            event.preventDefault();
            if (event.dataTransfer.types.includes('Files')) {
              dragDepthRef.current += 1;
              setIsDragging(true);
            }
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
            if (dragDepthRef.current === 0) setIsDragging(false);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={handleDrop}
        >
          <Upload className={styles.uploadIcon} strokeWidth={1.25} aria-hidden="true" />
          <h3 className={styles.title}>{isDragging ? 'Lepaskan foto untuk melanjutkan' : 'Tarik foto udang ke sini'}</h3>
          <p className={styles.description}>atau pilih foto dari perangkat Anda</p>
          <div className={styles.actions}>
            <button type="button" className={styles.primaryButton} onClick={() => fileInputRef.current?.click()}>Pilih foto</button>
            <button type="button" className={styles.secondaryButton} onClick={() => cameraInputRef.current?.click()}>
              <Camera size={17} aria-hidden="true" /> Buka kamera
            </button>
          </div>
          <p className={styles.fileHint}>JPG atau PNG <span aria-hidden="true">·</span> Foto di atas 15 MB disesuaikan otomatis</p>
        </div>
      )}

      {uiState === 'processing_exif' && (
        <div className={styles.waiting} aria-busy="true">
          <LoaderCircle className={styles.spinner} size={36} strokeWidth={1.5} aria-hidden="true" />
          <h3 className={styles.title}>Menyiapkan foto Anda</h3>
          <p className={styles.description}>Sebentar, kami sedang memeriksa orientasi dan ukuran foto.</p>
        </div>
      )}

      {uiState === 'previewing' && processedData && (
        <div className={styles.preview}>
          <div className={styles.previewHeader}>
            <div className={styles.fileInfo}>
              <FileImage size={20} aria-hidden="true" />
              <div>
                <h3 ref={stateHeadingRef} tabIndex={-1} className={styles.previewTitle}>Foto siap dianalisis</h3>
                <p className={styles.filename} title={processedData.file.name}>{processedData.file.name}</p>
              </div>
            </div>
            <button type="button" className={styles.iconButton} onClick={handleRetake} aria-label="Hapus foto dan pilih ulang"><X size={19} aria-hidden="true" /></button>
          </div>
          <div className={styles.previewFrame}>
            {/* The preview is a local object URL and must retain its original dimensions. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={processedData.previewUrl} alt="Pratinjau foto udang yang akan dianalisis" className={styles.previewImage} />
          </div>
          <div className={styles.photoDetails}>
            <span><Check size={14} aria-hidden="true" /> {processedData.processedDimensions.width} × {processedData.processedDimensions.height} px</span>
            <span>{formatBytes(processedData.processedSizeBytes)}</span>
          </div>
          {processedData.wasResized && <p className={styles.resizeNote}>Foto disesuaikan dari {formatBytes(processedData.originalSizeBytes)} menjadi {formatBytes(processedData.processedSizeBytes)} agar dapat diunggah.</p>}
          <p className={styles.previewReminder}>Pastikan seluruh udang terlihat, tidak bertumpuk, dan difoto dari jarak 29 cm.</p>
          <div className={styles.previewActions}>
            <button type="button" className={styles.primaryButton} onClick={handleStartSubmit}><ScanLine size={17} aria-hidden="true" /> Analisis foto</button>
            <button type="button" className={styles.secondaryButton} onClick={handleRetake}><RotateCcw size={16} aria-hidden="true" /> Ganti foto</button>
          </div>
        </div>
      )}

      {uiState === 'uploading' && (
        <div className={styles.waiting} aria-busy="true">
          <LoaderCircle className={styles.spinner} size={36} strokeWidth={1.5} aria-hidden="true" />
          <h3 className={styles.title}>Menganalisis foto udang</h3>
          <p className={styles.description}>{useMock ? 'Menyiapkan hasil simulasi untuk mencoba alur analisis.' : 'Foto sedang diproses untuk menghitung jumlah dan memperkirakan berat udang.'}</p>
          <button type="button" className={styles.cancelButton} onClick={handleCancelUpload}>Batalkan analisis</button>
        </div>
      )}

      {uiState === 'error' && errorDetails && mappedError && (
        <div className={styles.errorPanel}>
          <AlertCircle className={styles.errorIcon} size={30} strokeWidth={1.5} aria-hidden="true" />
          <div role="alert">
            <h3 ref={stateHeadingRef} tabIndex={-1} className={styles.title}>{mappedError.title}</h3>
            <p className={styles.errorMessage}>{errorDetails.message || mappedError.message}</p>
          </div>
          <div className={styles.actions}>
            {processedData && <button type="button" className={styles.primaryButton} onClick={handleStartSubmit}>Coba analisis lagi</button>}
            <button type="button" className={processedData ? styles.secondaryButton : styles.primaryButton} onClick={handleRetake}>Pilih foto lain</button>
          </div>
          {errorDetails.requestId && <p className={styles.requestId}>ID permintaan: <code>{errorDetails.requestId}</code></p>}
        </div>
      )}
    </div>
  );
}
