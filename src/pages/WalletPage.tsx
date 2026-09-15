import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, CreditCard, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetWalletQueryKey, getListWalletTransactionsQueryKey,
  useCreateTopup, useGetWallet, useListWalletTransactions
} from '@workspace/api-client-react';
import type { WalletTransaction } from '@workspace/api-client-react';
import {
  Btn, Empty, LoadingRows, Metric, PageHeader, QueryError, Skeleton, Status, date, money
} from '@/components/common';

export function WalletPage() {
  const wallet = useGetWallet();
  const transactions = useListWalletTransactions({ limit: 20 });
  const topup = useCreateTopup();
  const client = useQueryClient();
  const [amount, setAmount] = useState('1000');
  const [showTopup, setShowTopup] = useState(false);

  const w = wallet.data;
  const rows = (transactions.data ?? []) as WalletTransaction[];

  const submit = () => topup.mutate(
    { data: { amount: Number(amount) } },
    {
      onSuccess: () => {
        setShowTopup(false);
        client.invalidateQueries({ queryKey: getGetWalletQueryKey() });
        client.invalidateQueries({ queryKey: getListWalletTransactionsQueryKey({ limit: 20 }) });
      }
    }
  );

  return (
    <div className="dr-in w-full">
      <PageHeader
        eyebrow="Workspace / Wallet"
        title="Keep the signal flowing."
        copy="Manage verification credits, top-ups and the full finance trail."
        actions={<Btn icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowTopup(v => !v)}>Top up wallet</Btn>}
      />

      {showTopup && (
        <div className="dr-card dr-shadow mb-5 flex flex-wrap items-end gap-3 p-5">
          <label className="w-56">
            <span className="mb-1.5 block text-[11px] font-bold text-[#53627a]">Top-up amount</span>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-[#8c98a8]">₹</span>
              <input
                type="number"
                min="100"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                data-testid="input-topup-amount"
                className="h-10 w-full rounded-lg border border-[#d6dfe9] bg-white pl-7 pr-3 text-xs outline-none focus:border-[#637da8]"
              />
            </div>
          </label>
          <div className="flex gap-2">
            <Btn variant="soft" onClick={() => setAmount('1000')}>₹1,000</Btn>
            <Btn variant="outline" onClick={() => setAmount('5000')}>₹5,000</Btn>
            <Btn onClick={submit} disabled={topup.isPending}>{topup.isPending ? 'Processing…' : 'Confirm top-up'}</Btn>
          </div>
        </div>
      )}

      {wallet.isLoading ? (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </div>
          <Skeleton className="mt-5 h-72" />
        </>
      ) : wallet.isError ? (
        <QueryError retry={() => wallet.refetch()} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="dr-card dr-shadow relative overflow-hidden bg-[#243961] p-5 text-white">
              <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full border-[22px] border-[#f2c46b]/20" />
              <p className="dr-label text-[#a9bad5]">Available balance</p>
              <p className="mt-3 text-3xl font-bold tracking-[-.05em]" data-testid="text-wallet-balance">{money(w?.balance)}</p>
              <p className="mt-2 text-[10px] text-[#b3c3dd]">{w?.currency ?? 'INR'} credits · low balance at {money(w?.lowBalanceThreshold)}</p>
            </div>
            <Metric label="Total purchased" value={money(w?.totalPurchased)} note="All top-ups" icon={ArrowDownLeft} accent="green" />
            <Metric label="Total spent" value={money(w?.totalSpent)} note="Across all checks" icon={ArrowUpRight} accent="red" />
          </div>

          <div className="dr-card dr-shadow mt-5 overflow-hidden w-full">
            <div className="flex items-center justify-between border-b border-[#e6eaf0] px-5 py-4">
              <div>
                <p className="text-sm font-bold text-[#2d3f5e]">Wallet ledger</p>
                <p className="mt-1 text-[11px] text-[#8c97a7]">Every credit and debit, accounted for.</p>
              </div>
              <Btn variant="outline" icon={<ArrowDownLeft className="h-3.5 w-3.5" />} onClick={() => alert('Ledger export prepared in demo mode.')}>
                Export CSV
              </Btn>
            </div>

            {transactions.isLoading ? (
              <div className="p-5"><LoadingRows /></div>
            ) : transactions.isError ? (
              <div className="p-5"><QueryError retry={() => transactions.refetch()} /></div>
            ) : rows.length === 0 ? (
              <div className="p-5"><Empty icon={CreditCard} title="No transactions yet" copy="Your wallet activity will appear here." /></div>
            ) : (
              <div className="dr-scroll overflow-auto w-full">
                <table className="w-full text-left">
                  <thead className="bg-[#fafbfd]">
                    <tr>
                      {['Description', 'Reference', 'Date', 'Status', 'Amount', 'Balance'].map(h => (
                        <th key={h} className="px-5 py-3 dr-label text-[#8793a4]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => (
                      <tr key={row.id} className="border-t border-[#edf0f4]">
                        <td className="px-5 py-3 text-xs font-semibold text-[#445572]">{row.description}</td>
                        <td className="px-5 py-3 dr-mono text-[10px] text-[#7e8a9c]">{row.reference ?? '—'}</td>
                        <td className="px-5 py-3 text-[11px] text-[#7e8a9c]">{date(row.createdAt)}</td>
                        <td className="px-5 py-3">
                          <Status tone={row.status === 'completed' ? 'success' : 'warning'}>{row.status}</Status>
                        </td>
                        <td className={`px-5 py-3 dr-mono text-xs font-bold ${row.type === 'credit' ? 'text-[#23825f]' : 'text-[#bd554b]'}`}>
                          {row.type === 'credit' ? '+' : '-'}{money(Math.abs(row.amount))}
                        </td>
                        <td className="px-5 py-3 dr-mono text-[11px] text-[#546580]">{money(row.balanceAfter)}</td>
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
