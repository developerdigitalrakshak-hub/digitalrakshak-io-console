import React, { useState } from 'react';
import { BookOpen, Boxes, Check, ChevronRight, Copy, FileCheck2 } from 'lucide-react';
import { getGetServiceQueryKey, useGetService, useListServices } from '@workspace/api-client-react';
import type { VerificationService } from '@workspace/api-client-react';
import {
  Btn, Empty, LoadingRows, PageHeader, QueryError, Status, money
} from '@/components/common';

export function ServicesPage() {
  const services = useListServices();
  const [selected, setSelected] = useState('');
  const detail = useGetService(selected, { query: { enabled: !!selected, queryKey: getGetServiceQueryKey(selected) } });
  const list = (services.data ?? []) as VerificationService[];
  const active = detail.data ?? list.find(s => s.slug === selected);

  return (
    <div className="dr-in w-full">
      <PageHeader
        eyebrow="Workspace / Services"
        title="Verification service catalog."
        copy="One contract, a growing set of high-signal checks."
        actions={<Btn variant="outline" icon={<BookOpen className="h-3.5 w-3.5" />} onClick={() => window.location.href = '/dashboard/docs'}>Read integration guide</Btn>}
      />
      {services.isLoading ? (
        <LoadingRows count={6} />
      ) : services.isError ? (
        <QueryError retry={() => services.refetch()} />
      ) : list.length === 0 ? (
        <Empty icon={Boxes} title="Catalog is empty" copy="Services will appear here when your workspace is provisioned." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map((service, i) => (
              <button
                key={service.slug}
                onClick={() => setSelected(service.slug)}
                data-testid={`card-service-${service.slug}`}
                className={`group text-left ${selected === service.slug ? 'ring-2 ring-[#f1c261]' : ''} dr-card dr-shadow p-5 transition-all hover:-translate-y-0.5`}
              >
                <div className="flex items-start justify-between">
                  <div className={`grid h-9 w-9 place-items-center rounded-lg ${i % 3 === 0 ? 'bg-[#eaf0f8] text-[#42618d]' : i % 3 === 1 ? 'bg-[#fff3d6] text-[#ae7717]' : 'bg-[#e7f5ee] text-[#28845f]'}`}>
                    <FileCheck2 className="h-4 w-4" />
                  </div>
                  <Status tone={service.status === 'active' ? 'success' : 'neutral'}>{service.status}</Status>
                </div>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[.08em] text-[#9a6f27]">{service.category}</p>
                <h3 className="mt-1 text-[15px] font-bold text-[#304260]">{service.name}</h3>
                <p className="mt-2 min-h-10 text-[11px] leading-5 text-[#7c899b]">{service.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-[#edf0f4] pt-3">
                  <span className="dr-mono text-[10px] text-[#718096]">{money(service.price)} / check</span>
                  <ChevronRight className="h-4 w-4 text-[#aab4c2] transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>

          <div className="lg:sticky lg:top-5 lg:self-start">
            {active ? (
              <ServiceDetail service={active} />
            ) : (
              <div className="dr-card dr-shadow flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[#eaf0f8] text-[#4d6a96]">
                  <Boxes className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-[#3a4c6a]">Select a service</h3>
                <p className="mt-1 max-w-xs text-xs leading-5 text-[#8b96a6]">Inspect endpoints, fields and pricing before you make your first call.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceDetail({ service }: { service: VerificationService }) {
  const [copied, setCopied] = useState(false);
  const snippet = `curl -X ${service.method} https://api.digitalrakshak.in${service.endpoint} \\\n  -H "Authorization: Bearer dr_test_••••" \\\n  -H "Content-Type: application/json"`;

  return (
    <div className="dr-card dr-shadow overflow-hidden">
      <div className="bg-[#243961] p-5 text-white">
        <div className="flex items-center justify-between">
          <span className="dr-label text-[#aebed7]">{service.category}</span>
          <Status tone="success">{service.status}</Status>
        </div>
        <h2 className="mt-4 font-[family-name:var(--app-font-serif)] text-2xl font-bold tracking-[-.04em]">{service.name}</h2>
        <p className="mt-2 text-[11px] leading-5 text-[#b8c7dd]">{service.description}</p>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <span className="dr-label text-[#8995a6]">Endpoint</span>
          <div className="mt-2 flex items-center gap-2 rounded-md bg-[#f3f5f8] px-3 py-2">
            <span className="rounded bg-[#dfe8f5] px-1.5 py-0.5 dr-mono text-[9px] font-bold text-[#47648f]">{service.method}</span>
            <code className="dr-mono truncate text-[10px] text-[#5d6c84]">{service.endpoint}</code>
          </div>
        </div>
        <div>
          <span className="dr-label text-[#8995a6]">Request fields</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(service.fields ?? ['name', 'identifier']).map(field => (
              <span key={field} className="rounded-md border border-[#e0e6ee] px-2 py-1 dr-mono text-[10px] text-[#68778e]">{field}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-[#edf0f4] pt-4">
          <span className="text-[11px] text-[#7c899b]">Version <b className="text-[#445875]">{service.version}</b></span>
          <span className="text-[12px] font-bold text-[#304260]">{money(service.price)} <span className="font-normal text-[#8a96a7]">per call</span></span>
        </div>
        <div className="relative rounded-lg bg-[#192846] p-3">
          <button
            onClick={() => { navigator.clipboard?.writeText(snippet); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
            className="absolute right-2 top-2 text-[#8da2c3] hover:text-white"
            data-testid="button-copy-snippet"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <pre className="overflow-auto whitespace-pre-wrap pr-5 font-[family-name:var(--app-font-mono)] text-[9px] leading-5 text-[#b9c9e4]">{snippet}</pre>
        </div>
      </div>
    </div>
  );
}
