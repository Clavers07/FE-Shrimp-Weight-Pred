'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ShrimpPrediction } from '@/lib/types';
import { Eye, EyeOff, Layers } from 'lucide-react';

interface PolygonCanvasProps {
  imageSrc: string;
  originalWidth: number;
  originalHeight: number;
  predictions: ShrimpPrediction[];
  selectedPredictionId?: number | null;
  onSelectPrediction?: (id: number | null) => void;
}

export function PolygonCanvas({
  imageSrc,
  originalWidth,
  originalHeight,
  predictions,
  selectedPredictionId,
  onSelectPrediction,
}: PolygonCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [showPolygons, setShowPolygons] = useState<boolean>(true);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [, setDisplayDim] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Load Image element once
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
    };
  }, [imageSrc]);

  // Render loop function
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = imgRef.current;

    if (!canvas || !container || !img || !imageLoaded) return;

    // Calculate aspect ratio containment width & height
    const containerWidth = container.clientWidth;
    if (containerWidth <= 0) return;

    const imgAspect = originalWidth > 0 && originalHeight > 0 ? originalWidth / originalHeight : img.width / img.height;
    const displayWidth = containerWidth;
    const displayHeight = Math.round(containerWidth / imgAspect);

    setDisplayDim({ width: displayWidth, height: displayHeight });

    // Handle high-DPI screen sharpness
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = Math.round(displayWidth * dpr);
    canvas.height = Math.round(displayHeight * dpr);
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // 1. Draw underlying original image
    ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

    // 2. Draw Polygons if toggled ON
    if (showPolygons && predictions && predictions.length > 0) {
      const origW = originalWidth > 0 ? originalWidth : img.naturalWidth || displayWidth;
      const origH = originalHeight > 0 ? originalHeight : img.naturalHeight || displayHeight;

      const scaleX = displayWidth / origW;
      const scaleY = displayHeight / origH;

      predictions.forEach((pred, index) => {
        if (!pred.polygon_coordinates || pred.polygon_coordinates.length === 0) return;

        const isSelected = selectedPredictionId === pred.id;

        // Choose color per shrimp: vibrant ocean palette
        const colors = [
          { stroke: '#3B9FE8', fill: 'rgba(59, 159, 232, 0.28)', labelBg: '#3B9FE8', text: '#0A1A2F' },
          { stroke: '#E8A33D', fill: 'rgba(232, 163, 61, 0.28)', labelBg: '#E8A33D', text: '#0A1A2F' },
          { stroke: '#10B981', fill: 'rgba(16, 185, 129, 0.28)', labelBg: '#10B981', text: '#0A1A2F' },
          { stroke: '#A855F7', fill: 'rgba(168, 85, 247, 0.28)', labelBg: '#A855F7', text: '#FFFFFF' },
        ];
        const colorScheme = colors[index % colors.length];

        ctx.beginPath();
        let sumX = 0;
        let sumY = 0;

        pred.polygon_coordinates.forEach(([x, y], i) => {
          const px = x * scaleX;
          const py = y * scaleY;
          sumX += px;
          sumY += py;

          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        });

        ctx.closePath();

        // Polygon Fill & Stroke
        ctx.fillStyle = isSelected ? 'rgba(232, 163, 61, 0.45)' : colorScheme.fill;
        ctx.fill();

        ctx.lineWidth = isSelected ? 3.5 : 2.5;
        ctx.strokeStyle = isSelected ? '#E8A33D' : colorScheme.stroke;
        ctx.stroke();

        // Calculate Centroid for weight badge rendering
        const numPts = pred.polygon_coordinates.length;
        const centerX = sumX / numPts;
        const centerY = sumY / numPts;

        // Render Centroid Weight Label Badge
        const labelText = `#${pred.id} (${pred.berat_gram.toFixed(1)}g)`;
        ctx.font = `bold ${Math.max(11, Math.min(14, Math.round(displayWidth / 35)))}px sans-serif`;
        const textMetrics = ctx.measureText(labelText);
        const paddingX = 8;
        const paddingY = 4;
        const badgeWidth = textMetrics.width + paddingX * 2;
        const badgeHeight = 22;

        const badgeX = Math.max(5, Math.min(displayWidth - badgeWidth - 5, centerX - badgeWidth / 2));
        const badgeY = Math.max(5, Math.min(displayHeight - badgeHeight - 5, centerY - badgeHeight / 2));

        // Badge background
        ctx.fillStyle = isSelected ? '#E8A33D' : colorScheme.labelBg;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 999);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Badge text
        ctx.fillStyle = isSelected ? '#0A1A2F' : colorScheme.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2 + 1);
      });
    }

    ctx.restore();
  }, [imageLoaded, originalWidth, originalHeight, predictions, showPolygons, selectedPredictionId]);

  // Set up ResizeObserver for automatic recalculation on display resize
  useEffect(() => {
    renderCanvas();

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      renderCanvas();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [renderCanvas]);

  return (
    <div className="relative w-full rounded-[20px] bg-[#0A1A2F] p-2.5 shadow-xl border border-white/10">
      {/* Canvas Container */}
      <div ref={containerRef} className="relative w-full overflow-hidden rounded-[16px] bg-[#0A1A2F] min-h-[220px] flex items-center justify-center">
        {!imageLoaded && (
          <div className="flex flex-col items-center gap-2 p-8 text-slate-400">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#3B9FE8] border-t-transparent" />
            <span className="text-xs">Memuat visualisasi gambar & segmentasi...</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="block max-w-full h-auto cursor-pointer"
          onClick={() => onSelectPrediction && onSelectPrediction(null)}
        />
      </div>

      {/* Canvas Toolbar Controls */}
      <div className="mt-3 flex items-center justify-between px-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPolygons(!showPolygons)}
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-bold transition-all min-h-[36px] ${
              showPolygons
                ? 'bg-[#3B9FE8]/20 text-[#3B9FE8] border border-[#3B9FE8]/40 hover:bg-[#3B9FE8]/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            {showPolygons ? <Eye className="h-3.5 w-3.5 text-[#3B9FE8]" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>Overlay Poligon ({showPolygons ? 'Aktif' : 'Sembunyi'})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Layers className="h-3.5 w-3.5 text-[#3B9FE8]" />
          <span>
            Piksel Asli: <strong className="text-white">{originalWidth} × {originalHeight} px</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

