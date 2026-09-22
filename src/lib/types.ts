export type PolygonPoint = [number, number];

export interface FeaturesExtracted {
  area?: number;
  perimeter?: number;
  length?: number;
  width?: number;
  solidity?: number;
  aspect_ratio?: number;
  [key: string]: number | undefined;
}

export interface ShrimpPrediction {
  id: number;
  berat_gram: number;
  features_extracted: FeaturesExtracted;
  polygon_coordinates: PolygonPoint[];
}

export interface PredictionMeta {
  processing_time_ms?: number;
  model_yolo_version?: string;
  model_svr_combination?: string;
}

export interface PredictionSuccessData {
  total_detected: number;
  predictions: ShrimpPrediction[];
}

export interface PredictSuccessResponse {
  status: 'success';
  request_id?: string;
  meta?: PredictionMeta;
  data: PredictionSuccessData;
}

export type ErrorCode =
  | 'NO_FILE_KEY'
  | 'EMPTY_FILE'
  | 'UNSUPPORTED_TYPE'
  | 'FILE_TOO_LARGE'
  | 'INVALID_IMAGE'
  | 'MODEL_NOT_READY'
  | 'INFERENCE_FAILED'
  | 'NETWORK_ERROR'
  | 'CLIENT_ABORTED'
  | 'UNKNOWN_ERROR';

export interface PredictErrorResponse {
  status: 'error';
  request_id?: string;
  error_code: ErrorCode;
  message: string;
}

export type PredictResult =
  | ({ ok: true; requestId?: string } & PredictSuccessResponse)
  | ({ ok: false; requestId?: string } & PredictErrorResponse);

export interface ScanHistoryItem {
  id: string;
  timestamp: string;
  imageName: string;
  imageDataUrl?: string; // thumbnail / preview if stored
  originalWidth: number;
  originalHeight: number;
  totalDetected: number;
  totalWeightGram: number;
  averageWeightGram: number;
  predictions: ShrimpPrediction[];
  meta?: PredictionMeta;
  requestId?: string;
}

export interface HealthCheckResponse {
  status: string;
  model_ready?: boolean;
  version?: string;
  model_yolo?: string;
  model_svr?: string;
}
