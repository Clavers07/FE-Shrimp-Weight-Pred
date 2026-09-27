'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SopDialog } from '@/components/sop-dialog';
import { ScanHistory } from '@/components/scan-history';
import styles from '@/components/scan-history.module.css';

export default function HistoryPage() {
  const [useMock, setUseMock] = useState<boolean>(false);
  const [isSopOpen, setIsSopOpen] = useState<boolean>(false);

  return (
    <div className={`site-shell ${styles.page}`}>
      <Navbar
        useMock={useMock}
        onToggleMock={setUseMock}
        onOpenSop={() => setIsSopOpen(true)}
      />

      <main id="main-content" className={`page-width ${styles.main}`}>
        <ScanHistory />
      </main>

      <Footer onOpenSop={() => setIsSopOpen(true)} />

      <SopDialog isOpen={isSopOpen} onClose={() => setIsSopOpen(false)} />
    </div>
  );
}

