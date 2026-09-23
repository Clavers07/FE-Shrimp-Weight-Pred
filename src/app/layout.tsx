import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-heading',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'ShrimpWeightAI: Estimator Berat Udang Berbasis Kamera 29cm',
  description:
    'Aplikasi estimasi berat udang akuakultur presisi tinggi menggunakan YOLOv26-Seg dan Support Vector Regression (SVR) pada jarak vertikal 29 cm.',
  keywords: ['shrimp weight prediction', 'akuakultur udang', 'YOLOv26-Seg', 'SVR', 'tambak udang'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body
        className={`${plusJakartaSans.variable} ${inter.variable} min-h-screen flex flex-col bg-[#0A1A2F] text-white antialiased selection:bg-[#E8A33D] selection:text-[#0A1A2F]`}
      >
        {children}
      </body>
    </html>
  );
}

