'use client';

import { useEffect, useState } from 'react';
import { checkServerHealth } from '@/lib/api';
import { HealthCheckResponse } from '@/lib/types';
import { Server, RefreshCw, Cpu } from 'lucide-react';

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
    const interval = setInterval(refreshHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = health.status === 'online';
  const isDegraded = health.status === 'degraded';

  return (
    <div className="flex items-center gap-2.5">
      {/* API Health Status Pill */}
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-all ${
          isOnline
            ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
            : isDegraded
            ? 'border-amber-500/30 bg-amber-950/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
            : 'border-rose-500/30 bg-rose-950/40 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
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
              isOnline ? 'bg-emerald-400' : isDegraded ? 'bg-amber-400' : 'bg-rose-400'
            }`}
          />
        </span>

        <span className="font-medium tracking-wide">
          {isOnline ? 'API Ready' : isDegraded ? 'Model Loading' : 'API Offline'}
        </span>

        <button
          onClick={refreshHealth}
          disabled={loading}
          className="ml-0.5 text-white/50 hover:text-white disabled:opacity-40 transition-colors p-0.5 rounded-full hover:bg-white/10"
          title="Cek ulang status server API"
          aria-label="Refresh server status"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Modern Mock Switch Component */}
      <label
        htmlFor="mock-toggle-switch"
        className={`group flex items-center gap-2 cursor-pointer select-none rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
          useMock
            ? 'border-[#F59E0B] bg-[#F59E0B]/15 text-[#D97706] shadow-[0_0_16px_rgba(245,158,11,0.2)]'
            : 'border-sky-200 bg-white text-[#334155] hover:border-sky-300'
        }`}
        title="Aktifkan simulasi respon mock jika server API offline"
      >
        <Cpu className={`h-3.5 w-3.5 transition-colors ${useMock ? 'text-[#F59E0B]' : 'text-slate-400'}`} />
        <span className="hidden sm:inline font-medium">Mode Mock</span>

        {/* Physical toggle slider */}
        <div className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-sky-100 p-0.5 transition-colors duration-200 ease-in-out">
          <input
            id="mock-toggle-switch"
            type="checkbox"
            checked={useMock}
            onChange={(e) => onToggleMock(e.target.checked)}
            className="sr-only"
            aria-label="Toggle Mock API"
          />
          <span
            className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ease-in-out ${
              useMock
                ? 'translate-x-4 bg-[#F59E0B] shadow-sm'
                : 'translate-x-0 bg-slate-300'
            }`}
          />
        </div>
      </label>
    </div>
  );
}

