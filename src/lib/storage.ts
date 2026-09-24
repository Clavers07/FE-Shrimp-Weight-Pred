import { ScanHistoryItem } from './types';

const STORAGE_KEY = 'shrimp_weight_scan_history_v1';
const MAX_HISTORY_ITEMS = 50;
const HISTORY_CHANGE_EVENT = 'shrimp-history-change';
const EMPTY_HISTORY: ScanHistoryItem[] = [];
let cachedRaw: string | null = null;
let cachedHistory: ScanHistoryItem[] = EMPTY_HISTORY;

export function subscribeToScanHistory(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) onChange();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(HISTORY_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(HISTORY_CHANGE_EVENT, onChange);
  };
}

export function getScanHistory(): ScanHistoryItem[] {
  if (typeof window === 'undefined') return EMPTY_HISTORY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // React's external-store subscription needs a stable snapshot until data changes.
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedHistory = EMPTY_HISTORY;
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) cachedHistory = parsed;
    }
    return cachedHistory;
  } catch (err) {
    console.warn('[Storage] Failed to parse scan history from localStorage:', err);
    return EMPTY_HISTORY;
  }
}

/**
 * Creates a lightweight persistent JPEG base64 thumbnail (~300px max)
 * so history images persist across page refreshes and browser sessions
 * without filling localStorage quota.
 */
async function generatePersistentThumbnail(sourceUrl: string): Promise<string> {
  if (!sourceUrl) return '';
  // If it's already a data: URL, return it
  if (sourceUrl.startsWith('data:')) return sourceUrl;

  try {
    return await new Promise<string>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const maxDim = 400;
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;

          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(sourceUrl);
            return;
          }

          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        } catch {
          resolve(sourceUrl);
        }
      };
      img.onerror = () => resolve(sourceUrl);
      img.src = sourceUrl;
    });
  } catch {
    return sourceUrl;
  }
}

export async function saveScanResultToHistory(
  item: Omit<ScanHistoryItem, 'id' | 'timestamp'>
): Promise<ScanHistoryItem> {
  const history = getScanHistory();

  // Deduplication check:
  // 1. By requestId if available
  // 2. Or if the exact same image name + weight was saved within the last 15 seconds
  const isDuplicate = history.some((h) => {
    if (item.requestId && h.requestId && item.requestId === h.requestId) {
      return true;
    }
    const isSameName = h.imageName === item.imageName;
    const isSameWeight = Math.abs(h.totalWeightGram - item.totalWeightGram) < 0.001;
    const isRecent = Math.abs(Date.now() - new Date(h.timestamp).getTime()) < 15000;
    return isSameName && isSameWeight && isRecent;
  });

  if (isDuplicate) {
    const existing = history.find((h) => {
      if (item.requestId && h.requestId && item.requestId === h.requestId) return true;
      return h.imageName === item.imageName && Math.abs(h.totalWeightGram - item.totalWeightGram) < 0.001;
    });
    return existing || history[0];
  }

  // Convert ephemeral blob: URL into persistent base64 thumbnail
  let persistentDataUrl = item.imageDataUrl || '';
  if (persistentDataUrl && persistentDataUrl.startsWith('blob:')) {
    persistentDataUrl = await generatePersistentThumbnail(persistentDataUrl);
  }

  const newItem: ScanHistoryItem = {
    ...item,
    imageDataUrl: persistentDataUrl,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  // Prepend new item and keep max items limit
  const updated = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(HISTORY_CHANGE_EVENT));
  } catch (err) {
    console.error('[Storage] Error saving to localStorage (storage full?):', err);
    // If quota exceeded, try trimming older items
    try {
      const trimmed = [newItem, ...history.slice(0, 10)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      window.dispatchEvent(new Event(HISTORY_CHANGE_EVENT));
    } catch {
      // ignore
    }
  }

  return newItem;
}

export function deleteScanHistoryItem(id: string): ScanHistoryItem[] {
  const history = getScanHistory();
  const updated = history.filter((h) => h.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(HISTORY_CHANGE_EVENT));
  } catch (err) {
    console.error('[Storage] Error deleting item from localStorage:', err);
  }
  return updated;
}

export function clearScanHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(HISTORY_CHANGE_EVENT));
  } catch (err) {
    console.error('[Storage] Error clearing localStorage history:', err);
  }
}

export function exportHistoryToCSV(history: ScanHistoryItem[]): void {
  if (history.length === 0) return;

  const rows: string[][] = [
    ['ID History', 'Tanggal & Waktu', 'Nama File', 'Jumlah Terdeteksi', 'Total Berat (g)', 'Rata-rata Berat (g)', 'ID Udang', 'Berat Udang (g)', 'Area (px²)', 'Keliling (px)', 'Panjang (px)'],
  ];

  history.forEach((scan) => {
    const dateFormatted = new Date(scan.timestamp).toLocaleString('id-ID');
    if (scan.predictions && scan.predictions.length > 0) {
      scan.predictions.forEach((pred) => {
        rows.push([
          scan.id,
          dateFormatted,
          `"${scan.imageName.replace(/"/g, '""')}"`,
          scan.totalDetected.toString(),
          scan.totalWeightGram.toFixed(2),
          scan.averageWeightGram.toFixed(2),
          pred.id.toString(),
          pred.berat_gram.toFixed(2),
          pred.features_extracted.area ? pred.features_extracted.area.toString() : '-',
          pred.features_extracted.perimeter ? pred.features_extracted.perimeter.toString() : '-',
          pred.features_extracted.length ? pred.features_extracted.length.toString() : '-',
        ]);
      });
    } else {
      rows.push([
        scan.id,
        dateFormatted,
        `"${scan.imageName.replace(/"/g, '""')}"`,
        '0',
        '0.00',
        '0.00',
        '-',
        '-',
        '-',
        '-',
        '-',
      ]);
    }
  });

  const csvContent = '\uFEFF' + rows.map((e) => e.join(',')).join('\n'); // Add UTF-8 BOM for Excel support
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `riwayat_prediksi_berat_udang_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
