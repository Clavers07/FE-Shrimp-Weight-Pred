'use client';

import { useEffect, useRef } from 'react';
import { Camera, Layers, Ruler, Sun, X } from 'lucide-react';

const guidelines = [
  { icon: Ruler, title: 'Jaga jarak 29 cm', description: 'Ukur dari lensa kamera ke permukaan alas. Posisikan kamera datar dan tegak lurus, bukan dari sudut miring.' },
  { icon: Layers, title: 'Siapkan alas yang polos', description: 'Gunakan nampan berwarna kontras tanpa motif. Pisahkan udang agar seluruh tubuhnya terlihat dan tidak saling menutupi.' },
  { icon: Sun, title: 'Gunakan cahaya merata', description: 'Pastikan foto tajam dan cukup terang. Hindari bayangan pekat, pantulan silau, atau bagian tubuh yang tidak fokus.' },
  { icon: Camera, title: 'Pertahankan foto asli', description: 'Jangan crop atau gunakan zoom digital. Unggah foto dengan rasio asli agar skala piksel tetap sesuai dengan kalibrasi.' },
];

export function SopDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      return () => { dialog.close(); document.body.style.overflow = previousOverflow; };
    }
    dialog.close();
  }, [isOpen]);

  return (
    <dialog ref={dialogRef} className="sop-dialog" aria-labelledby="sop-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="sop-content"><button className="dialog-close" aria-label="Tutup panduan pemotretan" onClick={onClose}><X size={22} /></button><p className="eyebrow">Panduan pemotretan</p><h2 id="sop-title">Foto yang baik.<br /><em>Pengamatan yang berarti.</em></h2><p className="sop-intro">Empat hal sederhana untuk membantu sistem membaca sampel Anda.</p><div className="sop-distance"><Camera size={26} /><span>Jarak lensa ke alas</span><strong>29 <small>cm</small></strong></div><div className="sop-steps">{guidelines.map(({ icon: Icon, title, description }, index) => <div key={title}><span className="sop-step-number">0{index + 1}</span><div><h3><Icon size={17} />{title}</h3><p>{description}</p></div></div>)}</div><p className="sop-note">Mengapa 29 cm? Model menghubungkan ukuran piksel dengan berat pada jarak ini. Mengubah jarak atau memotong gambar akan mengubah skala pengukuran.</p><button className="button button-primary sop-confirm" onClick={onClose}>Mengerti, siap memotret</button></div>
    </dialog>
  );
}
