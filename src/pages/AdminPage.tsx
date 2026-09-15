import React from 'react';
import { Activity, AlertTriangle, CheckCircle2, RefreshCw, TrendingUp } from 'lucide-react';
import { useGetDashboardSummary, useGetDashboardActivity } from '@workspace/api-client-react';
import type { ActivityItem } from '@workspace/api-client-react';
import {
  AppShell, Btn, Metric, PageHeader, Skeleton, Status, ago, money
} from '@/components/common';

export function AdminPage() {
  const summary = useGetDashboardSummary();
  const activity = useGetDashboardActivity();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Admin / Operations"
        title="Operations overview."
        copy="A concise read on platform health, request quality and workspace activity."
        actions={
          <Btn variant="outline" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => { summary.refetch(); activity.refetch(); }}>
            Refresh
          </Btn>
        }
      />

      {summary.isLoading ? (
        <div className="grid gap-3 md:grid-cols-4 font-semibold">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <Metric label="Requests today" value={(summary.data?.totalRequests ?? 0).toLocaleString('en-IN')} note="Across all workspaces" icon={Activity} />
            <Metric label="Success rate" value={`${summary.data?.successRate ?? 0}%`} note="Platform average" icon={CheckCircle2} accent="green" />
            <Metric label="Revenue tracked" value={money(summary.data?.totalSpent)} note="Gross credits consumed" icon={TrendingUp} accent="gold" />
            <Metric label="Failure queue" value={(summary.data?.failedRequests ?? 0).toLocaleString('en-IN')} note="Requires review" icon={AlertTriangle} accent="red" />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
            <div className="dr-card dr-shadow p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#2d3f5e]">Platform controls</p>
                  <p className="mt-1 text-[11px] text-[#8c97a7]">Live operational surfaces</p>
                </div>
                <Status tone="success">Operational</Status>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ['API gateway', '99.98% uptime', 'healthy'],
                  ['PAN provider', '47ms median', 'healthy'],
                  ['Webhook delivery', '98.7% delivered', 'watch'],
                  ['Billing ledger', 'No discrepancies', 'healthy']
                ].map(([a, b, c]) => (
                  <div key={a} className="rounded-lg border border-[#e4e9ef] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#495a75]">{a}</p>
                      <span className={`h-2 w-2 rounded-full ${c === 'watch' ? 'bg-[#efb84f]' : 'bg-[#48b986]'}`} />
                    </div>
                    <p className="mt-3 dr-mono text-[11px] text-[#7d8a9e]">{b}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="dr-card dr-shadow p-5">
              <p className="text-sm font-bold text-[#2d3f5e]">Latest admin events</p>
              <div className="mt-4">
                {(activity.data ?? []).slice(0, 6).map((item: ActivityItem, i: number) => (
                  <ActivityRow item={item} key={item.id ?? i} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const Icon = item.tone === 'success' ? CheckCircle2 : item.tone === 'warning' ? AlertTriangle : Activity;
  return (
    <div className="flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-[#f7f9fb]">
      <div className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${item.tone === 'success' ? 'bg-[#e7f5ee] text-[#258360]' : item.tone === 'warning' ? 'bg-[#fff4dc] text-[#b27a17]' : 'bg-[#eaf0f8] text-[#49668f]'}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold text-[#40516f]">{item.title}</p>
        <p className="truncate text-[10px] text-[#8b96a6]">{item.description}</p>
      </div>
      <span className="shrink-0 text-[9px] text-[#a0a9b5]">{ago(item.timestamp)}</span>
    </div>
  );
}
