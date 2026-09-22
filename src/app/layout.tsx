import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ShrimpWeightAI — Estimator Berat Udang Berbasis Kamera 29cm',
  description:
    'Aplikasi estimasi berat udang akuakultur presisi tinggi menggunakan YOLOv8-Seg dan Support Vector Regression (SVR) pada jarak vertikal 29 cm.',
  keywords: ['shrimp weight prediction', 'akuakultur udang', 'YOLOv8-Seg', 'SVR', 'tambak udang'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
