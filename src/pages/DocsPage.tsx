import React, { useState } from 'react';
import {
  AlertTriangle, CheckCircle2, Copy, ExternalLink, KeyRound, Send, Terminal
} from 'lucide-react';
import { useVerifyPan } from '@workspace/api-client-react';
import { Btn, PageHeader } from '@/components/common';

export function DocsPage() {
  const verify = useVerifyPan();
  const [pan, setPan] = useState('FZKPM8834L');
  const [person, setPerson] = useState('Aarav Mehta');
  const [result, setResult] = useState<{ requestId: string; success: boolean } | null>(null);

  const run = () => verify.mutate(
    { data: { pan, name: person } },
    { onSuccess: response => setResult({ requestId: response.requestId, success: response.success }) }
  );

  return (
    <div className="dr-in w-full">
      <PageHeader
        eyebrow="Workspace / Developer docs"
        title="From zero to verified."
        copy="A focused quickstart for your first request, then the reference surface for everything after."
        actions={
          <Btn variant="outline" icon={<ExternalLink className="h-3.5 w-3.5" />} onClick={() => alert('Opening documentation in a new tab is disabled in demo mode.')}>
            API reference
          </Btn>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <div className="space-y-4">
          <DocStep n="01" title="Create a key" copy="Start with a test key from API keys. Test calls never affect production records." icon={KeyRound} />
          <DocStep n="02" title="Make the request" copy="Send a PAN and name to the verification endpoint with your bearer token." icon={Terminal} />
          <DocStep n="03" title="Read the result" copy="Use the requestId for traceability and billing for remaining credits." icon={CheckCircle2} />

          <div className="dr-card dr-shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#2f4160]">Try a PAN verification</p>
                <p className="mt-1 text-[11px] text-[#8793a4]">Demo mode · uses your test wallet</p>
              </div>
              <span className="rounded-full bg-[#e7f5ee] px-2 py-1 text-[9px] font-bold uppercase text-[#258360]">Live sandbox</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-[10px] font-bold text-[#697890]">PAN number</span>
                <input value={pan} onChange={e => setPan(e.target.value.toUpperCase())} data-testid="input-pan" className="h-10 w-full rounded-lg border border-[#d6dfe9] bg-white px-3 dr-mono text-xs uppercase outline-none focus:border-[#637da8]" />
              </label>
              <label>
                <span className="mb-1.5 block text-[10px] font-bold text-[#697890]">Full name</span>
                <input value={person} onChange={e => setPerson(e.target.value)} data-testid="input-pan-name" className="h-10 w-full rounded-lg border border-[#d6dfe9] bg-white px-3 text-xs outline-none focus:border-[#637da8]" />
              </label>
            </div>

            <Btn className="mt-4" onClick={run} disabled={verify.isPending} icon={<Send className="h-3.5 w-3.5" />}>
              {verify.isPending ? 'Verifying…' : 'Run verification'}
            </Btn>

            {result && (
              <div className={`mt-4 rounded-lg border p-3 ${result.success ? 'border-[#c5e4d5] bg-[#f0faf5]' : 'border-[#f1cfca] bg-[#fff7f5]'}`}>
                <div className="flex items-center gap-2">
                  {result.success ? <CheckCircle2 className="h-4 w-4 text-[#258360]" /> : <AlertTriangle className="h-4 w-4 text-[#bd443b]" />}
                  <span className="text-xs font-bold text-[#40516f]">{result.success ? 'PAN verified successfully' : 'Verification failed'}</span>
                </div>
                <p className="mt-1 dr-mono text-[10px] text-[#78869a]">{result.requestId}</p>
              </div>
            )}
          </div>
        </div>

        <div className="dr-card dr-shadow overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#e5eaf0] bg-[#fafbfd] px-5 py-4">
            <div>
              <p className="text-sm font-bold text-[#2f4160]">First request</p>
              <p className="mt-1 text-[11px] text-[#8793a4]">cURL · PAN verification</p>
            </div>
            <button onClick={() => navigator.clipboard?.writeText('curl -X POST https://api.digitalrakshak.in/v1/verify/pan')} className="flex items-center gap-1.5 text-[10px] font-bold text-[#536b94]" data-testid="button-copy-curl">
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <pre className="dr-scroll min-h-[300px] overflow-auto bg-[#192846] p-5 font-[family-name:var(--app-font-mono)] text-[11px] leading-6 text-[#b8c9e4]"><code>{`curl -X POST \\\n  https://api.digitalrakshak.in/v1/verify/pan \\\n  -H "Authorization: Bearer dr_test_••••" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "pan": "FZKPM8834L",\n    "name": "Aarav Mehta"\n  }'`}</code></pre>
          <div className="border-t border-[#e5eaf0] p-5">
            <p className="dr-label text-[#8995a6]">Response shape</p>
            <pre className="mt-3 rounded-lg bg-[#f5f7fa] p-4 font-[family-name:var(--app-font-mono)] text-[10px] leading-5 text-[#596a86]"><code>{`{\n  "success": true,\n  "requestId": "vrq_7f2d91c8",\n  "data": { "status": "verified" },\n  "billing": { "creditsUsed": 1 }\n}`}</code></pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocStep({ n, title, copy, icon: Icon }: { n: string; title: string; copy: string; icon: typeof KeyRound }) {
  return (
    <div className="flex gap-4 rounded-xl border border-[#e0e6ee] bg-white p-4">
      <div className="dr-mono pt-1 text-[10px] text-[#b68429]">{n}</div>
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#eaf0f8] text-[#42618d]">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h3 className="text-[13px] font-bold text-[#3b4e6c]">{title}</h3>
        <p className="mt-1 text-[11px] leading-5 text-[#8190a3]">{copy}</p>
      </div>
    </div>
  );
}
