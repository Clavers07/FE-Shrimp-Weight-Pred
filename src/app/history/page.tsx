'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SopDialog } from '@/components/sop-dialog';
import { ScanHistory } from '@/components/scan-history';

export default function HistoryPage() {
  const [useMock, setUseMock] = useState<boolean>(false);
  const [isSopOpen, setIsSopOpen] = useState<boolean>(false);

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
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
          <ScanHistory />
        </div>
      </main>

      <Footer onOpenSop={() => setIsSopOpen(true)} />

      <SopDialog isOpen={isSopOpen} onClose={() => setIsSopOpen(false)} />
    </div>
  );
}

