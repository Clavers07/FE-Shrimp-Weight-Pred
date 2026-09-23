'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SopBanner } from '@/components/sop-banner';
import { SopDialog } from '@/components/sop-dialog';
import { ImageCapture } from '@/components/image-capture';
import { PredictionResult } from '@/components/prediction-result';
import { PredictResult, PredictSuccessResponse } from '@/lib/types';
import { ProcessedImageResult } from '@/lib/exif-processor';
import {
  Ruler, Sparkles, ShieldCheck, Target,
  ScanSearch, Layers, BrainCircuit, BarChart3,
  Camera, Cpu, FlaskConical,
  Leaf, Droplets, Thermometer, Fish, ChevronRight,
  Clock, Globe, TrendingUp, Award,
} from 'lucide-react';

export default function HomePage() {
  const [useMock, setUseMock] = useState<boolean>(false);
  const [isSopOpen, setIsSopOpen] = useState<boolean>(false);

  const [activeResult, setActiveResult] = useState<PredictSuccessResponse | null>(null);
  const [processedImg, setProcessedImg] = useState<ProcessedImageResult | null>(null);

  const handlePredictionSuccess = (result: PredictResult, processedImage: ProcessedImageResult) => {
    if (result.ok) {
      setActiveResult(result);
      setProcessedImg(processedImage);
    }
  };

  const handleReset = () => {
    setActiveResult(null);
    setProcessedImg(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F9FF] text-[#334155]">
      <Navbar
        useMock={useMock}
        onToggleMock={setUseMock}
        onOpenSop={() => setIsSopOpen(true)}
      />

      <main className="flex-1 relative overflow-hidden">
        {/* Subtle Water Ripple Background Overlay */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-30 select-none overflow-hidden">
          <Image
            src="/assets/water-ripple.svg"
            alt="Water ripple texture"
            fill
            sizes="100vw"
            className="object-cover object-top"
            priority
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
          {/* SOP Notification Banner */}
          <SopBanner onOpenFullSop={() => setIsSopOpen(true)} />

          {/* Hero Section (When Idle) */}
          {!activeResult && (
            <div className="mb-10 lg:mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Hero Text Column */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 px-3.5 py-1 text-xs font-bold text-[#0EA5E9]">
                    <Sparkles className="h-3.5 w-3.5 text-[#E8A33D]" />
                    <span>Inovasi Akuakultur Digital</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-extrabold tracking-tight text-[#0C4A6E] font-heading leading-[1.15]">
                    Deteksi & Estimasi Berat Udang <span className="text-[#0EA5E9]"> Menggunakan Kamera Digital</span>
                  </h1>

                  <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-xl">
                    Deteksi poligon instans YOLOv26 dan regresi SVR presisi tinggi dengan jarak pemotretan vertikal konstan <strong className="text-[#0C4A6E]">29 cm</strong> dari atas permukaan alas nampan.
                  </p>

                  {/* Highlights list */}
                  <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
                    <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 border border-sky-200 text-[#334155] shadow-sm">
                      <Target className="h-4 w-4 text-[#F59E0B]" />
                      <span>Jarak 29cm Vertikal</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 border border-sky-200 text-[#334155] shadow-sm">
                      <ShieldCheck className="h-4 w-4 text-[#0EA5E9]" />
                      <span>Tanpa Kalibrasi Koin</span>
                    </div>
                  </div>
                </div>

                {/* Hero Visual Column */}
                <div className="lg:col-span-5">
                  <div className="relative overflow-hidden rounded-[20px] border border-sky-200 bg-white shadow-[0_4px_24px_rgba(14,165,233,0.15)] group">
                    <div className="relative aspect-[16/10] w-full">
                      <Image
                        src="/assets/hero-shrimp.jpg"
                        alt="Pemotretan udang vannamei di atas nampan gelap"
                        fill
                        sizes="(max-width: 1024px) 100vw, 500px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority
                      />
                      {/* Gradient overlay for contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0C4A6E]/70 via-transparent to-transparent opacity-60" />
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-[#0C4A6E]/90 px-3 py-2 text-xs backdrop-blur-md border border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-[#F59E0B] animate-ping" />
                        <span className="font-semibold text-white">Standar Pemotretan 29 cm</span>
                      </div>
                      <span className="text-[11px] text-[#0EA5E9] font-bold">YOLOv8-Seg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Interactive Workflow Card */}
          {activeResult && processedImg ? (
            <PredictionResult
              result={activeResult}
              processedImage={processedImg}
              onReset={handleReset}
            />
          ) : (
            <ImageCapture
              useMock={useMock}
              onSuccess={handlePredictionSuccess}
              onReset={handleReset}
            />
          )}

          {/* Educational Section "Mengapa Harus Tepat 29cm?" (When Idle) */}
          {!activeResult && (
            <section className="mt-12 rounded-[24px] border border-sky-200 bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(14,165,233,0.10)]">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Visual Line-art distance icon */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E0F2FE] border border-sky-200 shadow-inner">
                  <div className="flex flex-col items-center">
                    <Ruler className="h-7 w-7 text-[#F59E0B]" />
                    <span className="text-[9px] font-black tracking-wider text-[#0EA5E9]">29 CM</span>
                  </div>
                </div>

                {/* Explanation text */}
                <div className="flex-1 space-y-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0C4A6E] font-heading flex items-center gap-2">
                    Mengapa Harus Tepat 29 cm?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    Model regresi SVR dikalibrasi secara matematis berdasarkan korelasi rasio piksel asli terhadap ukuran aktual udang pada jarak pemotretan vertikal tegak lurus <strong className="text-[#0C4A6E]">29 cm</strong>. Mengubah ketinggian kamera atau melakukan pemotongan (crop) gambar akan merusak rasio piksel, sehingga perhitungan luas piksel (area) dan keliling (perimeter) menjadi tidak akurat.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION: DETEKSI
        ═══════════════════════════════════════════════ */}
        {!activeResult && (
          <section id="deteksi" className="mt-0 scroll-mt-24 border-t border-sky-100 bg-gradient-to-b from-[#E0F2FE] to-[#F0F9FF] py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              {/* Header */}
              <div className="mb-12 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 px-4 py-1.5 text-xs font-bold text-[#0EA5E9] mb-4">
                  <ScanSearch className="h-3.5 w-3.5" />
                  <span>Cara Kerja Sistem</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0C4A6E] font-heading mb-3">
                  Bagaimana Sistem <span className="text-[#0EA5E9]">Mendeteksi</span> Udang?
                </h2>
                <p className="text-sm sm:text-base text-[#475569] max-w-2xl mx-auto leading-relaxed">
                  Pipeline lengkap dari pengambilan foto hingga estimasi berat menggunakan computer vision dan machine learning mutakhir.
                </p>
              </div>

              {/* Steps Pipeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
                {[
                  {
                    step: '01',
                    icon: Camera,
                    color: 'text-[#0EA5E9]',
                    bg: 'bg-[#E0F2FE]',
                    border: 'border-sky-200',
                    title: 'Ambil Foto',
                    desc: 'Foto diambil dari jarak tepat 29 cm tegak lurus di atas nampan menggunakan kamera smartphone atau DSLR.',
                  },
                  {
                    step: '02',
                    icon: Layers,
                    color: 'text-violet-500',
                    bg: 'bg-violet-50',
                    border: 'border-violet-200',
                    title: 'Segmentasi YOLOv8',
                    desc: 'Model YOLOv8-Seg mendeteksi dan menggambar poligon presisi di setiap individu udang dalam gambar.',
                  },
                  {
                    step: '03',
                    icon: FlaskConical,
                    color: 'text-amber-500',
                    bg: 'bg-amber-50',
                    border: 'border-amber-200',
                    title: 'Ekstraksi Fitur',
                    desc: 'Luas piksel (area) dan keliling (perimeter) setiap poligon dihitung sebagai fitur geometri utama.',
                  },
                  {
                    step: '04',
                    icon: BrainCircuit,
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-50',
                    border: 'border-emerald-200',
                    title: 'Regresi SVR',
                    desc: 'Support Vector Regression memetakan fitur geometri menjadi estimasi berat aktual dalam satuan gram.',
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className={`relative flex flex-col gap-4 rounded-2xl border ${item.border} bg-white p-5 shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg} border ${item.border}`}>
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <span className="text-2xl font-black text-slate-100 leading-none select-none">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#0C4A6E] font-heading mb-1">{item.title}</h3>
                      <p className="text-xs text-[#475569] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
                {[
                  { icon: Cpu, label: 'Model AI', value: 'YOLOv8-Seg', sub: 'Instance Segmentation', color: 'text-[#0EA5E9]' },
                  { icon: BarChart3, label: 'Regresi', value: 'SVR', sub: 'Support Vector Regression', color: 'text-violet-500' },
                  { icon: Ruler, label: 'Jarak Kamera', value: '29 cm', sub: 'Vertikal tegak lurus', color: 'text-amber-500' },
                  { icon: FlaskConical, label: 'Input Fitur', value: '2 Fitur', sub: 'Area + Perimeter piksel', color: 'text-emerald-500' },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center gap-2 rounded-2xl border border-sky-200 bg-white px-4 py-5 text-center shadow-sm">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    <span className={`text-xl sm:text-2xl font-extrabold font-heading ${stat.color}`}>{stat.value}</span>
                    <span className="text-[10px] sm:text-xs font-semibold text-[#475569]">{stat.sub}</span>
                  </div>
                ))}
              </div>

              {/* Keunggulan vs Metode Konvensional */}
              <div className="rounded-[24px] border border-sky-200 bg-white p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg sm:text-xl font-extrabold text-[#0C4A6E] font-heading mb-6">
                  Keunggulan vs Metode Konvensional
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: Clock, text: 'Hasil estimasi berat dalam hitungan detik, tanpa perlu menimbang satu per satu.', label: 'Lebih Cepat' },
                    { icon: Target, text: 'Kalibrasi matematis pada jarak 29 cm memastikan rasio piksel konsisten di setiap sesi.', label: 'Konsisten' },
                    { icon: ShieldCheck, text: 'Tidak memerlukan koin kalibrasi atau objek referensi eksternal.', label: 'Tanpa Referensi Tambahan' },
                    { icon: Globe, text: 'Berjalan di browser, tanpa perlu install software tambahan.', label: 'Mudah Diakses' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3 rounded-xl border border-sky-100 bg-[#F0F9FF] p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0EA5E9]/10 border border-sky-200">
                        <item.icon className="h-4 w-4 text-[#0EA5E9]" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[#0C4A6E] mb-0.5">{item.label}</p>
                        <p className="text-xs text-[#475569] leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════
            SECTION: INFORMASI UDANG VANNAMEI
        ═══════════════════════════════════════════════ */}
        {!activeResult && (
          <section id="informasi" className="scroll-mt-24 border-t border-sky-100 bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              {/* Header */}
              <div className="mb-12 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/50 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-600 mb-4">
                  <Fish className="h-3.5 w-3.5" />
                  <span>Panduan Akuakultur</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0C4A6E] font-heading mb-3">
                  Mengenal Udang <span className="text-emerald-500">Vannamei</span>
                </h2>
                <p className="text-sm sm:text-base text-[#475569] max-w-2xl mx-auto leading-relaxed">
                  Litopenaeus vannamei - komoditas akuakultur unggulan Indonesia dengan pangsa pasar ekspor terbesar di dunia.
                </p>
              </div>

              {/* Profil + Karakteristik */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Profil Spesies */}
                <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-[#F0FDF4] p-6 sm:p-7">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 border border-emerald-200">
                      <Fish className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="text-base font-extrabold text-[#0C4A6E] font-heading">Profil Spesies</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Nama Ilmiah', value: 'Litopenaeus vannamei' },
                      { label: 'Asal', value: 'Pantai Barat Amerika Latin (Pasifik Timur)' },
                      { label: 'Famili', value: 'Penaeidae' },
                      { label: 'Panjang Dewasa', value: '15–23 cm' },
                      { label: 'Berat Panen Ideal', value: '10–25 gram/ekor' },
                      { label: 'FCR (Feed Conversion Ratio)', value: '1,2–1,5' },
                    ].map((row) => (
                      <div key={row.label} className="flex items-start justify-between gap-2 text-xs border-b border-emerald-100 pb-2 last:border-0 last:pb-0">
                        <span className="font-semibold text-[#475569] shrink-0">{row.label}</span>
                        <span className="font-bold text-[#0C4A6E] text-right">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Parameter Lingkungan Ideal */}
                <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-[#E0F2FE] to-[#F0F9FF] p-6 sm:p-7">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 border border-sky-200">
                      <Droplets className="h-5 w-5 text-[#0EA5E9]" />
                    </div>
                    <h3 className="text-base font-extrabold text-[#0C4A6E] font-heading">Parameter Lingkungan Ideal</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Thermometer, label: 'Suhu Air', value: '23–30 °C', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
                      { icon: Droplets, label: 'Salinitas', value: '0,5–45 ppt', color: 'text-[#0EA5E9]', bg: 'bg-sky-50', border: 'border-sky-200' },
                      { icon: Leaf, label: 'pH Air', value: '7,5–8,5', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                      { icon: TrendingUp, label: 'DO (O₂)', value: '≥ 4 mg/L', color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200' },
                      { icon: FlaskConical, label: 'Amonia (NH₃)', value: '< 0,1 mg/L', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
                      { icon: Award, label: 'Kepadatan Tebar', value: '100–200 ekor/m²', color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' },
                    ].map((param) => (
                      <div key={param.label} className={`flex flex-col gap-1.5 rounded-xl border ${param.border} ${param.bg} p-3`}>
                        <param.icon className={`h-4 w-4 ${param.color}`} />
                        <span className="text-[10px] font-semibold text-[#475569]">{param.label}</span>
                        <span className={`text-xs font-extrabold ${param.color}`}>{param.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Manfaat & Nilai Gizi */}
              <div className="mb-10 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 border border-amber-200">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#0C4A6E] font-heading">Nilai Gizi & Manfaat Kesehatan</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  {[
                    { label: 'Protein', value: '~20 g', per: 'per 100g', color: 'text-amber-600' },
                    { label: 'Lemak', value: '~1,7 g', per: 'per 100g', color: 'text-orange-500' },
                    { label: 'Kalori', value: '~85 kkal', per: 'per 100g', color: 'text-rose-500' },
                    { label: 'Omega-3', value: 'Tinggi', per: 'EPA & DHA', color: 'text-emerald-600' },
                  ].map((nut) => (
                    <div key={nut.label} className="flex flex-col items-center gap-1 rounded-xl border border-amber-200 bg-white px-3 py-4 text-center shadow-sm">
                      <span className={`text-xl sm:text-2xl font-extrabold font-heading ${nut.color}`}>{nut.value}</span>
                      <span className="text-[10px] font-semibold text-[#475569]">{nut.per}</span>
                      <span className="text-xs font-bold text-[#0C4A6E]">{nut.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Sumber protein hewani lengkap',
                    'Rendah kalori & lemak jenuh',
                    'Kaya mineral: Zinc, Selenium, Fosfor',
                    'Mendukung kesehatan jantung',
                    'Antioksidan alami Astaxanthin',
                    'Aman untuk diet rendah karbohidrat',
                  ].map((benefit) => (
                    <span key={benefit} className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-semibold text-[#475569]">
                      <ChevronRight className="h-3 w-3 text-amber-500" />
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Siklus Budidaya */}
              <div className="rounded-2xl border border-sky-200 bg-[#F0F9FF] p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 border border-sky-200">
                    <TrendingUp className="h-5 w-5 text-[#0EA5E9]" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#0C4A6E] font-heading">Siklus Budidaya & Tahapan Panen</h3>
                </div>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-sky-200 hidden sm:block" />
                  <div className="space-y-4">
                    {[
                      { phase: 'Benur (PL-12)', days: 'Hari 1–7', desc: 'Post-larva ukuran 0,01 g ditebar ke tambak persiapan. Kepadatan awal 100–200 ekor/m².', color: 'bg-sky-400' },
                      { phase: 'Juvenil', days: 'Hari 8–30', desc: 'Pertumbuhan cepat mencapai berat 0,5–2 g. Monitoring kualitas air dan pemberian pakan intensif.', color: 'bg-violet-400' },
                      { phase: 'Sub-Dewasa', days: 'Hari 31–60', desc: 'Berat mencapai 3–10 g. Sampling berat dilakukan setiap 7–10 hari untuk penyesuaian dosis pakan.', color: 'bg-amber-400' },
                      { phase: 'Panen Parsial', days: 'Hari 60–75', desc: 'Panen selektif udang ukuran 15–18 g untuk menjaga kepadatan dan percepat pertumbuhan sisanya.', color: 'bg-emerald-400' },
                      { phase: 'Panen Total', days: 'Hari 90–120', desc: 'Seluruh biomassa dipanen pada berat ideal 20–25 g/ekor. Estimasi berat ShrimpWeightAI digunakan di tahap ini.', color: 'bg-[#0EA5E9]' },
                    ].map((phase, idx) => (
                      <div key={phase.phase} className="relative flex items-start gap-4 sm:pl-12">
                        <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${phase.color} text-white text-xs font-black shadow-sm sm:absolute sm:left-0 sm:top-0`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-extrabold text-[#0C4A6E] font-heading">{phase.phase}</span>
                            <span className="rounded-full bg-sky-100 border border-sky-200 px-2 py-0.5 text-[10px] font-bold text-[#0EA5E9]">{phase.days}</span>
                          </div>
                          <p className="text-xs text-[#475569] leading-relaxed">{phase.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fakta Menarik */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Globe, value: '#1', label: 'Udang paling banyak dibudidayakan di dunia', color: 'text-[#0EA5E9]', bg: 'bg-sky-50', border: 'border-sky-200' },
                  { icon: TrendingUp, value: '70%', label: 'Pangsa pasar ekspor udang Indonesia', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                  { icon: Award, value: '4–5 Ton', label: 'Produksi rata-rata per ha per siklus (intensif)', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
                ].map((fact) => (
                  <div key={fact.label} className={`flex flex-col items-center gap-2 rounded-2xl border ${fact.border} ${fact.bg} p-5 text-center`}>
                    <fact.icon className={`h-7 w-7 ${fact.color}`} />
                    <span className={`text-3xl font-extrabold font-heading ${fact.color}`}>{fact.value}</span>
                    <span className="text-xs font-semibold text-[#475569] leading-relaxed">{fact.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer onOpenSop={() => setIsSopOpen(true)} />

      <SopDialog isOpen={isSopOpen} onClose={() => setIsSopOpen(false)} />
    </div>
  );
}


