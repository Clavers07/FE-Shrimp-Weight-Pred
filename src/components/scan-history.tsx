'use client';

import { useState, useEffect } from 'react';
import { getScanHistory, deleteScanHistoryItem, clearScanHistory, exportHistoryToCSV } from '@/lib/storage';
import { ScanHistoryItem } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { PolygonCanvas } from './polygon-canvas';
import {
  History,
  Download,
  Trash2,
  Calendar,
  Layers,
  FileSpreadsheet,
  Search,
  Eye,
  X,
  Scale,
} from 'lucide-react';

export function ScanHistory() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedScan, setSelectedScan] = useState<ScanHistoryItem | null>(null);

  useEffect(() => {
    setHistory(getScanHistory());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteScanHistoryItem(id);
    setHistory(updated);
    if (selectedScan?.id === id) {
      setSelectedScan(null);
    }
  };

  const handleClearAll = () => {
    if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat scan di browser ini?')) {
      clearScanHistory();
      setHistory([]);
      setSelectedScan(null);
    }
  };

  const filteredHistory = history.filter(
    (item) =>
      item.imageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.timestamp.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="h-6 w-6 text-[#028090]" />
            Riwayat Estimasi Berat Udang
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tersimpan lokal di browser ({history.length} item)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                onClick={() => exportHistoryToCSV(history)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Ekspor CSV</span>
              </button>

              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Hapus Semua</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Input */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama file / tanggal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs shadow-xs focus:border-[#028090] focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
      )}

      {/* History List or Empty State */}
      {filteredHistory.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <History className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {searchTerm ? 'Tidak ada riwayat yang cocok' : 'Belum ada riwayat estimasi'}
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Setiap kali Anda mengunggah foto udang dan mendapatkan estimasi berat, datanya akan otomatis tersimpan di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedScan(item)}
              className="cursor-pointer group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-[#028090] hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F4C81] text-white">
                    <Scale className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-sm font-extrabold text-[#0F4C81] dark:text-cyan-400">
                      {item.totalWeightGram.toFixed(2)} gram
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {item.totalDetected} udang ({item.averageWeightGram.toFixed(1)} g/ekor)
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                  title="Hapus item ini"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800 flex items-center justify-between">
                <span className="truncate max-w-[160px]" title={item.imageName}>
                  {item.imageName}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Calendar className="h-3 w-3" />
                  {formatDate(item.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Item Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:text-white">
            <button
              onClick={() => setSelectedScan(null)}
              className="absolute top-4 right-4 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Detail Scan: {selectedScan.imageName}
              </h3>
              <p className="text-xs text-slate-500">
                Waktu Scan: {formatDate(selectedScan.timestamp)} | Total: <strong>{selectedScan.totalWeightGram.toFixed(2)} gram</strong> ({selectedScan.totalDetected} udang)
              </p>
            </div>

            {selectedScan.imageDataUrl && (
              <div className="mb-4">
                <PolygonCanvas
                  imageSrc={selectedScan.imageDataUrl}
                  originalWidth={selectedScan.originalWidth}
                  originalHeight={selectedScan.originalHeight}
                  predictions={selectedScan.predictions}
                />
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Fitur Terekstrak Per Udang
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedScan.predictions.map((p) => (
                  <div key={p.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                    <div className="flex justify-between font-bold mb-1">
                      <span>Udang #{p.id}</span>
                      <span className="text-[#028090]">{p.berat_gram.toFixed(2)} g</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500">
                      <div>Area: {p.features_extracted.area?.toFixed(1) || '-'}</div>
                      <div>Perimeter: {p.features_extracted.perimeter?.toFixed(1) || '-'}</div>
                      <div>Length: {p.features_extracted.length?.toFixed(1) || '-'}</div>
                      <div>Width: {p.features_extracted.width?.toFixed(1) || '-'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
