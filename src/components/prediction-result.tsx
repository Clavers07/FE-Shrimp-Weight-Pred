'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Check, RotateCcw, Share2 } from 'lucide-react';
import { PredictSuccessResponse } from '@/lib/types';
import { ProcessedImageResult } from '@/lib/exif-processor';
import { getScanHistory, saveScanResultToHistory } from '@/lib/storage';
import { PolygonCanvas } from './polygon-canvas';
import styles from './secondary-ui.module.css';

interface PredictionResultProps {
  result: PredictSuccessResponse;
  processedImage: ProcessedImageResult;
  onReset: () => void;
}

const featureLabels: Record<string, string> = {
  area: 'Luas (px²)',
  perimeter: 'Keliling (px)',
  length: 'Panjang (px)',
  width: 'Lebar (px)',
  solidity: 'Soliditas',
  aspect_ratio: 'Rasio bentuk',
};

export function PredictionResult({ result, processedImage, onReset }: PredictionResultProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [shareMessage, setShareMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error'>('saving');
  const saveStarted = useRef(false);
  const { total_detected, predictions } = result.data;
  const totalWeight = predictions.reduce((total, item) => total + item.berat_gram, 0);
  const averageWeight = total_detected > 0 ? totalWeight / total_detected : 0;
  const sizePerKg = averageWeight > 0 ? Math.round(1000 / averageWeight) : 0;
  const weights = predictions.map((item) => item.berat_gram);
  const isDemo = result.meta?.model_yolo_version?.includes('mock');

  useEffect(() => {
    if (total_detected === 0 || saveStarted.current) return;
    saveStarted.current = true;
    const requestId = result.request_id ||
      ('requestId' in result && typeof result.requestId === 'string' ? result.requestId : undefined);

    saveScanResultToHistory({
      imageName: processedImage.file.name,
      imageDataUrl: processedImage.previewUrl,
      originalWidth: processedImage.processedDimensions.width,
      originalHeight: processedImage.processedDimensions.height,
      totalDetected: total_detected,
      totalWeightGram: totalWeight,
      averageWeightGram: averageWeight,
      predictions,
      meta: result.meta,
      requestId,
    }).then((savedItem) => {
      setSaveStatus(getScanHistory().some((item) => item.id === savedItem.id) ? 'saved' : 'error');
    }).catch(() => setSaveStatus('error'));
  }, [result, processedImage, total_detected, totalWeight, averageWeight, predictions]);

  const handleShare = async () => {
    const text = `${isDemo ? '[SIMULASI] ' : ''}ShrimpWeightAI • Hasil estimasi\nJumlah: ${total_detected} ekor\nTotal berat: ${totalWeight.toFixed(2)} gram\nRata-rata: ${averageWeight.toFixed(2)} gram/ekor\nEstimasi size: ${sizePerKg} ekor/kg`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Hasil estimasi berat udang', text });
        setShareMessage('Hasil berhasil dibagikan.');
      } else {
        await navigator.clipboard.writeText(text);
        setShareMessage('Hasil disalin. Tempel untuk membagikannya.');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setShareMessage('Hasil belum dapat dibagikan. Coba kembali.');
    }
  };

  if (total_detected === 0) {
    return (
      <section className={styles.emptyState} aria-labelledby="empty-result-title">
        <span className={styles.sectionLabel}>Hasil pengamatan</span>
        <h2 id="empty-result-title">Udang belum terdeteksi.</h2>
        <p>Gunakan alas polos, pisahkan setiap udang, dan ambil foto tegak lurus dari jarak 29 cm. Pastikan seluruh tubuh udang terlihat jelas.</p>
        <button type="button" className={styles.primaryButton} onClick={onReset}>
          <RotateCcw size={17} aria-hidden="true" /> Ambil foto ulang
        </button>
      </section>
    );
  }

  return (
    <section className={styles.result} aria-labelledby="result-title">
      <div className={styles.headingRow}>
        <div>
          <span className={styles.sectionLabel}>Hasil pengamatan</span>
          <h2 id="result-title">Sampel Anda, dalam angka.</h2>
          <p className={styles.fileName}>{processedImage.file.name}</p>
        </div>
        <button type="button" className={styles.secondaryButton} onClick={onReset}>
          <RotateCcw size={17} aria-hidden="true" /> Pindai foto lain
        </button>
      </div>

      {isDemo && <p className={styles.notice}>Hasil simulasi untuk mencoba tampilan. Angka ini bukan pengukuran foto Anda.</p>}

      <div className={styles.resultSummary}>
        <div className={styles.primaryMetric}>
          <span>Total estimasi berat</span>
          <p>{totalWeight.toFixed(2)} <small>gram</small></p>
          <span className={styles.saveStatus} role="status">
            {saveStatus === 'saved' && <Check size={15} aria-hidden="true" />}
            {saveStatus === 'saving' ? 'Menyimpan hasil di perangkat…' : saveStatus === 'saved' ? 'Tersimpan di riwayat perangkat ini' : 'Penyimpanan penuh atau tidak tersedia. Bagikan hasil untuk menyimpannya.'}
          </span>
        </div>
        <dl className={styles.metrics}>
          <div><dt>Udang terdeteksi</dt><dd>{total_detected}<small> ekor</small></dd></div>
          <div><dt>Rata-rata berat</dt><dd>{averageWeight.toFixed(2)}<small> g/ekor</small></dd></div>
          <div><dt>Estimasi size</dt><dd>{sizePerKg}<small> ekor/kg</small></dd></div>
          <div><dt>Rentang berat</dt><dd>{Math.min(...weights).toFixed(1)}–{Math.max(...weights).toFixed(1)}<small> g</small></dd></div>
        </dl>
      </div>

      <div className={styles.resultColumns}>
        <div className={styles.observation}>
          <div className={styles.panelHeading}><h3>Area yang terdeteksi</h3><span>{total_detected} objek</span></div>
          <PolygonCanvas
            imageSrc={processedImage.previewUrl}
            originalWidth={processedImage.processedDimensions.width}
            originalHeight={processedImage.processedDimensions.height}
            predictions={predictions}
            selectedPredictionId={selectedId}
            onSelectPrediction={setSelectedId}
          />
          <p className={styles.helpText}>Pilih udang pada rincian sampel untuk menyorot areanya pada foto.</p>
        </div>

        <div className={styles.samplePanel}>
          <div className={styles.panelHeading}><h3>Rincian sampel</h3><span>gram / ekor</span></div>
          <div className={styles.sampleList}>
            {predictions.map((prediction) => (
              <div key={prediction.id} className={`${styles.sampleItem} ${selectedId === prediction.id ? styles.selectedSample : ''}`}>
                <button
                  type="button"
                  className={styles.sampleButton}
                  aria-pressed={selectedId === prediction.id}
                  onClick={() => setSelectedId(selectedId === prediction.id ? null : prediction.id)}
                >
                  <span>Udang <span className={styles.sampleNumber}>#{String(prediction.id).padStart(2, '0')}</span></span>
                  <strong>{prediction.berat_gram.toFixed(2)} <small>g</small></strong>
                </button>
                {selectedId === prediction.id && (
                  <dl className={styles.featureList}>
                    {Object.entries(prediction.features_extracted).map(([key, value]) => (
                      <div key={key}><dt>{featureLabels[key] || key}</dt><dd>{typeof value === 'number' ? value.toFixed(2) : 'Tidak tersedia'}</dd></div>
                    ))}
                  </dl>
                )}
              </div>
            ))}
          </div>
          {result.meta && (
            <details className={styles.modelDetails}>
              <summary>Informasi pemrosesan</summary>
              <dl className={styles.featureList}>
                <div><dt>Waktu proses</dt><dd>{result.meta.processing_time_ms !== undefined ? `${result.meta.processing_time_ms} ms` : 'Tidak tersedia'}</dd></div>
                <div><dt>Model deteksi</dt><dd>{result.meta.model_yolo_version || 'Tidak tersedia'}</dd></div>
                <div><dt>Fitur estimasi</dt><dd>{result.meta.model_svr_combination || 'Tidak tersedia'}</dd></div>
              </dl>
            </details>
          )}
        </div>
      </div>

      <div className={styles.resultFooter}>
        <p>Estimasi dihitung dari foto. Ikuti jarak pengambilan 29 cm agar skala gambar tetap sesuai.</p>
        <div className={styles.actions}>
          <Link href="/history" className={styles.secondaryButton}>Buka riwayat</Link>
          <button type="button" className={styles.primaryButton} onClick={handleShare}><Share2 size={17} aria-hidden="true" /> Bagikan hasil</button>
        </div>
      </div>
      {shareMessage && <p className={styles.helpText} role="status">{shareMessage}</p>}
    </section>
  );
}
