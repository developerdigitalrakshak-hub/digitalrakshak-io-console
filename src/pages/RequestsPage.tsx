import React from 'react';
import { ArrowDownLeft, ArrowRight, FileCheck2 } from 'lucide-react';
import { Link } from 'wouter';
import { useListVerificationRequests } from '@workspace/api-client-react';
import type { VerificationRequest } from '@workspace/api-client-react';
import {
  Btn, Empty, LoadingRows, PageHeader, QueryError, Status, date, money
} from '@/components/common';

export function RequestsPage() {
  const requests = useListVerificationRequests({ limit: 50 });
  const rows = (requests.data ?? []) as VerificationRequest[];

  return (
    <div className="dr-in w-full">
      <PageHeader
        eyebrow="Workspace / Requests"
        title="Verification request history."
        copy="A searchable ledger of the decisions your systems have made."
        actions={
          <Btn variant="outline" icon={<ArrowDownLeft className="h-3.5 w-3.5" />} onClick={() => alert('Request export prepared in demo mode.')}>
            Export history
          </Btn>
        }
      />

      {requests.isLoading ? (
        <LoadingRows count={7} />
      ) : requests.isError ? (
        <QueryError retry={() => requests.refetch()} />
      ) : rows.length === 0 ? (
        <Empty
          icon={FileCheck2}
          title="No verification requests"
          copy="When your first check runs, its result and billing details will appear here."
          action={
            <Link href="/dashboard/docs" className="text-xs font-bold text-[#486592]">
              Open the quickstart <ArrowRight className="ml-1 inline h-3 w-3" />
            </Link>
          }
        />
      ) : (
        <div className="dr-card dr-shadow overflow-hidden w-full">
          <div className="dr-scroll overflow-auto w-full">
            <table className="w-full text-left">
              <thead className="bg-[#fafbfd]">
                <tr>
                  {['Request ID', 'Service', 'Candidate', 'Status', 'Amount', 'Created', 'Result'].map(h => (
                    <th key={h} className="px-5 py-3 dr-label text-[#8793a4]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.requestId} className="border-t border-[#edf0f4] hover:bg-[#fcfdfe]">
                    <td className="px-5 py-4 dr-mono text-[10px] text-[#52698f]">{row.requestId}</td>
                    <td className="px-5 py-4 text-xs font-semibold text-[#445572]">{row.service}</td>
                    <td className="px-5 py-4 text-xs text-[#68778e]">{row.candidate}</td>
                    <td className="px-5 py-4">
                      <Status tone={row.status === 'verified' || row.status === 'success' ? 'success' : row.status === 'failed' ? 'danger' : 'warning'}>
                        {row.status}
                      </Status>
                    </td>
                    <td className="px-5 py-4 dr-mono text-[10px] text-[#63738b]">{money(row.amount)}</td>
                    <td className="px-5 py-4 text-[10px] text-[#8b96a6]">{date(row.createdAt)}</td>
                    <td className="px-5 py-4 text-xs text-[#65748b]">{row.result ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
