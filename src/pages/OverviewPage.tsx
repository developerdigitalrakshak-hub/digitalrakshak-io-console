import React from 'react';
import {
  Activity, AlertTriangle, BookOpen, Check, CheckCircle2,
  KeyRound, Plus, TrendingUp, WalletCards
} from 'lucide-react';
import { Link } from 'wouter';
import { useGetDashboardSummary, useGetDashboardActivity } from '@workspace/api-client-react';
import type { ActivityItem } from '@workspace/api-client-react';
import {
  Btn, Empty, Metric, PageHeader, QueryError, Skeleton, ago, money
} from '@/components/common';

export function OverviewPage() {
  const summary = useGetDashboardSummary();
  const activity = useGetDashboardActivity();

  if (summary.isLoading || activity.isLoading) {
    return (
      <>
        <PageHeader eyebrow="Workspace / Overview" title="Good morning, Aster & Co." copy="A clear view of your verification operation." />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
        <Skeleton className="mt-5 h-72" />
      </>
    );
  }

  if (summary.isError) return <QueryError retry={() => summary.refetch()} />;

  const s = summary.data;
  const events = (activity.data ?? []) as ActivityItem[];

  return (
    <div className="dr-in w-full">
      <PageHeader
        eyebrow="Workspace / Overview"
        title="Good morning, Aster & Co."
        copy="A clear view of your verification operation."
        actions={
          <>
            <Btn variant="outline" icon={<BookOpen className="h-3.5 w-3.5" />} onClick={() => window.location.href = '/dashboard/docs'}>
              View docs
            </Btn>
            <Btn icon={<Plus className="h-3.5 w-3.5" />} onClick={() => window.location.href = '/dashboard/keys'}>
              Create API key
            </Btn>
          </>
        }
      />

      {s?.lowBalance && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-[#efd59a] bg-[#fff9e9] px-4 py-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-[#ba831e]" />
            <div>
              <p className="text-xs font-bold text-[#7c5e20]">Wallet balance is running low</p>
              <p className="text-[11px] text-[#9f8247]">Top up before your production checks are interrupted.</p>
            </div>
          </div>
          <Btn variant="soft" onClick={() => window.location.href = '/dashboard/wallet'}>Top up wallet</Btn>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Wallet balance" value={money(s?.walletBalance)} note="Available credits" icon={WalletCards} accent="gold" />
        <Metric label="Total requests" value={(s?.totalRequests ?? 0).toLocaleString('en-IN')} note="All-time volume" icon={Activity} trend="+12.8%" />
        <Metric label="Success rate" value={`${s?.successRate ?? 0}%`} note={`${(s?.successfulRequests ?? 0).toLocaleString('en-IN')} successful checks`} icon={CheckCircle2} accent="green" />
        <Metric label="Current month" value={money(s?.currentMonthUsage)} note="Usage this month" icon={TrendingUp} trend="+8.4%" accent="blue" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <div className="dr-card dr-shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#2c3e5e]">Verification pulse</p>
              <p className="mt-1 text-[11px] text-[#8a96a8]">Requests across your workspace</p>
            </div>
            <span className="rounded-md bg-[#eef4fb] px-2 py-1 dr-mono text-[9px] text-[#56709c]">LAST 30 DAYS</span>
          </div>

          <div className="mt-7 flex h-52 items-end gap-2 border-b border-l border-[#e2e7ee] px-3 pb-0 pt-5">
            {[38, 46, 44, 57, 49, 64, 71, 58, 76, 67, 84, 71, 91, 87, 94, 82, 96, 89, 100, 92, 96, 90].map((n, i) => (
              <div
                key={i}
                className="group relative flex-1 rounded-t-sm bg-[#6c86b1] transition-all hover:bg-[#f0bd57]"
                style={{ height: `${n}%` }}
              >
                <span className="absolute -top-5 left-1/2 hidden -translate-x-1/2 text-[9px] text-[#64718a] group-hover:block font-bold">
                  {Math.round(n * 2.1)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-between dr-mono text-[9px] text-[#a1aab7]">
            <span>01 MAY</span>
            <span>08 MAY</span>
            <span>15 MAY</span>
            <span>22 MAY</span>
            <span>30 MAY</span>
          </div>
        </div>

        <div className="dr-card dr-shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#2c3e5e]">Recent activity</p>
              <p className="mt-1 text-[11px] text-[#8a96a8]">Latest workspace events</p>
            </div>
            <Link href="/dashboard/requests" className="text-[11px] font-bold text-[#4b6591]">View all</Link>
          </div>

          <div className="mt-4 space-y-1">
            {events.length === 0 ? (
              <Empty icon={Activity} title="No activity yet" copy="Events will show up as your team starts verifying." />
            ) : (
              events.slice(0, 5).map((item, i) => <ActivityRow item={item} key={item.id ?? i} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const Icon = item.tone === 'success' ? Check : item.tone === 'warning' ? AlertTriangle : item.type === 'key' ? KeyRound : Activity;
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
