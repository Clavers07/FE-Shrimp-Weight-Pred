'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { ShrimpPrediction } from '@/lib/types';
import styles from './secondary-ui.module.css';

interface PolygonCanvasProps {
  imageSrc: string;
  originalWidth: number;
  originalHeight: number;
  predictions: ShrimpPrediction[];
  selectedPredictionId?: number | null;
  onSelectPrediction?: (id: number | null) => void;
}

export function PolygonCanvas({ imageSrc, originalWidth, originalHeight, predictions, selectedPredictionId, onSelectPrediction }: PolygonCanvasProps) {
  const [showPolygons, setShowPolygons] = useState(true);
  const [loadedSource, setLoadedSource] = useState('');
  const [failedSource, setFailedSource] = useState('');
  const width = originalWidth || 1000;
  const height = originalHeight || 800;
  const isLoaded = loadedSource === imageSrc;
  const hasError = failedSource === imageSrc;

  return (
    <div className={styles.canvas}>
      <div className={styles.canvasFrame} style={{ aspectRatio: `${width} / ${height}` }}>
        {!isLoaded && !hasError && <p className={styles.imageMessage} role="status">Memuat foto…</p>}
        {hasError ? <p className={styles.imageMessage} role="status">Pratinjau foto tidak tersedia. Rincian hasil tetap dapat dibaca.</p> : (
          <>
            {/* Blob URLs and stored thumbnails are already processed locally. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageSrc} alt="Foto sampel udang" onLoad={() => setLoadedSource(imageSrc)} onError={() => setFailedSource(imageSrc)} />
            {isLoaded && showPolygons && (
              <svg className={styles.polygonOverlay} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
                {predictions.map((prediction) => {
                  const points = prediction.polygon_coordinates;
                  if (!points?.length) return null;
                  const selected = selectedPredictionId === prediction.id;
                  const muted = selectedPredictionId != null && !selected;
                  const fontSize = Math.max(13, width / 36);
                  const labelWidth = fontSize * 6.5;
                  const labelHeight = fontSize * 1.65;
                  const centerX = points.reduce((sum, point) => sum + point[0], 0) / points.length;
                  const centerY = points.reduce((sum, point) => sum + point[1], 0) / points.length;
                  const x = Math.max(0, Math.min(width - labelWidth, centerX - labelWidth / 2));
                  const y = Math.max(0, Math.min(height - labelHeight, centerY - labelHeight / 2));
                  return (
                    <g key={prediction.id} opacity={muted ? 0.4 : 1}>
                      <polygon points={points.map((point) => point.join(',')).join(' ')} fill={selected ? 'rgba(212,233,162,.45)' : 'rgba(212,233,162,.18)'} stroke="#d4e9a2" strokeWidth={selected ? 3 : 2} vectorEffect="non-scaling-stroke" />
                      <rect x={x} y={y} width={labelWidth} height={labelHeight} rx={fontSize * 0.2} fill={selected ? '#d4e9a2' : '#183e35'} />
                      <text x={x + labelWidth / 2} y={y + labelHeight / 2} dominantBaseline="central" textAnchor="middle" fill={selected ? '#183e35' : '#fff'} fontSize={fontSize} fontFamily="sans-serif" fontWeight="600">#{prediction.id} · {prediction.berat_gram.toFixed(1)} g</text>
                    </g>
                  );
                })}
              </svg>
            )}
          </>
        )}
      </div>
      <div className={styles.canvasToolbar}>
        <button type="button" className={styles.overlayButton} aria-pressed={showPolygons} onClick={() => setShowPolygons(!showPolygons)}>
          {showPolygons ? <Eye size={16} aria-hidden="true" /> : <EyeOff size={16} aria-hidden="true" />}
          {showPolygons ? 'Sembunyikan area' : 'Tampilkan area'}
        </button>
        {selectedPredictionId != null && onSelectPrediction && <button type="button" className={styles.overlayButton} onClick={() => onSelectPrediction(null)}>Lihat semua</button>}
        <span>{width} × {height} px</span>
      </div>
    </div>
  );
}
