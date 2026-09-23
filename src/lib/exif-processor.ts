import exifr from 'exifr';

export interface ProcessedImageResult {
  file: File;
  previewUrl: string;
  wasResized: boolean;
  wasExifRotated: boolean;
  originalDimensions: { width: number; height: number };
  processedDimensions: { width: number; height: number };
  originalSizeBytes: number;
  processedSizeBytes: number;
}

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB match backend API contract limit

/**
 * Process uploaded image file:
 * 1. Read EXIF orientation using exifr
 * 2. Rotate pixel data on canvas if necessary so orientation is visually standard (at 100% full scale)
 * 3. Preserve full original pixel resolution (NO downscaling) so pixel-based ML features (area, length, width, perimeter) remain accurate.
 */
export async function processShrimpImage(inputFile: File): Promise<ProcessedImageResult> {
  const originalSizeBytes = inputFile.size;

  // 1. Extract EXIF orientation
  let orientation = 1;
  try {
    const exifData = await exifr.parse(inputFile, ['Orientation']);
    if (exifData && typeof exifData.Orientation === 'number') {
      orientation = exifData.Orientation;
    }
  } catch (err) {
    console.warn('[EXIF] Failed to parse EXIF metadata, assuming orientation 1', err);
  }

  // 2. Load image into Image element
  const img = await loadImageFromFile(inputFile);
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  // Check if rotation switches dimensions
  const is90Deg = orientation === 5 || orientation === 6 || orientation === 7 || orientation === 8;
  const visualW = is90Deg ? origH : origW;
  const visualH = is90Deg ? origW : origH;

  const needsExifFix = orientation > 1;
  const needsResize = originalSizeBytes > MAX_FILE_SIZE_BYTES;

  // If no rotation needed and no size reduction needed, return original file directly (matching Postman behavior)
  if (!needsExifFix && !needsResize) {
    const url = URL.createObjectURL(inputFile);
    return {
      file: inputFile,
      previewUrl: url,
      wasResized: false,
      wasExifRotated: false,
      originalDimensions: { width: origW, height: origH },
      processedDimensions: { width: origW, height: origH },
      originalSizeBytes,
      processedSizeBytes: originalSizeBytes,
    };
  }

  // 3. Keep 100% full visual dimensions (preserve exact pixel scale for accurate SVR area/length calculation)
  let targetW = visualW;
  let targetH = visualH;

  if (needsResize) {
    // Only downscale if file actually exceeds 15MB limit
    const scaleFactor = Math.sqrt(MAX_FILE_SIZE_BYTES / originalSizeBytes);
    targetW = Math.round(visualW * scaleFactor);
    targetH = Math.round(visualH * scaleFactor);
  }

  // 4. Create Canvas and apply transformations
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Gagal mendapatkan konteks Canvas 2D untuk memproses gambar');
  }

  // Enable high quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Apply EXIF rotation transform & draw image
  drawTransformedImage(ctx, img, orientation, targetW, targetH, origW, origH);

  // 5. Export canvas to Blob & File
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas toBlob gagal'));
      },
      'image/jpeg',
      0.95
    );
  });

  const processedFileName = inputFile.name.replace(/\.[^/.]+$/, '') + '_processed.jpg';
  const processedFile = new File([blob], processedFileName, { type: 'image/jpeg' });
  const previewUrl = URL.createObjectURL(blob);

  return {
    file: processedFile,
    previewUrl,
    wasResized: needsResize,
    wasExifRotated: needsExifFix,
    originalDimensions: { width: origW, height: origH },
    processedDimensions: { width: targetW, height: targetH },
    originalSizeBytes,
    processedSizeBytes: processedFile.size,
  };
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

function drawTransformedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  orientation: number,
  canvasW: number,
  canvasH: number,
  origW: number,
  origH: number
) {
  ctx.save();

  // Move origin to canvas center for rotation
  ctx.translate(canvasW / 2, canvasH / 2);

  switch (orientation) {
    case 2:
      ctx.scale(-1, 1);
      break;
    case 3:
      ctx.rotate(Math.PI);
      break;
    case 4:
      ctx.scale(1, -1);
      break;
    case 5:
      ctx.rotate(0.5 * Math.PI);
      ctx.scale(1, -1);
      break;
    case 6: // 90 deg CW
      ctx.rotate(0.5 * Math.PI);
      break;
    case 7:
      ctx.rotate(0.5 * Math.PI);
      ctx.scale(-1, 1);
      break;
    case 8: // 270 deg CW (90 CCW)
      ctx.rotate(-0.5 * Math.PI);
      break;
    default:
      break;
  }

  // Draw centered
  const is90Deg = orientation === 5 || orientation === 6 || orientation === 7 || orientation === 8;
  const drawW = is90Deg ? canvasH : canvasW;
  const drawH = is90Deg ? canvasW : canvasH;

  ctx.drawImage(img, 0, 0, origW, origH, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}
