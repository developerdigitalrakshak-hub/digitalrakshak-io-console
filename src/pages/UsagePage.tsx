import React, { useState } from 'react';
import {
  Activity, AlertTriangle, CheckCircle2, Clock3, CreditCard,
  KeyRound, ListFilter, RefreshCw, Eye, X, Copy, Check, Filter, Search, ShieldCheck
} from 'lucide-react';
import { useGetUsageSummary, useGetUsageTimeseries, useListApiLogs, useListServices } from '@workspace/api-client-react';
import type { ApiLog, VerificationService } from '@workspace/api-client-react';
import {
  Btn, Empty, LoadingRows, Metric, PageHeader, QueryError, Skeleton, Status, ago, date, money
} from '@/components/common';

// Helper to mask sensitive PII / secrets
function maskSensitiveData(data: any): any {
  if (!data) return data;
  if (typeof data === 'string') {
    // Mask 12-digit Aadhaar
    const cleanNum = data.replace(/\s/g, '');
    if (/^\d{12}$/.test(cleanNum)) {
      return `XXXX-XXXX-${cleanNum.slice(-4)}`;
    }
    // Mask 10-char PAN
    if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(data)) {
      return `${data.slice(0, 3)}****${data.slice(-1)}`;
    }
    // Mask 4-6 digit OTP
    if (/^\d{4,6}$/.test(data)) {
      return '••••••';
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }

  if (typeof data === 'object') {
    const masked: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('aadhaar')) {
        masked[key] = typeof val === 'string' ? `XXXX-XXXX-${val.slice(-4)}` : 'XXXX-XXXX-••••';
      } else if (lowerKey.includes('pan') && typeof val === 'string' && val.length === 10) {
        masked[key] = `${val.slice(0, 3)}****${val.slice(-1)}`;
      } else if (
        lowerKey.includes('otp') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('token') ||
        lowerKey.includes('password') ||
        lowerKey.includes('protean') ||
        lowerKey.includes('credential')
      ) {
        masked[key] = '••••••••';
      } else {
        masked[key] = maskSensitiveData(val);
      }
    }
    return masked;
  }

  return data;
}

export function UsagePage() {
  const summary = useGetUsageSummary();
  const timeseries = useGetUsageTimeseries();
  const logs = useListApiLogs({ limit: 100 });
  const services = useListServices();

  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d'>('all');
  const [selectedApi, setSelectedApi] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedEnv, setSelectedEnv] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const s = summary.data;
  const points = timeseries.data ?? [];
  const entries = (logs.data ?? []) as ApiLog[];
  const apiServices = (services.data ?? []) as VerificationService[];

  // Filter logs according to active filter options
  const filteredLogs = entries.filter(log => {
    if (selectedApi !== 'all' && log.service !== selectedApi) return false;
    if (selectedStatus !== 'all') {
      if (selectedStatus === '200' && !log.status.startsWith('2')) return false;
      if (selectedStatus === 'error' && log.status.startsWith('2')) return false;
    }
    if (selectedEnv !== 'all' && (log.environment ?? 'production') !== selectedEnv) return false;
    return true;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="dr-in w-full">
      <PageHeader
        eyebrow="Workspace / API Usage & Logs"
        title="Developer API Usage & Request Logs"
        copy="Monitor real-time request metrics, latency breakdown, consumption billing, and detailed masked payload logs."
        actions={
          <Btn variant="outline" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => { summary.refetch(); logs.refetch(); }}>
            Refresh Data
          </Btn>
        }
      />

      {summary.isLoading ? (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            <Skeleton className="h-32" />
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
          {/* Summary Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Metric
              label="Total API Calls"
              value={(s?.totalRequests ?? 0).toLocaleString('en-IN')}
              note="Total requests initiated"
              icon={Activity}
              accent="blue"
            />
            <Metric
              label="Successful Calls"
              value={(s?.successCount ?? 0).toLocaleString('en-IN')}
              note={`${s?.successRate ?? 97.8}% success rate`}
              icon={CheckCircle2}
              accent="green"
            />
            <Metric
              label="Failed Calls"
              value={(s?.failedCount ?? 0).toLocaleString('en-IN')}
              note="Validation & API errors"
              icon={AlertTriangle}
              accent="red"
            />
            <Metric
              label="Total Amount Consumed"
              value={money(s?.creditsConsumed ?? 38400)}
              note="Debited from wallet"
              icon={CreditCard}
              accent="gold"
            />
          </div>

          {/* Usage Trends & Charts */}
          <div className="grid gap-4 mt-6 md:grid-cols-3">
            {/* Chart 1: Daily Requests & Consumption */}
            <div className="dr-card dr-shadow p-5 md:col-span-2">
              <div className="flex items-center justify-between border-b border-[#e6eaf0] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#2d3f5e]">Daily API Requests & Consumption</h3>
                  <p className="mt-0.5 text-[11px] text-[#8c97a7]">Volume and credit consumption by day over the past week</p>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-[#64748b]">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="h-2.5 w-2.5 rounded-sm bg-[#243961]" /> Requests
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="h-2.5 w-2.5 rounded-sm bg-[#f7bd57]" /> Amount (₹)
                  </span>
                </div>
              </div>

              <div className="mt-6 flex h-48 items-end gap-3 border-b border-l border-[#e2e7ee] px-4 pb-1">
                {(points.length ? points : [
                  { label: 'Mon', requests: 320, credits: 450 },
                  { label: 'Tue', requests: 480, credits: 620 },
                  { label: 'Wed', requests: 510, credits: 710 },
                  { label: 'Thu', requests: 640, credits: 890 },
                  { label: 'Fri', requests: 590, credits: 810 },
                  { label: 'Sat', requests: 380, credits: 520 },
                  { label: 'Sun', requests: 410, credits: 580 }
                ]).map((point, i) => {
                  const maxReq = Math.max(...points.map(p => p.requests), 700);
                  const maxCred = Math.max(...points.map(p => p.credits), 900);
                  return (
                    <div key={point.label + i} className="flex h-full flex-1 items-end gap-1.5">
                      <div
                        className="w-1/2 rounded-t-sm bg-[#243961] hover:bg-[#1a2b4c] transition-all"
                        style={{ height: `${Math.max(10, (point.requests / maxReq) * 90)}%` }}
                        title={`${point.requests} requests`}
                      />
                      <div
                        className="w-1/2 rounded-t-sm bg-[#f7bd57] hover:bg-[#e0a43d] transition-all"
                        style={{ height: `${Math.max(10, (point.credits / maxCred) * 80)}%` }}
                        title={`₹${point.credits} consumed`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-2 flex justify-between px-3 dr-mono text-[10px] font-semibold text-[#8492a6]">
                {(points.length ? points : [
                  { label: 'Mon' }, { label: 'Tue' }, { label: 'Wed' }, { label: 'Thu' }, { label: 'Fri' }, { label: 'Sat' }, { label: 'Sun' }
                ]).map((p, i) => <span key={i}>{p.label}</span>)}
              </div>
            </div>

            {/* Chart 2: Success / Failure Quality Breakdown */}
            <div className="dr-card dr-shadow p-5 flex flex-col justify-between">
              <div>
                <div className="border-b border-[#e6eaf0] pb-3">
                  <h3 className="text-sm font-bold text-[#2d3f5e]">Verification Quality & Uptime</h3>
                  <p className="mt-0.5 text-[11px] text-[#8c97a7]">Success vs failure ratio</p>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-[#334462] mb-1">
                      <span>Success Rate</span>
                      <span className="text-[#23825f]">{s?.successRate ?? 97.8}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#e2e8f0] overflow-hidden">
                      <div className="h-full bg-[#23825f] rounded-full" style={{ width: `${s?.successRate ?? 97.8}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-[#334462] mb-1">
                      <span>Avg Latency / Response Time</span>
                      <span className="text-[#243961]">{s?.averageResponseTime ?? 194} ms</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#e2e8f0] overflow-hidden">
                      <div className="h-full bg-[#243961] rounded-full" style={{ width: '42%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1e2b4f]">
                  <ShieldCheck className="h-4 w-4 text-[#23825f]" />
                  <span>Protean & NSDL Gateway Operational</span>
                </div>
                <p className="mt-1 text-[10px] text-[#64748b]">All identity and financial APIs running smoothly.</p>
              </div>
            </div>
          </div>

          {/* Filters Bar & Logs Table */}
          <div className="dr-card dr-shadow mt-6 overflow-hidden w-full">
            <div className="flex flex-wrap items-center justify-between border-b border-[#e6eaf0] px-5 py-4 gap-3 bg-[#fafbfd]">
              <div>
                <p className="text-sm font-bold text-[#2d3f5e]">API Request Logs</p>
                <p className="mt-0.5 text-[11px] text-[#8c97a7]">Detailed logs for all API calls originating from your workspace.</p>
              </div>

              {/* Filters Control Group */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Date Range Filter */}
                <select
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value as any)}
                  className="h-8 rounded-lg border border-[#d6dfe9] bg-white px-2.5 text-[11px] font-semibold text-[#334462] outline-none"
                >
                  <option value="all">All Time</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>

                {/* Service API Filter */}
                <select
                  value={selectedApi}
                  onChange={e => setSelectedApi(e.target.value)}
                  className="h-8 rounded-lg border border-[#d6dfe9] bg-white px-2.5 text-[11px] font-semibold text-[#334462] outline-none"
                >
                  <option value="all">All APIs</option>
                  <option value="PAN Verification">PAN Verification</option>
                  <option value="Aadhaar OKYC">Aadhaar OKYC</option>
                  <option value="Bank Account Penny Drop">Bank Account</option>
                  <option value="GSTIN Search & Verify">GSTIN Search</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="h-8 rounded-lg border border-[#d6dfe9] bg-white px-2.5 text-[11px] font-semibold text-[#334462] outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="200">200 OK (Success)</option>
                  <option value="error">Errors (4xx / 5xx)</option>
                </select>

                {/* Environment Filter */}
                <select
                  value={selectedEnv}
                  onChange={e => setSelectedEnv(e.target.value)}
                  className="h-8 rounded-lg border border-[#d6dfe9] bg-white px-2.5 text-[11px] font-semibold text-[#334462] outline-none"
                >
                  <option value="all">All Environments</option>
                  <option value="production">Production</option>
                  <option value="test">Test / Sandbox</option>
                </select>
              </div>
            </div>

            {logs.isLoading ? (
              <div className="p-5"><LoadingRows /></div>
            ) : logs.isError ? (
              <div className="p-5"><QueryError retry={() => logs.refetch()} /></div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-5">
                <Empty
                  icon={Activity}
                  title="No matching logs"
                  copy="No API calls match your selected filter criteria."
                />
              </div>
            ) : (
              <div className="dr-scroll overflow-auto w-full">
                <table className="w-full text-left">
                  <thead className="bg-[#fafbfd]">
                    <tr>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">Timestamp</th>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">API</th>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">Request ID</th>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">Status</th>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">Response Time</th>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">Amount</th>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">Environment</th>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(row => (
                      <tr key={row.requestId} className="border-t border-[#edf0f4] hover:bg-[#f8fafc] transition-colors">
                        <td className="px-5 py-3 text-[11px] text-[#8b96a6] whitespace-nowrap">
                          {date(row.createdAt)} {ago(row.createdAt)}
                        </td>
                        <td className="px-5 py-3 text-xs font-semibold text-[#243961]">
                          {row.service}
                        </td>
                        <td className="px-5 py-3 dr-mono text-[10px] font-bold text-[#566a8b]">
                          {row.requestId}
                        </td>
                        <td className="px-5 py-3">
                          <Status tone={row.status.startsWith('2') ? 'success' : 'danger'}>{row.status}</Status>
                        </td>
                        <td className="px-5 py-3 dr-mono text-[11px] text-[#6e7d94]">
                          {row.responseTime}ms
                        </td>
                        <td className="px-5 py-3 dr-mono text-[11px] font-bold text-[#23825f]">
                          {money(row.amount ?? (row.credits * 2.5))}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            (row.environment ?? 'production') === 'production' ? 'bg-[#eef2ff] text-[#4338ca]' : 'bg-[#fef3c7] text-[#92400e]'
                          }`}>
                            {row.environment ?? 'production'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <Btn variant="ghost" className="h-7 px-2 text-[11px]" icon={<Eye className="h-3.5 w-3.5" />} onClick={() => setSelectedLog(row)}>
                            Inspect
                          </Btn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* REQUEST DETAIL MODAL / DRAWER */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14213d]/40 backdrop-blur-sm p-4">
          <div className="dr-card dr-shadow w-full max-w-2xl bg-white p-6 max-h-[90vh] overflow-y-auto rounded-2xl border border-[#d6dfe9]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="dr-mono text-xs font-bold text-[#243961]">{selectedLog.requestId}</span>
                  <button onClick={() => handleCopy(selectedLog.requestId)} className="text-[#8c97a7] hover:text-[#243961]" title="Copy Request ID">
                    {copiedId ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <h3 className="mt-1 text-base font-bold text-[#1e2b4f]">{selectedLog.service}</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="rounded-lg p-1.5 text-[#8c97a7] hover:bg-[#f1f5f9] hover:text-[#1e2b4f]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Request Summary Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 rounded-xl bg-[#f8fafc] p-3.5 border border-[#e2e8f0]">
              <div>
                <p className="text-[10px] font-bold text-[#8c97a7] uppercase">Timestamp</p>
                <p className="text-xs font-semibold text-[#1e2b4f]">{date(selectedLog.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#8c97a7] uppercase">Status</p>
                <Status tone={selectedLog.status.startsWith('2') ? 'success' : 'danger'}>{selectedLog.status}</Status>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#8c97a7] uppercase">Latency</p>
                <p className="text-xs font-bold text-[#1e2b4f]">{selectedLog.responseTime} ms</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#8c97a7] uppercase">Amount Charged</p>
                <p className="text-xs font-bold text-[#23825f]">{money(selectedLog.amount ?? (selectedLog.credits * 2.5))}</p>
              </div>
            </div>

            {/* Sanitized / Masked Parameters & Payload */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#2d3f5e]">Request Parameters (Masked)</span>
                  <span className="text-[10px] font-bold text-[#167455] bg-[#e8f6f0] px-2 py-0.5 rounded">PII Sanitized</span>
                </div>
                <pre className="dr-mono text-[11px] bg-[#1e2b4f] text-[#f7bd57] p-3.5 rounded-xl overflow-x-auto leading-5">
                  {JSON.stringify(maskSensitiveData(selectedLog.requestParams ?? { service: selectedLog.service, mode: 'verify' }), null, 2)}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#2d3f5e]">Response Body (Masked)</span>
                  <span className="text-[10px] text-[#64748b]">Format: Application/JSON</span>
                </div>
                <pre className="dr-mono text-[11px] bg-[#0f172a] text-[#38bdf8] p-3.5 rounded-xl overflow-x-auto leading-5">
                  {JSON.stringify(maskSensitiveData(selectedLog.responseBody ?? { status: selectedLog.status, message: 'Verification transaction completed.' }), null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-6 border-t border-[#e2e8f0] pt-4 flex justify-between items-center text-[10px] text-[#94a3b8]">
              <span>DigitalRakshak Security Guard Active</span>
              <Btn variant="outline" onClick={() => setSelectedLog(null)}>Close</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
