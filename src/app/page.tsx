'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Camera, Check, ChevronDown, MoveVertical, ScanLine } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SopDialog } from '@/components/sop-dialog';
import { ServerStatusBadge } from '@/components/server-status';
import { ImageCapture } from '@/components/image-capture';
import { PredictionResult } from '@/components/prediction-result';
import type { PredictResult, PredictSuccessResponse } from '@/lib/types';
import type { ProcessedImageResult } from '@/lib/exif-processor';

const processSteps = [
  { title: 'Foto dari jarak yang tepat', detail: 'Ambil foto tegak lurus dari ketinggian 29 cm. Gunakan alas polos, cahaya merata, dan biarkan seluruh udang terlihat. Unggah foto dengan rasio aslinya, tanpa crop.' },
  { title: 'Setiap udang dikenali', detail: 'Model YOLOv26-Seg mengenali setiap udang dalam foto dan membentuk poligon mengikuti tubuhnya. Anda dapat melihat dan memilih objek pada hasil analisis.' },
  { title: 'Bentuk diterjemahkan menjadi berat', detail: 'Luas dan keliling piksel dari setiap poligon diproses oleh model regresi SVR untuk menghasilkan estimasi berat dalam gram. Konsistensi jarak foto menjaga skala pengukuran.' },
  { title: 'Hasil siap Anda tinjau kembali', detail: 'Tinjau berat per udang, berat total, dan rata-rata sampel. Hasil tersimpan di riwayat browser ini dan dapat diekspor ke CSV untuk pencatatan berikutnya.' },
];

const vannameiFacts = [
  {
    topic: 'Asal & habitat',
    title: 'Dari pesisir Pasifik timur.',
    description: 'Vannamei berasal dari pesisir Meksiko hingga Peru. Udang dewasa hidup dan memijah di laut, sementara fase mudanya tumbuh di estuari, laguna, dan kawasan mangrove.',
  },
  {
    topic: 'Ciri fisik',
    title: 'Putih, dengan tubuh tembus cahaya.',
    description: 'Tubuhnya umumnya berwarna putih semi-transparan. Warna ini dapat berubah mengikuti pakan, kondisi dasar perairan, dan kekeruhan air tempat hidupnya.',
  },
  {
    topic: 'Makanan',
    title: 'Kebutuhan berubah seiring tumbuh.',
    description: 'Pada fase larva, vannamei memanfaatkan fitoplankton dan zooplankton. Setelah berkembang, makanannya mencakup detritus atau sisa bahan organik, serta hewan kecil di dasar perairan.',
  },
  {
    topic: 'Pertumbuhan',
    title: 'Lingkungan ikut menentukan.',
    description: 'Suhu air, kepadatan tebar, dan kecukupan pakan memengaruhi laju pertumbuhan. Pengamatan ukuran secara berkala membantu melihat perkembangan sampel dalam kondisi pemeliharaannya.',
  },
];

export default function HomePage() {
  const [useMock, setUseMock] = useState(false);
  const [isSopOpen, setIsSopOpen] = useState(false);
  const [activeResult, setActiveResult] = useState<PredictSuccessResponse | null>(null);
  const [processedImg, setProcessedImg] = useState<ProcessedImageResult | null>(null);
  const analysisRef = useRef<HTMLElement>(null);

  const handlePredictionSuccess = (result: PredictResult, processedImage: ProcessedImageResult) => {
    if (!result.ok) return;
    setActiveResult(result);
    setProcessedImg(processedImage);
    requestAnimationFrame(() => analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const handleReset = () => {
    if (processedImg) URL.revokeObjectURL(processedImg.previewUrl);
    setActiveResult(null);
    setProcessedImg(null);
  };

  return (
    <div className="site-shell">
      <Navbar useMock={useMock} onToggleMock={setUseMock} onOpenSop={() => setIsSopOpen(true)} />
      <main id="main-content">
        <section className="hero page-width" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="small-rule" /> Pengamatan kecil. Wawasan berarti.</p>
            <h1 id="hero-title">Satu foto.<br />Kenali setiap<br /><em>gramnya.</em></h1>
            <p className="hero-description">Estimasi berat udang vannamei langsung dari foto. Cara sederhana untuk memahami sampel Anda, satu udang pada satu waktu.</p>
            <div className="hero-actions">
              <a href="#analisis" className="button button-primary">Mulai analisis <ArrowUpRight size={18} /></a>
              <button className="text-button" onClick={() => setIsSopOpen(true)}>Panduan pemotretan <ArrowUpRight size={16} /></button>
            </div>
            <div className="hero-footnote"><span /><p>Tanpa alat timbang tambahan.<br /><strong>Cukup kamera dan jarak 29 cm.</strong></p></div>
          </div>

          <figure className="specimen">
            <Image src="/assets/shrimp-study.webp" alt="Studi visual udang vannamei dengan detail tubuh transparan di atas permukaan hijau sage" fill sizes="(max-width: 760px) 100vw, 52vw" preload className="specimen-image" />
            <div className="specimen-top"><span>Catatan spesimen / 01</span><ScanLine size={19} aria-hidden="true" /></div>
            <div className="specimen-focus" aria-hidden="true"><i /><i /><i /><i /></div>
            <div className="specimen-name"><span>Udang putih</span><em>Litopenaeus vannamei</em></div>
            <div className="specimen-bottom"><span>Ilustrasi visual, bukan hasil analisis</span><span>VANNAMEI</span></div>
          </figure>
        </section>

        <div className="principles page-width">
          <p>Dari pengamatan,<br /><strong>menjadi pemahaman.</strong></p>
          <div><Camera size={21} /><span>Foto tanpa crop<small>Jaga rasio gambar asli</small></span></div>
          <div><MoveVertical size={21} /><span>Jarak tetap 29 cm<small>Tegak lurus dari permukaan alas</small></span></div>
          <div><ScanLine size={21} /><span>Per udang, lebih jelas<small>Berat dan visualisasi setiap objek</small></span></div>
        </div>

        <section id="analisis" ref={analysisRef} className="analysis-section page-width" aria-labelledby="analysis-title">
          <div className="section-heading">
            <div><p className="eyebrow">Ruang analisis</p><h2 id="analysis-title">Mulai dari <em>foto Anda.</em></h2></div>
            <Link href="/history" className="text-button">Lihat riwayat <ArrowUpRight size={17} /></Link>
          </div>
          <div className="analysis-toolbar"><span className="workspace-title"><span className="status-dot" /> {activeResult ? 'Hasil pengamatan' : 'Sampel baru'}</span><ServerStatusBadge useMock={useMock} onToggleMock={setUseMock} /></div>
          {useMock && <p className="demo-notice">Mode simulasi aktif. Hasil berupa data contoh untuk mencoba alur aplikasi, bukan pengukuran foto Anda.</p>}
          {activeResult && processedImg ? (
            <div className="result-workspace"><PredictionResult result={activeResult} processedImage={processedImg} onReset={handleReset} /></div>
          ) : (
            <div className="analysis-grid">
              <ImageCapture useMock={useMock} onSuccess={handlePredictionSuccess} onReset={handleReset} />
              <aside className="capture-guide">
                <div className="guide-title"><span>Sebelum memotret</span><span>01 / 03</span></div>
                <div className="distance-diagram" role="img" aria-label="Kamera berada 29 sentimeter tepat di atas alas udang">
                  <div className="diagram-phone"><Camera size={19} /></div>
                  <div className="diagram-measure"><span /><strong>29<small>cm</small></strong><span /></div>
                  <div className="diagram-tray"><span /></div>
                  <span className="diagram-caption">Permukaan alas</span>
                </div>
                <ul className="guide-checklist">
                  <li><Check size={15} /> Kamera tegak lurus, jarak 29 cm</li>
                  <li><Check size={15} /> Alas polos dan cahaya merata</li>
                  <li><Check size={15} /> Udang terpisah, foto tanpa crop</li>
                </ul>
                <button className="guide-link" onClick={() => setIsSopOpen(true)}>Buka panduan lengkap <ArrowUpRight size={16} /></button>
              </aside>
            </div>
          )}
          <p className="analysis-note">Hasil merupakan estimasi. Jarak dan kondisi pemotretan memengaruhi hasil pengukuran.</p>
        </section>

        <section id="deteksi" className="method-section" aria-labelledby="method-title">
          <div className="method-layout page-width">
            <div className="method-intro"><p className="eyebrow">Di balik pengamatan</p><h2 id="method-title">Dari piksel<br />ke <em>berat udang.</em></h2><p>Anda menyiapkan foto.<br />Sistem membantu membaca detailnya.</p><div className="method-mark"><ArrowDown size={22} /><span>Satu alur, dari foto hingga catatan.</span></div></div>
            <div className="method-steps">{processSteps.map((step, index) => <details key={step.title} className="method-step" open={index === 0 ? true : undefined}><summary><span className="step-number">0{index + 1}</span><h3>{step.title}</h3><ChevronDown size={18} /></summary><p>{step.detail}</p></details>)}</div>
          </div>
        </section>

        <section id="informasi" className="species-section page-width" aria-labelledby="species-title">
          <div className="species-intro">
            <div>
              <p className="eyebrow">Objek pengamatan</p>
              <h2 id="species-title">Lebih dekat<br />dengan <em>vannamei.</em></h2>
            </div>
            <div className="species-copy">
              <p>Udang putih yang menjadi fokus aplikasi ini memiliki cerita di balik setiap gramnya. Mengenali habitat, makanan, dan pertumbuhannya memberi konteks pada sampel yang Anda amati.</p>
              <button type="button" className="text-button" onClick={() => setIsSopOpen(true)}>Siapkan sampel Anda <ArrowUpRight size={16} /></button>
            </div>
          </div>

          <dl className="species-profile">
            <div><dt>Nama ilmiah</dt><dd><i>Litopenaeus vannamei</i></dd></div>
            <div><dt>Nama internasional</dt><dd>Whiteleg shrimp</dd></div>
            <div><dt>Famili</dt><dd>Penaeidae</dd></div>
          </dl>

          <div className="species-facts">
            {vannameiFacts.map((fact, index) => (
              <article key={fact.topic} className="species-fact">
                <span className="species-fact-number" aria-hidden="true">0{index + 1}</span>
                <div>
                  <p className="eyebrow">{fact.topic}</p>
                  <h3>{fact.title}</h3>
                  <p className="species-fact-description">{fact.description}</p>
                </div>
              </article>
            ))}
          </div>

          <p className="species-sources">
            Referensi biologi dan budidaya:
            {' '}<a href="https://www.fao.org/fishery/docs/CDrom/aquaculture/I1129m/file/en/en_whitelegshrimp.htm" target="_blank" rel="noopener noreferrer">Profil vannamei — FAO <ArrowUpRight size={12} aria-hidden="true" /></a>
            <span aria-hidden="true">·</span>
            <a href="https://www.fao.org/4/ad505e/ad505e06.htm" target="_blank" rel="noopener noreferrer">Karakteristik budidaya — FAO <ArrowUpRight size={12} aria-hidden="true" /></a>
          </p>

          <aside className="species-monitoring" aria-labelledby="species-monitoring-title">
            <div>
              <p className="eyebrow">Memahami hasil pengamatan</p>
              <h3 id="species-monitoring-title">Berat per ekor, gambaran ukuran sampel.</h3>
              <p>Bandingkan berat rata-rata antar pengamatan untuk melihat perubahan ukuran sampel. Istilah <i>size</i> pada hasil analisis berarti perkiraan jumlah udang per kilogram: semakin besar berat per ekor, semakin kecil angka size-nya.</p>
              <Link href="/history" className="text-button">Tinjau catatan pengamatan <ArrowUpRight size={16} /></Link>
            </div>
            <div className="species-size-example">
              <span>Contoh perhitungan, bukan hasil analisis</span>
              <p><strong>20 <small>g/ekor</small></strong><span aria-hidden="true">→</span><strong>50 <small>ekor/kg</small></strong></p>
              <span>1.000 gram ÷ 20 gram per ekor = size 50</span>
            </div>
          </aside>
        </section>
      </main>
      <Footer onOpenSop={() => setIsSopOpen(true)} />
      <SopDialog isOpen={isSopOpen} onClose={() => setIsSopOpen(false)} />
    </div>
  );
}
