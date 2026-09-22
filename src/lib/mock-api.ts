import { PredictResult } from './types';

/**
 * Simulates a realistic Flask BE prediction response with random polygon coordinates and weight predictions.
 */
export async function mockShrimpPrediction(
  imageFile: File,
  signal?: AbortSignal,
  mockMode: 'normal' | 'multi' | 'empty' | 'error' = 'normal'
): Promise<PredictResult> {
  const requestId = crypto.randomUUID();

  // Simulate network latency (800ms - 1500ms)
  const delay = Math.floor(800 + Math.random() * 700);

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      if (signal?.aborted) {
        resolve({
          ok: false,
          requestId,
          status: 'error',
          error_code: 'CLIENT_ABORTED',
          message: 'Pengunggahan dibatalkan oleh pengguna.',
        });
        return;
      }

      if (mockMode === 'error') {
        resolve({
          ok: false,
          requestId,
          status: 'error',
          error_code: 'INVALID_IMAGE',
          message: 'Gambar tidak dapat diproses oleh model segmentation (Mock Error).',
        });
        return;
      }

      if (mockMode === 'empty') {
        resolve({
          ok: true,
          requestId,
          status: 'success',
          meta: {
            processing_time_ms: delay,
            model_yolo_version: 'yolo26n-seg (mock)',
            model_svr_combination: 'area-perimeter-length',
          },
          data: {
            total_detected: 0,
            predictions: [],
          },
        });
        return;
      }

      // Generate mock polygon coordinates based on a sample relative image dimension
      // Let's assume an image frame around 1000x800 for relative coordinates
      const isMulti = mockMode === 'multi';

      const predictions = isMulti
        ? [
            {
              id: 1,
              berat_gram: 12.45,
              features_extracted: {
                area: 28450.2,
                perimeter: 940.5,
                length: 335.8,
                width: 98.2,
                solidity: 0.88,
              },
              polygon_coordinates: generateMockPolygon(250, 350, 180, 90),
            },
            {
              id: 2,
              berat_gram: 9.80,
              features_extracted: {
                area: 21320.0,
                perimeter: 795.3,
                length: 290.4,
                width: 82.1,
                solidity: 0.85,
              },
              polygon_coordinates: generateMockPolygon(650, 420, 150, 75),
            },
            {
              id: 3,
              berat_gram: 14.15,
              features_extracted: {
                area: 31200.8,
                perimeter: 1010.1,
                length: 360.0,
                width: 105.4,
                solidity: 0.91,
              },
              polygon_coordinates: generateMockPolygon(420, 180, 200, 100),
            },
          ]
        : [
            {
              id: 1,
              berat_gram: 11.52,
              features_extracted: {
                area: 25450.5,
                perimeter: 890.4,
                length: 320.2,
                width: 92.6,
                solidity: 0.89,
              },
              polygon_coordinates: generateMockPolygon(450, 400, 210, 100),
            },
          ];

      resolve({
        ok: true,
        requestId,
        status: 'success',
        meta: {
          processing_time_ms: delay,
          model_yolo_version: 'yolo26n-seg (mock)',
          model_svr_combination: 'area-perimeter-length',
        },
        data: {
          total_detected: predictions.length,
          predictions,
        },
      });
    }, delay);

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        resolve({
          ok: false,
          requestId,
          status: 'error',
          error_code: 'CLIENT_ABORTED',
          message: 'Pengunggahan dibatalkan.',
        });
      });
    }
  });
}

/**
 * Generate a realistic curved shrimp polygon shape around a center point (cx, cy)
 */
function generateMockPolygon(cx: number, cy: number, rx: number, ry: number): [number, number][] {
  const points: [number, number][] = [];
  const numPoints = 18;
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    // Add slight noise to simulate natural shrimp contour
    const distortion = 1 + (Math.sin(angle * 3) * 0.15 + (Math.random() - 0.5) * 0.08);
    const x = Math.round(cx + Math.cos(angle) * rx * distortion);
    const y = Math.round(cy + Math.sin(angle) * ry * distortion);
    points.push([x, y]);
  }
  return points;
}
