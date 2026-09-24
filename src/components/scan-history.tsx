'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Calendar, FileImage, FileSpreadsheet, History, ImageOff, Search, Trash2, X } from 'lucide-react';
import { getScanHistory, subscribeToScanHistory, deleteScanHistoryItem, clearScanHistory, exportHistoryToCSV } from '@/lib/storage';
import type { ScanHistoryItem } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { PolygonCanvas } from './polygon-canvas';
import shared from './secondary-ui.module.css';
import styles from './scan-history.module.css';

const EMPTY_HISTORY: ScanHistoryItem[] = [];
const getServerHistory = () => EMPTY_HISTORY;
const featureLabels: Record<string, string> = {
  area: 'Luas (px²)',
  perimeter: 'Keliling (px)',
  length: 'Panjang (px)',
  width: 'Lebar (px)',
  solidity: 'Soliditas',
  aspect_ratio: 'Rasio bentuk',
};

function HistoryThumbnail({ item }: { item: ScanHistoryItem }) {
  const [failedSource, setFailedSource] = useState('');
  const unavailable = !item.imageDataUrl || failedSource === item.imageDataUrl;

  return (
    <span className={styles.thumbnail}>
      {unavailable ? (
        <span className={styles.imageFallback}>
          {item.imageDataUrl ? <ImageOff size={28} strokeWidth={1.25} /> : <FileImage size={28} strokeWidth={1.25} />}
          <span>Pratinjau tidak tersedia</span>
        </span>
      ) : (
        // Stored thumbnails are local data or blob URLs and need no image optimization.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageDataUrl} alt={`Foto ${item.imageName}`} loading="lazy" onError={() => setFailedSource(item.imageDataUrl || '')} />
      )}
      <span className={styles.objectCount}>{item.totalDetected} ekor</span>
      {item.meta?.model_yolo_version?.includes('mock') && <span className={styles.demoBadge}>Simulasi</span>}
    </span>
  );
}

function HistoryDetail({ item, onClose }: { item: ScanHistoryItem; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const sizePerKg = item.averageWeightGram > 0 ? Math.round(1000 / item.averageWeightGram) : 0;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog ref={dialogRef} className={styles.detailDialog} aria-labelledby="history-detail-title" onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={styles.detailContent}>
        <button type="button" className="dialog-close" aria-label="Tutup detail riwayat" onClick={onClose}><X size={22} /></button>
        <header className={styles.detailHeading}>
          <p className="eyebrow">Catatan pengamatan</p>
          <h2 id="history-detail-title">Sampel Anda, <em>dalam angka.</em></h2>
          <p className={styles.detailFilename}>{item.imageName}</p>
          <time dateTime={item.timestamp}>{formatDate(item.timestamp)}</time>
        </header>

        {item.meta?.model_yolo_version?.includes('mock') && <p className={shared.notice}>Hasil simulasi untuk mencoba tampilan. Angka ini bukan pengukuran foto Anda.</p>}

        <div className={shared.resultSummary}>
          <div className={shared.primaryMetric}>
            <span>Total estimasi berat</span>
            <p>{item.totalWeightGram.toFixed(2)} <small>gram</small></p>
            <span className={shared.saveStatus}>Tersimpan di riwayat perangkat ini</span>
          </div>
          <dl className={shared.metrics}>
            <div><dt>Udang terdeteksi</dt><dd>{item.totalDetected}<small> ekor</small></dd></div>
            <div><dt>Rata-rata berat</dt><dd>{item.averageWeightGram.toFixed(2)}<small> g/ekor</small></dd></div>
            <div><dt>Estimasi size</dt><dd>{sizePerKg}<small> ekor/kg</small></dd></div>
            <div><dt>Ukuran foto</dt><dd className={styles.dimensions}>{item.originalWidth} × {item.originalHeight}<small> px</small></dd></div>
          </dl>
        </div>

        <div className={shared.resultColumns}>
          <div className={shared.observation}>
            <div className={shared.panelHeading}><h3>Area yang terdeteksi</h3><span>{item.totalDetected} objek</span></div>
            {item.imageDataUrl ? (
              <PolygonCanvas imageSrc={item.imageDataUrl} originalWidth={item.originalWidth} originalHeight={item.originalHeight} predictions={item.predictions} selectedPredictionId={selectedId} onSelectPrediction={setSelectedId} />
            ) : (
              <div className={styles.missingImage}><ImageOff size={32} strokeWidth={1.25} /><p>Pratinjau foto tidak tersedia.<br />Rincian hasil tetap dapat dibaca.</p></div>
            )}
            <p className={shared.helpText}>Pilih udang pada rincian sampel untuk menyorot areanya pada foto.</p>
          </div>
          <div className={shared.samplePanel}>
            <div className={shared.panelHeading}><h3>Rincian sampel</h3><span>gram / ekor</span></div>
            <div className={shared.sampleList}>
              {item.predictions.map((prediction) => (
                <div key={prediction.id} className={`${shared.sampleItem} ${selectedId === prediction.id ? shared.selectedSample : ''}`}>
                  <button type="button" className={shared.sampleButton} aria-pressed={selectedId === prediction.id} onClick={() => setSelectedId(selectedId === prediction.id ? null : prediction.id)}>
                    <span>Udang <span className={shared.sampleNumber}>#{String(prediction.id).padStart(2, '0')}</span></span>
                    <strong>{prediction.berat_gram.toFixed(2)} <small>g</small></strong>
                  </button>
                  {selectedId === prediction.id && (
                    <dl className={shared.featureList}>
                      {Object.entries(prediction.features_extracted).map(([key, value]) => (
                        <div key={key}><dt>{featureLabels[key] || key}</dt><dd>{typeof value === 'number' ? value.toFixed(2) : 'Tidak tersedia'}</dd></div>
                      ))}
                    </dl>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={shared.resultFooter}>
          <p>Estimasi dihitung dari foto. Ikuti jarak pengambilan 29 cm agar skala gambar tetap sesuai.</p>
          <button type="button" className={shared.secondaryButton} onClick={() => exportHistoryToCSV([item])}><FileSpreadsheet size={16} /> Ekspor catatan ini</button>
        </div>
      </div>
    </dialog>
  );
}

export function ScanHistory() {
  const history = useSyncExternalStore(subscribeToScanHistory, getScanHistory, getServerHistory);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
  const selectedScan = history.find((item) => item.id === selectedScanId);
  const query = searchTerm.trim().toLocaleLowerCase('id-ID');
  const filteredHistory = history.filter((item) =>
    `${item.imageName} ${item.timestamp} ${formatDate(item.timestamp)}`.toLocaleLowerCase('id-ID').includes(query)
  );

  const handleClearAll = () => {
    if (window.confirm('Hapus seluruh riwayat pengamatan di browser ini?')) {
      clearScanHistory();
      setSelectedScanId(null);
      setSearchTerm('');
    }
  };

  return (
    <section aria-labelledby="history-title">
      <header className={styles.heading}>
        <div>
          <p className="eyebrow"><span className="small-rule" /> Catatan sampel Anda</p>
          <h1 id="history-title">Setiap pengamatan,<br /><em>tersimpan di sini.</em></h1>
          <p className={styles.intro}>Tinjau kembali foto dan estimasi berat dari sampel yang telah Anda amati.</p>
        </div>
        <Link href="/#analisis" className="button button-primary">Analisis foto baru <ArrowUpRight size={17} /></Link>
      </header>

      <div className={styles.toolbar}>
        <p className={styles.recordCount}><span className="status-dot" /> Riwayat pengamatan <span>{history.length} catatan</span></p>
        {history.length > 0 && (
          <div className={styles.toolbarActions}>
            <button type="button" className={shared.secondaryButton} onClick={() => exportHistoryToCSV(history)}><FileSpreadsheet size={16} /> Ekspor CSV</button>
            <button type="button" className={styles.deleteAll} onClick={handleClearAll}><Trash2 size={15} /> Hapus semua</button>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className={styles.searchRow}>
          <label className={styles.search}>
            <Search size={17} aria-hidden="true" />
            <input type="search" aria-label="Cari riwayat berdasarkan nama file atau tanggal" placeholder="Cari nama file atau tanggal…" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
          </label>
          <p role="status">{query ? `${filteredHistory.length} dari ${history.length} catatan` : 'Catatan terbaru ditampilkan lebih dahulu'}</p>
        </div>
      )}

      {filteredHistory.length === 0 ? (
        <div className={styles.emptyState}>
          {history.length > 0 ? <Search size={36} strokeWidth={1.25} /> : <History size={36} strokeWidth={1.25} />}
          <p className="eyebrow">{history.length > 0 ? 'Hasil pencarian' : 'Awal sebuah pengamatan'}</p>
          <h2>{history.length > 0 ? 'Catatan belum ditemukan.' : 'Belum ada catatan sampel.'}</h2>
          <p>{history.length > 0 ? 'Coba nama file atau tanggal lain untuk menemukan pengamatan Anda.' : 'Mulai dengan satu foto udang. Setelah analisis selesai, hasilnya akan tersimpan otomatis di sini.'}</p>
          {history.length > 0 ? (
            <button type="button" className={shared.secondaryButton} onClick={() => setSearchTerm('')}>Reset pencarian</button>
          ) : (
            <Link href="/#analisis" className="button button-primary">Mulai pengamatan <ArrowUpRight size={17} /></Link>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredHistory.map((item) => (
            <article key={item.id} className={styles.card}>
              <button type="button" className={styles.openCard} onClick={() => setSelectedScanId(item.id)} aria-label={`Lihat detail ${item.imageName}`}>
                <HistoryThumbnail item={item} />
                <span className={styles.cardContent}>
                  <span className={styles.cardLabel}>Total estimasi berat</span>
                  <span className={styles.weight}>{item.totalWeightGram.toFixed(2)} <small>gram</small></span>
                  <span className={styles.cardAverage}>Rata-rata {item.averageWeightGram.toFixed(2)} g/ekor</span>
                  <span className={styles.filename} title={item.imageName}>{item.imageName}</span>
                  <span className={styles.cardDate}><Calendar size={13} aria-hidden="true" /><time dateTime={item.timestamp}>{formatDate(item.timestamp)}</time></span>
                </span>
              </button>
              <div className={styles.cardFooter}>
                <button type="button" className={styles.detailLink} onClick={() => setSelectedScanId(item.id)} aria-label={`Buka catatan ${item.imageName}`}>Lihat pengamatan <ArrowUpRight size={15} /></button>
                <button type="button" className={styles.deleteButton} onClick={() => deleteScanHistoryItem(item.id)} aria-label={`Hapus riwayat ${item.imageName}`} title="Hapus catatan"><Trash2 size={16} /></button>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className={styles.storageNote}>Catatan tersimpan di browser perangkat ini. Ekspor CSV untuk menyimpan salinannya.</p>
      {selectedScan && <HistoryDetail key={selectedScan.id} item={selectedScan} onClose={() => setSelectedScanId(null)} />}
    </section>
  );
}
