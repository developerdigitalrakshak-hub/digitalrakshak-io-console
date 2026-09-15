import React from 'react';
import {
  Activity, AlertTriangle, CheckCircle2, Clock3, CreditCard,
  KeyRound, ListFilter, RefreshCw
} from 'lucide-react';
import { useGetUsageSummary, useGetUsageTimeseries, useListApiLogs } from '@workspace/api-client-react';
import type { ApiLog } from '@workspace/api-client-react';
import {
  Btn, Empty, LoadingRows, Metric, PageHeader, QueryError, Skeleton, Status, ago
} from '@/components/common';

export function UsagePage() {
  const summary = useGetUsageSummary();
  const timeseries = useGetUsageTimeseries();
  const logs = useListApiLogs({ limit: 30 });

  const s = summary.data;
  const points = timeseries.data ?? [];
  const entries = (logs.data ?? []) as ApiLog[];

  return (
    <div className="dr-in w-full">
      <PageHeader
        eyebrow="Workspace / Usage & logs"
        title="See every request clearly."
        copy="Monitor volume, latency and response quality across your integration."
        actions={<Btn variant="outline" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => { summary.refetch(); logs.refetch(); }}>Refresh data</Btn>}
      />

      {summary.isLoading ? (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="mt-5 h-64" />
        </>
      ) : summary.isError ? (
        <QueryError retry={() => summary.refetch()} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            <Metric label="Requests" value={(s?.totalRequests ?? 0).toLocaleString('en-IN')} note="Selected period" icon={Activity} />
            <Metric label="Success rate" value={`${s?.successRate ?? 0}%`} note={`${s?.successCount ?? 0} passed`} icon={CheckCircle2} accent="green" />
            <Metric label="Failed" value={(s?.failedCount ?? 0).toLocaleString('en-IN')} note="Needs attention" icon={AlertTriangle} accent="red" />
            <Metric label="Credits used" value={(s?.creditsConsumed ?? 0).toLocaleString('en-IN')} note="This period" icon={CreditCard} accent="gold" />
            <Metric label="Avg response" value={`${s?.averageResponseTime ?? 0}ms`} note="Across services" icon={Clock3} accent="blue" />
            <Metric label="Active keys" value="2" note="Production + test" icon={KeyRound} accent="blue" />
          </div>

          <div className="dr-card dr-shadow mt-5 p-5 w-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#2d3f5e]">Request volume</p>
                <p className="mt-1 text-[11px] text-[#8c97a7]">Requests and success rate by day</p>
              </div>
              <div className="flex gap-3 text-[10px] text-[#7b889b]">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[#5575a6]" />Requests</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[#f0bd57]" />Credits</span>
              </div>
            </div>

            <div className="mt-7 flex h-52 items-end gap-3 border-b border-l border-[#e2e7ee] px-4">
              {(points.length ? points : [
                { label: 'Mon', requests: 20, credits: 14 },
                { label: 'Tue', requests: 36, credits: 24 },
                { label: 'Wed', requests: 28, credits: 20 },
                { label: 'Thu', requests: 50, credits: 32 },
                { label: 'Fri', requests: 42, credits: 26 },
                { label: 'Sat', requests: 58, credits: 38 },
                { label: 'Sun', requests: 46, credits: 29 }
              ]).map((point, i) => (
                <div key={point.label + i} className="flex h-full flex-1 items-end gap-1.5">
                  <div className="w-1/2 rounded-t-sm bg-[#5878a8] hover:bg-[#3f6091]" style={{ height: `${Math.max(8, (point.requests / Math.max(...(points.length ? points : [{ requests: 58 }]).map(p => p.requests))) * 88)}%` }} />
                  <div className="w-1/2 rounded-t-sm bg-[#f0bd57]" style={{ height: `${Math.max(8, (point.credits / Math.max(...(points.length ? points : [{ credits: 38 }]).map(p => p.credits))) * 62)}%` }} />
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-between px-2 dr-mono text-[9px] text-[#a1aab7]">
              {(points.length ? points : [
                { label: 'Mon' }, { label: 'Tue' }, { label: 'Wed' }, { label: 'Thu' }, { label: 'Fri' }, { label: 'Sat' }, { label: 'Sun' }
              ]).map((p, i) => <span key={i}>{p.label}</span>)}
            </div>
          </div>

          <div className="dr-card dr-shadow mt-5 overflow-hidden w-full">
            <div className="flex items-center justify-between border-b border-[#e6eaf0] px-5 py-4">
              <div>
                <p className="text-sm font-bold text-[#2d3f5e]">API request log</p>
                <p className="mt-1 text-[11px] text-[#8c97a7]">The latest calls from your workspace.</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md border border-[#dde4ed] p-2 text-[#718097]" data-testid="button-filter-logs">
                  <ListFilter className="h-3.5 w-3.5" />
                </button>
                <Btn variant="outline" onClick={() => alert('Log export prepared in demo mode.')}>Export</Btn>
              </div>
            </div>

            {logs.isLoading ? (
              <div className="p-5"><LoadingRows /></div>
            ) : logs.isError ? (
              <div className="p-5"><QueryError retry={() => logs.refetch()} /></div>
            ) : entries.length === 0 ? (
              <div className="p-5"><Empty icon={Activity} title="No API calls yet" copy="Your request log will populate after the first verification." /></div>
            ) : (
              <div className="dr-scroll overflow-auto w-full">
                <table className="w-full text-left">
                  <thead className="bg-[#fafbfd]">
                    <tr>
                      {['Request ID', 'Service', 'Method', 'Status', 'Latency', 'Credits', 'Created'].map(h => (
                        <th key={h} className="px-5 py-3 dr-label text-[#8793a4]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(row => (
                      <tr key={row.requestId} className="border-t border-[#edf0f4]">
                        <td className="px-5 py-3 dr-mono text-[10px] text-[#566a8b]">{row.requestId}</td>
                        <td className="px-5 py-3 text-xs font-semibold text-[#445572]">{row.service}</td>
                        <td className="px-5 py-3">
                          <span className="dr-mono text-[9px] font-bold text-[#647895]">{row.method}</span>
                          <span className="ml-2 text-[10px] text-[#98a2b0]">{row.endpoint}</span>
                        </td>
                        <td className="px-5 py-3">
                          <Status tone={row.status.startsWith('2') ? 'success' : 'danger'}>{row.status}</Status>
                        </td>
                        <td className="px-5 py-3 dr-mono text-[10px] text-[#6e7d94]">{row.responseTime}ms</td>
                        <td className="px-5 py-3 dr-mono text-[10px] text-[#6e7d94]">{row.credits}</td>
                        <td className="px-5 py-3 text-[10px] text-[#8b96a6]">{ago(row.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
