import React, { useState } from 'react';
import {
  ArrowDownLeft, ArrowUpRight, CreditCard, Plus, Receipt, ShieldCheck,
  Zap, Filter, RefreshCw, Layers, CheckCircle2, AlertCircle, X
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
            <Btn variant="primary" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowTopup(v => !v)}>
              Add Money
            </Btn>
          </div>
        }
      />

      {/* Top-up Drawer / Form Modal */}
      {showTopup && (
        <div className="dr-card dr-shadow mb-6 border border-[#2a85ff]/30 bg-white p-6 transition-all rounded-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-[#2a85ff]">
                <Plus className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Add Money to API Wallet</h3>
                <p className="text-xs text-gray-500">Instant credit via Razorpay with backend authoritative signature verification.</p>
              </div>
            </div>
            <button onClick={() => setShowTopup(false)} className="text-gray-400 hover:text-gray-900 p-1 rounded-lg">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <label className="w-full sm:w-64">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">Enter Amount (INR)</span>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  min="10"
                  step="100"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  data-testid="input-topup-amount"
                  className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-8 pr-3 text-sm font-bold text-gray-900 outline-none focus:border-[#2a85ff] focus:ring-1 focus:ring-[#2a85ff]"
                />
              </div>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <Btn variant="soft" onClick={() => setAmount('500')}>₹500</Btn>
              <Btn variant="soft" onClick={() => setAmount('1000')}>₹1,000</Btn>
              <Btn variant="soft" onClick={() => setAmount('2500')}>₹2,500</Btn>
              <Btn variant="outline" onClick={() => setAmount('5000')}>₹5,000</Btn>
              <Btn variant="outline" onClick={() => setAmount('10000')}>₹10,000</Btn>
              
              <Btn onClick={submitTopup} disabled={topup.isPending || isProcessing} variant="primary" className="px-5">
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
            <div className="dr-card dr-shadow relative overflow-hidden bg-white border border-gray-200 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <p className="dr-label text-[#2a85ff] font-bold">Current Balance</p>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#2a85ff] border border-blue-100">
                  Backend Authoritative
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900" data-testid="text-wallet-balance">
                {money(w?.balance)}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500 font-medium">
                <span>Threshold: {money(w?.lowBalanceThreshold ?? 2000)}</span>
                {w?.balance && w.balance < (w?.lowBalanceThreshold ?? 2000) ? (
                  <span className="flex items-center gap-1 font-bold text-amber-600">
                    <AlertCircle className="h-3.5 w-3.5" /> Low Balance
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-bold text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setShowTopup(true)}
                  className="text-xs font-bold text-[#2a85ff] hover:text-[#0069f6] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Money Now
                </button>
                <span className="text-[10px] text-gray-400 font-medium">Currency: {w?.currency ?? 'INR'}</span>
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

          {/* API Consumption Rates Section */}
          <div className="dr-card dr-shadow mt-6 p-6 bg-white border border-gray-200 rounded-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#2a85ff]" />
                  API Usage Charges & Pricing Rates
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Backend-configured per-verification deduction rates for your account workspace.
                </p>
              </div>
              <span className="rounded-lg bg-gray-100 px-2.5 py-1 dr-mono text-[10px] font-semibold text-gray-600">
                Live Rate Card
              </span>
            </div>

            {services.isLoading ? (
              <div className="py-4"><LoadingRows count={2} /></div>
            ) : apiServices.length === 0 ? (
              <div className="py-4 text-xs text-gray-500">No active pricing rates returned from backend.</div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {apiServices.map((svc) => (
                  <div key={svc.slug} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 hover:bg-white hover:border-[#2a85ff] transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="dr-label text-[#2a85ff] text-[9px] font-bold">{svc.category}</span>
                      <Status tone={svc.status === 'active' ? 'success' : 'neutral'}>{svc.status}</Status>
                    </div>
                    <p className="mt-2 text-xs font-bold text-gray-900 truncate">{svc.name}</p>
                    <div className="mt-2 flex items-baseline justify-between border-t border-gray-100 pt-2">
                      <span className="text-[10px] text-gray-400 font-medium">Per-check rate</span>
                      <span className="dr-mono text-sm font-bold text-[#2a85ff]">{money(svc.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wallet Ledger & Transaction Log */}
          <div className="dr-card dr-shadow mt-6 overflow-hidden w-full bg-white border border-gray-200 rounded-2xl">
            <div className="flex flex-wrap items-center justify-between border-b border-gray-100 px-6 py-4 gap-3">
              <div>
                <p className="text-base font-bold text-gray-900">Wallet Financial Ledger</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  All debits, top-up credits, refunds and admin adjustments.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 p-1">
                <button
                  onClick={() => setFilterType('all')}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                    filterType === 'all' ? 'bg-[#2a85ff] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All ({rawRows.length})
                </button>
                <button
                  onClick={() => setFilterType('debit')}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                    filterType === 'debit' ? 'bg-[#2a85ff] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  API Usage Charges
                </button>
                <button
                  onClick={() => setFilterType('credit')}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                    filterType === 'credit' ? 'bg-[#2a85ff] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Top-ups & Credits
                </button>
                <button
                  onClick={() => setFilterType('refund')}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                    filterType === 'refund' ? 'bg-[#2a85ff] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Refunds
                </button>
                <button
                  onClick={() => setFilterType('adjustment')}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                    filterType === 'adjustment' ? 'bg-[#2a85ff] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
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
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3.5 dr-label text-gray-500">Date</th>
                      <th className="px-6 py-3.5 dr-label text-gray-500">Reference</th>
                      <th className="px-6 py-3.5 dr-label text-gray-500">API / Description</th>
                      <th className="px-6 py-3.5 dr-label text-gray-500">Credit</th>
                      <th className="px-6 py-3.5 dr-label text-gray-500">Debit</th>
                      <th className="px-6 py-3.5 dr-label text-gray-500">Balance</th>
                      <th className="px-6 py-3.5 dr-label text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map(row => (
                      <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-3.5 text-xs text-gray-500 font-medium whitespace-nowrap">
                          {date(row.createdAt || row.date)}
                        </td>
                        <td className="px-6 py-3.5 dr-mono text-xs text-gray-500 font-medium whitespace-nowrap">
                          {row.reference ?? '—'}
                        </td>
                        <td className="px-6 py-3.5 text-xs font-bold text-gray-900">
                          {row.description}
                        </td>
                        <td className="px-6 py-3.5 dr-mono text-xs font-bold text-emerald-600 whitespace-nowrap">
                          {row.type === 'credit' ? `+${money(Math.abs(row.amount))}` : '—'}
                        </td>
                        <td className="px-6 py-3.5 dr-mono text-xs font-bold text-rose-600 whitespace-nowrap">
                          {row.type === 'debit' ? `-${money(Math.abs(row.amount))}` : '—'}
                        </td>
                        <td className="px-6 py-3.5 dr-mono text-xs font-bold text-gray-700 whitespace-nowrap">
                          {money(row.balanceAfter ?? row.balance)}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
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
