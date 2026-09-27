'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { checkServerHealth } from '@/lib/api';
import type { HealthCheckResponse } from '@/lib/types';

export function ServerStatusBadge({ useMock, onToggleMock }: { useMock: boolean; onToggleMock: (value: boolean) => void }) {
  const [health, setHealth] = useState<HealthCheckResponse>({ status: 'checking', model_ready: false });
  const [loading, setLoading] = useState(false);
  const mounted = useRef(false);
  const pending = useRef(false);
  const refresh = useCallback(async () => {
    if (pending.current) return;
    pending.current = true;
    setLoading(true);
    try {
      const result = await checkServerHealth();
      if (mounted.current) setHealth(result);
    } finally {
      pending.current = false;
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    const interval = setInterval(() => void refresh(), 30000);
    return () => { mounted.current = false; clearInterval(interval); };
  }, [refresh]);

  const label = health.status === 'checking' ? 'Memeriksa server' : health.status === 'online' ? 'Server terhubung' : health.status === 'degraded' ? 'Model disiapkan' : 'Server belum terhubung';
  return (
    <div className="server-controls">
      <div className={`server-health ${health.status}`}><span className="status-dot" /><span role="status">{label}</span><button onClick={() => void refresh()} disabled={loading} aria-label="Periksa kembali koneksi server" title="Periksa kembali koneksi server"><RefreshCw size={13} className={loading ? 'animate-spin' : ''} /></button></div>
      <label className="demo-toggle"><span>Simulasi</span><input type="checkbox" checked={useMock} onChange={event => onToggleMock(event.target.checked)} aria-label="Mode simulasi" /><span className="toggle-track" aria-hidden="true"><span /></span></label>
    </div>
  );
}
