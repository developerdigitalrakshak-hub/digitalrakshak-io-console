import React from 'react';
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, BookOpen, Boxes,
  Check, CheckCircle2, CreditCard, ExternalLink, FileCheck2, KeyRound,
  Plus, ShieldCheck, TrendingUp, WalletCards, Webhook as WebhookIcon, XCircle
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useGetDashboardSummary, useGetDashboardActivity, useGetWallet, useListVerificationRequests } from '@workspace/api-client-react';
import type { ActivityItem, VerificationRequest } from '@workspace/api-client-react';
import {
  Btn, Empty, Metric, PageHeader, QueryError, Skeleton, Status, ago, date, money
} from '@/components/common';

export function OverviewPage() {
  const [, setLocation] = useLocation();
  const summary = useGetDashboardSummary();
  const walletQuery = useGetWallet();
  const activity = useGetDashboardActivity();
  const requests = useListVerificationRequests({ limit: 10 });

  if (summary.isLoading || walletQuery.isLoading || activity.isLoading) {
    return (
      <div className="space-y-6 w-full">
        <PageHeader
          eyebrow="Developer Console / Dashboard"
          title="Welcome back, Aster & Co."
          copy="Manage your DigitalRakshak APIs, credentials, wallet and API usage."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (summary.isError) return <QueryError retry={() => summary.refetch()} />;

  const s = summary.data;
  const walletData = walletQuery.data;
  const currentBalance = (walletData?.balance ?? s?.walletBalance ?? 0) as number;
  const lowBalanceThreshold = walletData?.lowBalanceThreshold ?? 2000;
  const isLowBalance = currentBalance < lowBalanceThreshold;
  const events = (activity.data ?? []) as ActivityItem[];
  const reqList = (requests.data ?? []) as VerificationRequest[];

  return (
    <div className="dr-in w-full space-y-6">
      {/* 1. Welcome Header */}
      <PageHeader
        breadcrumbs={[{ label: 'Developer Console', href: '/dashboard' }, { label: 'Overview' }]}
        title="Welcome back, Aster & Co."
        copy="Manage your DigitalRakshak APIs, credentials, wallet and API usage."
        actions={
          <div className="flex items-center gap-2">
            <Btn variant="outline" icon={<BookOpen className="h-3.5 w-3.5" />} onClick={() => setLocation('/dashboard/docs')}>
              API Documentation
            </Btn>
            <Btn variant="primary" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setLocation('/dashboard/keys')}>
              Create API Key
            </Btn>
          </div>
        }
      />

      {/* 2. Low Balance Warning Alert Banner */}
      {isLowBalance && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#efd59a] bg-[#fff9e9] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#fff0d0] text-[#b57d18]">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#7c5e20]">Wallet balance is running low ({money(currentBalance)})</p>
              <p className="text-[11px] text-[#9f8247]">Top up your wallet balance to ensure uninterrupted API verification requests.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="soft" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setLocation('/dashboard/wallet')}>
              Add Money to Wallet
            </Btn>
          </div>
        </div>
      )}

      {/* 3. Metrics Grid: Wallet Balance & API Usage */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Wallet Balance Card */}
        <div className="dr-card dr-shadow p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#fff3d5] text-[#b57d18]">
              <WalletCards className="h-4.5 w-4.5" />
            </div>
            <Status tone={isLowBalance ? 'warning' : 'success'}>
              {isLowBalance ? 'Low Balance' : 'Active'}
            </Status>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-semibold text-[#7c899c]">Wallet Balance (INR)</p>
            <p className="mt-1 text-[24px] font-bold tracking-[-.04em] text-[#283956]" data-testid="metric-wallet-balance">
              {money(currentBalance)}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[#edf0f4] pt-3 text-[11px]">
            <button
              type="button"
              onClick={() => setLocation('/dashboard/wallet')}
              className="font-bold text-[#b68429] hover:underline"
            >
              + Add Money
            </button>
            <button
              type="button"
              onClick={() => setLocation('/dashboard/wallet')}
              className="text-[#65758e] hover:text-[#243961]"
            >
              View Transactions →
            </button>
          </div>
        </div>

        {/* API Calls Today */}
        <Metric
          label="API Calls Today"
          value={(1248).toLocaleString('en-IN')}
          note="Live requests today"
          icon={Activity}
          trend="+14.2%"
          accent="blue"
        />

        {/* API Calls This Month */}
        <Metric
          label="API Calls This Month"
          value={(s?.currentMonthUsage ?? 38400).toLocaleString('en-IN')}
          note="Usage in current billing cycle"
          icon={TrendingUp}
          trend="+8.4%"
          accent="blue"
        />

        {/* Success Rate & Failed Requests */}
        <Metric
          label="Success Rate"
          value={`${s?.successRate ?? 97.8}%`}
          note={`${(s?.successfulRequests ?? 24344).toLocaleString('en-IN')} success / ${(s?.failedRequests ?? 548).toLocaleString('en-IN')} failed`}
          icon={CheckCircle2}
          accent="green"
        />
      </div>

      {/* 4. Quick Actions */}
      <div className="dr-card dr-shadow p-5">
        <p className="dr-label mb-3 text-[#8896b0]">Quick Actions</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            { label: 'Explore APIs', icon: Boxes, href: '/dashboard/services', color: 'bg-[#eaf0f8] text-[#3d5985]' },
            { label: 'API Documentation', icon: BookOpen, href: '/dashboard/docs', color: 'bg-[#fff3d6] text-[#b57d18]' },
            { label: 'Create API Key', icon: KeyRound, href: '/dashboard/keys', color: 'bg-[#e7f5ee] text-[#28845f]' },
            { label: 'Add Money', icon: WalletCards, href: '/dashboard/wallet', color: 'bg-[#fff0ee] text-[#bd443b]' },
            { label: 'View Usage', icon: BarChart3, href: '/dashboard/usage', color: 'bg-[#edf2fa] text-[#42618d]' },
            { label: 'Manage Webhooks', icon: WebhookIcon, href: '/dashboard/webhooks', color: 'bg-[#f4efe8] text-[#8c672b]' },
          ].map(action => (
            <button
              key={action.label}
              onClick={() => setLocation(action.href)}
              className="group flex flex-col items-start rounded-xl border border-[#e2e8f0] bg-[#fafbfd] p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-[#243961] hover:bg-white hover:shadow-md"
            >
              <div className={`grid h-8 w-8 place-items-center rounded-lg ${action.color}`}>
                <action.icon className="h-4 w-4" />
              </div>
              <span className="mt-3 text-xs font-bold text-[#2d3f5e] group-hover:text-[#243961]">{action.label}</span>
              <span className="mt-0.5 text-[10px] text-[#8a96a8]">Open surface →</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Main Content Layout: API Status Summary & Recent Activity */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        {/* Left Column: API Status Summary & Pulse */}
        <div className="space-y-6">
          {/* API Catalog Status Summary */}
          <div className="dr-card dr-shadow p-5">
            <div className="flex items-center justify-between border-b border-[#edf0f4] pb-3.5">
              <div>
                <p className="text-sm font-bold text-[#2c3e5e]">API Status Summary</p>
                <p className="mt-0.5 text-[11px] text-[#8a96a8]">Available verification APIs & health status</p>
              </div>
              <Link href="/dashboard/services" className="text-[11px] font-bold text-[#b68429] hover:underline">
                View catalog →
              </Link>
            </div>

            <div className="mt-3 divide-y divide-[#edf0f4]">
              {[
                { name: 'PAN Card Verification (Protean)', code: 'POST /api/v1/client/protean/pan-verify', price: 2.50, status: 'active', category: 'Identity' },
                { name: 'Aadhaar Silent Verification', code: 'POST /api/v1/client/protean/silent-verify', price: 3.00, status: 'active', category: 'Identity' },
                { name: 'Bank Account Penny Drop', code: 'POST /api/v1/client/protean/bank-verify', price: 1.50, status: 'active', category: 'Financial' },
                { name: 'EPFO UAN Verification', code: 'POST /api/v1/client/protean/epf-uan', price: 5.00, status: 'active', category: 'Employment' },
                { name: 'Shop & Establishment OCR', code: 'POST /api/v1/client/protean/shop-estab', price: 4.00, status: 'active', category: 'Business' },
              ].map(api => (
                <div key={api.code} className="flex flex-wrap items-center justify-between py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#2d3f5e]">{api.name}</span>
                      <span className="rounded bg-[#f0f4fa] px-1.5 py-0.5 dr-mono text-[9px] font-bold text-[#56709c]">{api.category}</span>
                    </div>
                    <code className="mt-1 block dr-mono text-[10px] text-[#718096]">{api.code}</code>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="dr-mono text-[10px] font-bold text-[#425470]">{money(api.price)} / call</span>
                    <Status tone="success">{api.status}</Status>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Request Throughput Pulse */}
          <div className="dr-card dr-shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#2c3e5e]">Verification Request Pulse</p>
                <p className="mt-1 text-[11px] text-[#8a96a8]">Daily request volume throughput across your API keys</p>
              </div>
              <span className="rounded-md bg-[#eef4fb] px-2 py-1 dr-mono text-[9px] text-[#56709c]">30 DAYS</span>
            </div>

            <div className="mt-6 flex h-44 items-end gap-1.5 border-b border-l border-[#e2e7ee] px-2 pb-0 pt-4">
              {[38, 46, 44, 57, 49, 64, 71, 58, 76, 67, 84, 71, 91, 87, 94, 82, 96, 89, 100, 92, 96, 90].map((n, i) => (
                <div
                  key={i}
                  className="group relative flex-1 rounded-t-sm bg-[#3a5482] transition-all hover:bg-[#f7bd57]"
                  style={{ height: `${n}%` }}
                >
                  <span className="absolute -top-5 left-1/2 hidden -translate-x-1/2 text-[9px] font-bold text-[#243961] group-hover:block">
                    {Math.round(n * 2.1)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between dr-mono text-[9px] text-[#a1aab7]">
              <span>DAY 1</span>
              <span>DAY 10</span>
              <span>DAY 20</span>
              <span>DAY 30</span>
            </div>
          </div>
        </div>

        {/* Right Column: Recent API Activity Table */}
        <div className="dr-card dr-shadow p-5">
          <div className="flex items-center justify-between border-b border-[#edf0f4] pb-3">
            <div>
              <p className="text-sm font-bold text-[#2c3e5e]">Recent API Activity</p>
              <p className="mt-0.5 text-[11px] text-[#8a96a8]">Latest API verification request logs</p>
            </div>
            <Link href="/dashboard/requests" className="text-[11px] font-bold text-[#243961] hover:underline">
              View all →
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            {reqList.length === 0 ? (
              <Empty icon={Activity} title="No API requests yet" copy="When your integration sends requests, live activity logs will appear here." />
            ) : (
              reqList.slice(0, 6).map((req, idx) => (
                <div key={req.requestId || idx} className="rounded-lg border border-[#edf0f4] bg-[#fafbfd] p-3 transition-colors hover:bg-white hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="dr-mono text-[10px] font-bold text-[#243961]">{req.requestId || `REQ-${1000 + idx}`}</span>
                    <Status tone={req.status === 'verified' || req.status === 'success' ? 'success' : 'danger'}>
                      {req.status}
                    </Status>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-[#3a4c6a]">{req.service}</p>
                  <div className="mt-2 flex items-center justify-between dr-mono text-[10px] text-[#818e9f]">
                    <span>{date(req.createdAt)}</span>
                    <span className="text-[#3b5984] font-semibold">{money(req.amount)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
