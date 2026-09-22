import { PredictResult, HealthCheckResponse, ErrorCode } from './types';
import { mockShrimpPrediction } from './mock-api';

const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
};

export async function checkServerHealth(): Promise<HealthCheckResponse> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${baseUrl}/healthz`, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        status: 'online',
        model_ready: data.model_ready ?? true,
        version: data.version || 'v1',
        model_yolo: data.model_yolo || data.meta?.model_yolo_version,
        model_svr: data.model_svr || data.meta?.model_svr_combination,
      };
    }
    return { status: 'degraded', model_ready: false };
  } catch {
    return { status: 'offline', model_ready: false };
  }
}

export async function uploadShrimpImage(
  imageFile: File,
  signal: AbortSignal,
  options?: {
    useMock?: boolean;
    mockMode?: 'normal' | 'multi' | 'empty' | 'error';
    retryCount?: number;
  }
): Promise<PredictResult> {
  const useMock = options?.useMock ?? false;
  const mockMode = options?.mockMode ?? 'normal';

  if (useMock) {
    return mockShrimpPrediction(imageFile, signal, mockMode);
  }

  const requestId = crypto.randomUUID();
  const formData = new FormData();
  // Key MUST be 'image' as defined in API_CONTRACT.md §3
  formData.append('image', imageFile);

  const baseUrl = getApiBaseUrl();
  const t0 = performance.now();
  console.info(`[${requestId}] upload start file="${imageFile.name}" size=${imageFile.size}B`);

  try {
    const response = await fetch(`${baseUrl}/api/v1/shrimp/predict-weight`, {
      method: 'POST',
      headers: {
        'X-Request-Id': requestId,
      },
      body: formData,
      signal,
    });

    const elapsedMs = Math.round(performance.now() - t0);
    console.info(`[${requestId}] upload done status=${response.status} time=${elapsedMs}ms`);

    let result;
    try {
      result = await response.json();
    } catch {
      return {
        ok: false,
        requestId,
        status: 'error',
        error_code: 'INFERENCE_FAILED',
        message: 'Respon dari server tidak berformat JSON valid.',
      };
    }

    if (!response.ok || result.status === 'error') {
      const errorCode: ErrorCode = result.error_code || mapHttpStatusToErrorCode(response.status);
      console.warn(`[${requestId}] error_code=${errorCode} message=${result.message}`);

      // Auto-retry once for 503 (MODEL_NOT_READY) or NETWORK_ERROR
      if ((response.status === 503 || errorCode === 'MODEL_NOT_READY') && (options?.retryCount ?? 0) < 1) {
        console.info(`[${requestId}] Retrying request once due to MODEL_NOT_READY...`);
        await new Promise((r) => setTimeout(r, 2000));
        return uploadShrimpImage(imageFile, signal, { ...options, retryCount: (options?.retryCount ?? 0) + 1 });
      }

      return {
        ok: false,
        requestId: result.request_id || requestId,
        status: 'error',
        error_code: errorCode,
        message: result.message || 'Terjadi kesalahan saat mengolah gambar.',
      };
    }

    return {
      ok: true,
      requestId: result.request_id || requestId,
      status: 'success',
      meta: result.meta,
      data: result.data,
    };
  } catch (err) {
    const elapsedMs = Math.round(performance.now() - t0);

    if ((err as Error).name === 'AbortError') {
      console.info(`[${requestId}] upload aborted by user after ${elapsedMs}ms`);
      return {
        ok: false,
        requestId,
        status: 'error',
        error_code: 'CLIENT_ABORTED',
        message: 'Pengunggahan dibatalkan oleh pengguna.',
      };
    }

    console.error(`[${requestId}] network error after ${elapsedMs}ms:`, err);

    // Auto-retry once for network errors if not aborted
    if ((options?.retryCount ?? 0) < 1) {
      console.info(`[${requestId}] Retrying network error once...`);
      await new Promise((r) => setTimeout(r, 1500));
      return uploadShrimpImage(imageFile, signal, { ...options, retryCount: (options?.retryCount ?? 0) + 1 });
    }

    return {
      ok: false,
      requestId,
      status: 'error',
      error_code: 'NETWORK_ERROR',
      message: 'Tidak dapat terhubung ke server Flask API tambak.',
    };
  }
}

function mapHttpStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return 'NO_FILE_KEY';
    case 413:
      return 'FILE_TOO_LARGE';
    case 415:
      return 'UNSUPPORTED_TYPE';
    case 422:
      return 'INVALID_IMAGE';
    case 503:
      return 'MODEL_NOT_READY';
    case 500:
    default:
      return 'INFERENCE_FAILED';
  }
}
