import { ScanHistoryItem } from './types';

const STORAGE_KEY = 'shrimp_weight_scan_history_v1';
const MAX_HISTORY_ITEMS = 50;

export function getScanHistory(): ScanHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[Storage] Failed to parse scan history from localStorage:', err);
    return [];
  }
}

export function saveScanResultToHistory(item: Omit<ScanHistoryItem, 'id' | 'timestamp'>): ScanHistoryItem {
  const history = getScanHistory();
  const newItem: ScanHistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  // Prepend new item and keep max items limit
  const updated = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('[Storage] Error saving to localStorage (storage full?):', err);
  }

  return newItem;
}

export function deleteScanHistoryItem(id: string): ScanHistoryItem[] {
  const history = getScanHistory();
  const updated = history.filter((h) => h.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('[Storage] Error deleting item from localStorage:', err);
  }
  return updated;
}

export function clearScanHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
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
