import React, { useState } from 'react';
import {
  ArrowDownLeft, ArrowUpRight, CreditCard, Plus, Receipt, ShieldCheck,
  Zap, Filter, RefreshCw, Layers, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetWalletQueryKey, getListWalletTransactionsQueryKey,
  useCreateTopup, useVerifyTopup, useGetWallet, useListWalletTransactions,
  useListServices
} from '@workspace/api-client-react';
import type { WalletTransaction, VerificationService } from '@workspace/api-client-react';
import {
  Btn, Empty, LoadingRows, Metric, PageHeader, QueryError, Skeleton, Status, date, money
} from '@/components/common';

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface WalletPageProps {
  tab?: 'wallet' | 'billing' | 'transactions';
}

export function WalletPage({ tab = 'wallet' }: WalletPageProps) {
  const wallet = useGetWallet();
  const transactions = useListWalletTransactions({ limit: 50 });
  const services = useListServices();
  const topup = useCreateTopup();
  const verifyTopup = useVerifyTopup();
  const client = useQueryClient();

  const [amount, setAmount] = useState('1000');
  const [showTopup, setShowTopup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit' | 'refund' | 'adjustment'>('all');

  const w = wallet.data;
  const rawRows = (transactions.data ?? []) as WalletTransaction[];
  const apiServices = (services.data ?? []) as VerificationService[];

  // Filter transactions based on active filter tab
  const rows = rawRows.filter(row => {
    if (filterType === 'all') return true;
    if (filterType === 'credit') return row.type === 'credit' && !row.description.toLowerCase().includes('refund') && !row.description.toLowerCase().includes('adjustment');
    if (filterType === 'debit') return row.type === 'debit';
    if (filterType === 'refund') return row.description.toLowerCase().includes('refund');
    if (filterType === 'adjustment') return row.description.toLowerCase().includes('adjustment');
    return true;
  });

  const submitTopup = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 10) {
      alert('Please enter a valid amount (minimum ₹10).');
      return;
    }
    setIsProcessing(true);

    topup.mutate(
      { data: { amount: numAmount } },
      {
        onSuccess: async (res: any) => {
          if (res?.razorpay_order_id && res?.key) {
            const scriptLoaded = await loadRazorpayScript();
            if (scriptLoaded && (window as any).Razorpay) {
              const options = {
                key: res.key,
                amount: res.amount_in_paise || numAmount * 100,
                currency: res.currency || 'INR',
                name: res.company_name || 'DigitalRakshak API Platform',
                description: `Wallet Top-up (${res.reference || 'Credit'})`,
                order_id: res.razorpay_order_id,
                handler: (response: any) => {
                  verifyTopup.mutate(
                    {
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                      reference: res.reference
                    },
                    {
                      onSuccess: () => {
                        setShowTopup(false);
                        setIsProcessing(false);
                        client.invalidateQueries({ queryKey: getGetWalletQueryKey() });
                        client.invalidateQueries({ queryKey: getListWalletTransactionsQueryKey({ limit: 50 }) });
                      },
                      onError: (err: any) => {
                        alert(err.message || 'Top-up signature verification failed.');
                        setIsProcessing(false);
                      }
                    }
                  );
                },
                modal: {
                  ondismiss: () => {
                    setIsProcessing(false);
                  }
                }
              };
              const rzp = new (window as any).Razorpay(options);
              rzp.open();
              return;
            }
          }

          // Fallback or demo completion
          setShowTopup(false);
          setIsProcessing(false);
          client.invalidateQueries({ queryKey: getGetWalletQueryKey() });
          client.invalidateQueries({ queryKey: getListWalletTransactionsQueryKey({ limit: 50 }) });
        },
        onError: (err: any) => {
          alert(err.message || 'Could not initiate Razorpay top-up order.');
          setIsProcessing(false);
        }
      }
    );
  };

  const getBreadcrumbLabel = () => {
    if (tab === 'billing') return 'Billing & Rates';
    if (tab === 'transactions') return 'Transaction History';
    return 'Wallet Summary';
  };

  return (
    <div className="dr-in w-full">
      <PageHeader
        eyebrow={`Workspace / ${getBreadcrumbLabel()}`}
        title="Wallet & Financial Billing"
        copy="Authoritative backend ledger for DigitalRakshak.io API verification credits, usage billing, top-ups and refunds."
        actions={
          <div className="flex items-center gap-2">
            <Btn variant="outline" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => {
              wallet.refetch();
              transactions.refetch();
              services.refetch();
            }}>
              Refresh
            </Btn>
            <Btn icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowTopup(v => !v)}>
              Add Money
            </Btn>
          </div>
        }
      />

      {/* Top-up Drawer / Form */}
      {showTopup && (
        <div className="dr-card dr-shadow mb-6 border-2 border-[#243961]/30 bg-[#fbfcfd] p-6 transition-all">
          <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-[#243961] text-[#f7bd57]">
                <Plus className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1e2b4f]">Add Money to API Wallet</h3>
                <p className="text-[11px] text-[#64748b]">Instant credit via Razorpay. Backend authoritative signature verification.</p>
              </div>
            </div>
            <button onClick={() => setShowTopup(false)} className="text-[#94a3b8] hover:text-[#1e2b4f]">✕</button>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <label className="w-full sm:w-64">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#53627a]">Enter Amount (INR)</span>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-[#8c98a8]">₹</span>
                <input
                  type="number"
                  min="10"
                  step="100"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  data-testid="input-topup-amount"
                  className="h-10 w-full rounded-lg border border-[#d6dfe9] bg-white pl-7 pr-3 text-sm font-bold text-[#1e2b4f] outline-none focus:border-[#243961] focus:ring-1 focus:ring-[#243961]"
                />
              </div>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <Btn variant="soft" onClick={() => setAmount('500')}>₹500</Btn>
              <Btn variant="soft" onClick={() => setAmount('1000')}>₹1,000</Btn>
              <Btn variant="soft" onClick={() => setAmount('2500')}>₹2,500</Btn>
              <Btn variant="outline" onClick={() => setAmount('5000')}>₹5,000</Btn>
              <Btn variant="outline" onClick={() => setAmount('10000')}>₹10,000</Btn>
              
              <Btn onClick={submitTopup} disabled={topup.isPending || isProcessing} className="bg-[#243961] text-white hover:bg-[#1c2e51] px-5">
                {topup.isPending || isProcessing ? 'Connecting to Razorpay…' : 'Continue to Payment'}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {wallet.isLoading ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </div>
          <Skeleton className="mt-6 h-80" />
        </>
      ) : wallet.isError ? (
        <QueryError retry={() => wallet.refetch()} />
      ) : (
        <>
          {/* Main Wallet & Financial Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Authoritative Current Balance Card */}
            <div className="dr-card dr-shadow relative overflow-hidden bg-gradient-to-br from-[#1e2b4f] to-[#243961] p-6 text-white">
              <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full border-[22px] border-[#f7bd57]/20" />
              <div className="flex items-center justify-between">
                <p className="dr-label text-[#a9bad5]">Current Balance</p>
                <span className="rounded-md bg-[#f7bd57]/20 px-2 py-0.5 text-[10px] font-bold text-[#f7bd57]">
                  Backend Authoritative
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-[-.05em]" data-testid="text-wallet-balance">
                {money(w?.balance)}
              </p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#b3c3dd]">
                <span>Threshold: {money(w?.lowBalanceThreshold ?? 2000)}</span>
                {w?.balance && w.balance < (w?.lowBalanceThreshold ?? 2000) ? (
                  <span className="flex items-center gap-1 font-semibold text-[#f87171]">
                    <AlertCircle className="h-3.5 w-3.5" /> Low Balance
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-semibold text-[#4ade80]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => setShowTopup(true)}
                  className="text-xs font-bold text-[#f7bd57] hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Money Now
                </button>
                <span className="text-[10px] text-[#8fa2c4]">Currency: {w?.currency ?? 'INR'}</span>
              </div>
            </div>

            <Metric
              label="Total Top-ups"
              value={money(w?.totalPurchased)}
              note="Lifetime credits added"
              icon={ArrowDownLeft}
              accent="green"
            />
            <Metric
              label="API Usage Charges"
              value={money(w?.totalSpent)}
              note="Total debits for API calls"
              icon={ArrowUpRight}
              accent="red"
            />
          </div>

          {/* API Consumption Rates Section (Configured by Backend) */}
          <div className="dr-card dr-shadow mt-6 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6eaf0] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#2d3f5e] flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#e0a43d]" />
                  API Usage Charges & Pricing Rates
                </h3>
                <p className="mt-0.5 text-[11px] text-[#8c97a7]">
                  Backend-configured per-verification deduction rates for your account workspace.
                </p>
              </div>
              <span className="dr-label text-[#8793a4] text-[10px]">
                Live Rate Card
              </span>
            </div>

            {services.isLoading ? (
              <div className="py-4"><LoadingRows count={2} /></div>
            ) : apiServices.length === 0 ? (
              <div className="py-4 text-xs text-[#64748b]">No active pricing rates returned from backend.</div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {apiServices.map((svc) => (
                  <div key={svc.slug} className="rounded-xl border border-[#e2e8f0] bg-[#fafbfd] p-3.5 hover:border-[#b4c0d2] transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="dr-label text-[#b68429] text-[9px]">{svc.category}</span>
                      <Status tone={svc.status === 'active' ? 'success' : 'neutral'}>{svc.status}</Status>
                    </div>
                    <p className="mt-2 text-xs font-bold text-[#1e2b4f] truncate">{svc.name}</p>
                    <div className="mt-2 flex items-baseline justify-between border-t border-[#edf0f4] pt-2">
                      <span className="text-[10px] text-[#78879c]">Per-check rate</span>
                      <span className="dr-mono text-sm font-bold text-[#243961]">{money(svc.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wallet Ledger & Transaction Log */}
          <div className="dr-card dr-shadow mt-6 overflow-hidden w-full">
            <div className="flex flex-wrap items-center justify-between border-b border-[#e6eaf0] px-5 py-4 gap-3">
              <div>
                <p className="text-sm font-bold text-[#2d3f5e]">Wallet Financial Ledger</p>
                <p className="mt-0.5 text-[11px] text-[#8c97a7]">
                  All debits, top-up credits, refunds and admin adjustments.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#e0e5ec] bg-[#f8fafc] p-1">
                <button
                  onClick={() => setFilterType('all')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    filterType === 'all' ? 'bg-[#243961] text-white shadow-sm' : 'text-[#64748b] hover:text-[#1e2b4f]'
                  }`}
                >
                  All ({rawRows.length})
                </button>
                <button
                  onClick={() => setFilterType('debit')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    filterType === 'debit' ? 'bg-[#243961] text-white shadow-sm' : 'text-[#64748b] hover:text-[#1e2b4f]'
                  }`}
                >
                  API Usage Charges
                </button>
                <button
                  onClick={() => setFilterType('credit')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    filterType === 'credit' ? 'bg-[#243961] text-white shadow-sm' : 'text-[#64748b] hover:text-[#1e2b4f]'
                  }`}
                >
                  Top-ups & Credits
                </button>
                <button
                  onClick={() => setFilterType('refund')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    filterType === 'refund' ? 'bg-[#243961] text-white shadow-sm' : 'text-[#64748b] hover:text-[#1e2b4f]'
                  }`}
                >
                  Refunds
                </button>
                <button
                  onClick={() => setFilterType('adjustment')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    filterType === 'adjustment' ? 'bg-[#243961] text-white shadow-sm' : 'text-[#64748b] hover:text-[#1e2b4f]'
                  }`}
                >
                  Adjustments
                </button>
              </div>
            </div>

            {transactions.isLoading ? (
              <div className="p-5"><LoadingRows count={5} /></div>
            ) : transactions.isError ? (
              <div className="p-5"><QueryError retry={() => transactions.refetch()} /></div>
            ) : rows.length === 0 ? (
              <div className="p-5">
                <Empty
                  icon={CreditCard}
                  title="No transactions found"
                  copy={
                    filterType === 'all'
                      ? "Your wallet financial history will appear here after API usage or top-ups."
                      : `No transactions matching filter "${filterType}".`
                  }
                />
              </div>
            ) : (
              <div className="dr-scroll overflow-auto w-full">
                <table className="w-full text-left">
                  <thead className="bg-[#fafbfd]">
                    <tr>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">Date</th>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">Reference</th>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">API / Description</th>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">Credit</th>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">Debit</th>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">Balance</th>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => (
                      <tr key={row.id} className="border-t border-[#edf0f4] hover:bg-[#fcfdfe]">
                        <td className="px-5 py-3 text-[11px] text-[#7e8a9c] whitespace-nowrap">
                          {date(row.createdAt || row.date)}
                        </td>
                        <td className="px-5 py-3 dr-mono text-[10px] text-[#7e8a9c] whitespace-nowrap">
                          {row.reference ?? '—'}
                        </td>
                        <td className="px-5 py-3 text-xs font-semibold text-[#334462]">
                          {row.description}
                        </td>
                        <td className="px-5 py-3 dr-mono text-xs font-bold text-[#23825f] whitespace-nowrap">
                          {row.type === 'credit' ? `+${money(Math.abs(row.amount))}` : '—'}
                        </td>
                        <td className="px-5 py-3 dr-mono text-xs font-bold text-[#bd554b] whitespace-nowrap">
                          {row.type === 'debit' ? `-${money(Math.abs(row.amount))}` : '—'}
                        </td>
                        <td className="px-5 py-3 dr-mono text-[11px] font-semibold text-[#546580] whitespace-nowrap">
                          {money(row.balanceAfter ?? row.balance)}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <Status tone={row.status === 'completed' ? 'success' : row.status === 'pending' ? 'warning' : 'danger'}>
                            {row.status}
                          </Status>
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
    </div>
  );
}
