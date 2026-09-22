'use client';

import { useEffect, useState } from 'react';
import { checkServerHealth } from '@/lib/api';
import { HealthCheckResponse } from '@/lib/types';
import { Activity, Server, Cpu, RefreshCw } from 'lucide-react';

interface ServerStatusBadgeProps {
  useMock: boolean;
  onToggleMock: (val: boolean) => void;
}

export function ServerStatusBadge({ useMock, onToggleMock }: ServerStatusBadgeProps) {
  const [health, setHealth] = useState<HealthCheckResponse>({ status: 'checking', model_ready: false });
  const [loading, setLoading] = useState<boolean>(false);

  const refreshHealth = async () => {
    setLoading(true);
    const res = await checkServerHealth();
    setHealth(res);
    setLoading(false);
  };

  useEffect(() => {
    refreshHealth();
    // Poll health status every 30 seconds
    const interval = setInterval(refreshHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (useMock) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleMock(false)}
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300 transition-colors"
          title="Klik untuk beralih ke Server Flask API Asli"
        >
          <Cpu className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span>Mock API Active</span>
        </button>
      </div>
    );
  }

  const isOnline = health.status === 'online';
  const isDegraded = health.status === 'degraded';

  return (
    <div className="flex items-center gap-2">
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
          isOnline
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300'
            : isDegraded
            ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-300'
            : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/40 dark:bg-rose-950/40 dark:text-rose-300'
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
              isOnline ? 'bg-emerald-400' : isDegraded ? 'bg-amber-400' : 'bg-rose-400'
            }`}
          />
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              isOnline ? 'bg-emerald-500' : isDegraded ? 'bg-amber-500' : 'bg-rose-500'
            }`}
          />
        </span>
        <Server className="h-3.5 w-3.5" />
        <span>{isOnline ? 'API Ready' : isDegraded ? 'Model Loading' : 'API Offline'}</span>

        <button
          onClick={refreshHealth}
          disabled={loading}
          className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50"
          title="Cek ulang status server"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {!isOnline && (
        <button
          onClick={() => onToggleMock(true)}
          className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-700 hover:underline dark:text-cyan-400"
          title="Aktifkan Mode Mock untuk pengujian tanpa server"
        >
          <Activity className="h-3 w-3" />
          <span>Pakai Mock</span>
        </button>
      )}
    </div>
  );
}
