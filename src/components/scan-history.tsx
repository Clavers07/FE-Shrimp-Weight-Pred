'use client';

import { useState, useEffect } from 'react';
import { getScanHistory, deleteScanHistoryItem, clearScanHistory, exportHistoryToCSV } from '@/lib/storage';
import { ScanHistoryItem } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { PolygonCanvas } from './polygon-canvas';
import {
  History,
  Trash2,
  Calendar,
  FileSpreadsheet,
  Search,
  X,
  Scale,
  Camera,
} from 'lucide-react';

export function ScanHistory() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedScan, setSelectedScan] = useState<ScanHistoryItem | null>(null);

  useEffect(() => {
    setHistory(getScanHistory());
  }, []);

  // Listen for Escape key to close detail modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedScan(null);
    };
    if (selectedScan) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedScan]);

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F2440] border border-[#3B9FE8]/30 text-[#3B9FE8]">
              <History className="h-5 w-5" />
            </div>
            <span>Riwayat Estimasi Berat</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            Tersimpan lokal di penyimpanan peramban ({history.length} sesi pemindaian)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {history.length > 0 && (
            <>
              <button
                onClick={() => exportHistoryToCSV(history)}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all min-h-[44px]"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Ekspor CSV</span>
              </button>

              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-950/30 px-5 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-900/40 transition-colors min-h-[44px]"
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
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama file atau tanggal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-white/10 bg-[#0F2440] py-3 pl-11 pr-5 text-xs text-white placeholder-slate-400 shadow-md focus:border-[#3B9FE8] focus:outline-none transition-all min-h-[46px]"
          />
        </div>
      )}

      {/* History List or Empty State */}
      {filteredHistory.length === 0 ? (
        <div className="rounded-[24px] border border-white/10 bg-[#0F2440] p-12 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A1A2F] text-slate-500 mb-4 border border-white/5">
            <History className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-base font-extrabold text-white font-heading">
            {searchTerm ? 'Tidak ada riwayat yang cocok' : 'Belum ada riwayat estimasi'}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            Setiap kali Anda mengunggah foto udang dan memperoleh estimasi berat, catatannya akan otomatis tersimpan di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedScan(item)}
              className="cursor-pointer group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-[#3B9FE8]/20 bg-[#0F2440] p-5 shadow-lg hover:border-[#3B9FE8] hover:shadow-[0_0_20px_rgba(59,159,232,0.2)] transition-all"
            >
              {/* Optional Thumbnail Image */}
              {item.imageDataUrl && (
                <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-[16px] bg-[#0A1A2F] border border-white/10">
                  {/* eslint-disable-next-html-element */}
                  <img
                    src={item.imageDataUrl}
                    alt={item.imageName}
                    className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 rounded-full bg-[#0A1A2F]/80 px-2 py-0.5 text-[10px] font-bold text-[#3B9FE8] backdrop-blur-xs">
                    {item.totalDetected} Udang
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0A1A2F] text-[#3B9FE8] border border-[#3B9FE8]/30">
                      <Scale className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-xl font-black text-[#E8A33D] font-heading">
                        {item.totalWeightGram.toFixed(2)} g
                      </span>
                      <span className="block text-[11px] text-slate-300">
                        {item.totalDetected} udang ({item.averageWeightGram.toFixed(1)} g/ekor)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition-colors"
                    title="Hapus item riwayat ini"
                    aria-label="Hapus riwayat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-slate-400">
                <span className="truncate max-w-[170px]" title={item.imageName}>
                  {item.imageName}
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Calendar className="h-3 w-3 text-[#3B9FE8]" />
                  {formatDate(item.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Item Detail Modal */}
      {selectedScan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedScan(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[24px] border border-[#3B9FE8]/30 bg-[#0F2440] p-6 sm:p-8 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedScan(null)}
              className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition-colors"
              title="Tutup Detail"
              aria-label="Tutup detail riwayat"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5 pb-4 border-b border-white/10">
              <h3 className="text-lg sm:text-xl font-extrabold text-white font-heading">
                Detail Pemindaian: {selectedScan.imageName}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300">
                Waktu Pindai: {formatDate(selectedScan.timestamp)} | Total:{' '}
                <strong className="text-[#E8A33D]">{selectedScan.totalWeightGram.toFixed(2)} gram</strong> ({selectedScan.totalDetected} udang)
              </p>
            </div>

            {selectedScan.imageDataUrl && (
              <div className="mb-5">
                <PolygonCanvas
                  imageSrc={selectedScan.imageDataUrl}
                  originalWidth={selectedScan.originalWidth}
                  originalHeight={selectedScan.originalHeight}
                  predictions={selectedScan.predictions}
                />
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-heading">
                Fitur Terekstrak Per Udang
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {selectedScan.predictions.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-white/10 bg-[#0A1A2F]/80 p-4"
                  >
                    <div className="flex justify-between items-center font-bold mb-2">
                      <span className="text-white font-heading">Udang #{p.id}</span>
                      <span className="text-[#E8A33D] font-black text-sm">{p.berat_gram.toFixed(2)} g</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <div>Area: <strong className="text-white">{p.features_extracted.area?.toFixed(1) || '-'}</strong></div>
                      <div>Perimeter: <strong className="text-white">{p.features_extracted.perimeter?.toFixed(1) || '-'}</strong></div>
                      <div>Length: <strong className="text-white">{p.features_extracted.length?.toFixed(1) || '-'}</strong></div>
                      <div>Width: <strong className="text-white">{p.features_extracted.width?.toFixed(1) || '-'}</strong></div>
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

