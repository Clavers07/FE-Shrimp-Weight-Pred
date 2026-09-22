'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SopDialog } from '@/components/sop-dialog';
import { ScanHistory } from '@/components/scan-history';

export default function HistoryPage() {
  const [useMock, setUseMock] = useState<boolean>(false);
  const [isSopOpen, setIsSopOpen] = useState<boolean>(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        useMock={useMock}
        onToggleMock={setUseMock}
        onOpenSop={() => setIsSopOpen(true)}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <ScanHistory />
        </div>
      </main>

      <Footer onOpenSop={() => setIsSopOpen(true)} />

      <SopDialog isOpen={isSopOpen} onClose={() => setIsSopOpen(false)} />
    </div>
  );
}
