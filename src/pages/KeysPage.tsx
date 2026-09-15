import React, { useState } from 'react';
import { Copy, KeyRound, Plus, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getListApiKeysQueryKey, useCreateApiKey, useListApiKeys, useRevokeApiKey
} from '@workspace/api-client-react';
import type { ApiKey } from '@workspace/api-client-react';
import {
  Btn, Empty, LoadingRows, PageHeader, QueryError, date, ago
} from '@/components/common';

export function KeysPage() {
  const keys = useListApiKeys();
  const create = useCreateApiKey();
  const revoke = useRevokeApiKey();
  const client = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState<'test' | 'production'>('test');

  const list = (keys.data ?? []) as ApiKey[];

  const submit = () => {
    if (!name.trim()) return;
    create.mutate(
      { data: { name, environment } },
      {
        onSuccess: result => {
          setCreatedSecret(result.secret);
          setName('');
          setShowForm(false);
          client.invalidateQueries({ queryKey: getListApiKeysQueryKey() });
        }
      }
    );
  };

  return (
    <div className="dr-in w-full">
      <PageHeader
        eyebrow="Workspace / API keys"
        title="Keys with clear boundaries."
        copy="Create scoped credentials for each environment and rotate them without downtime."
        actions={<Btn icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowForm(v => !v)}>New API key</Btn>}
      />

      {createdSecret && (
        <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-[#c5e4d5] bg-[#f0faf5] p-4">
          <div>
            <p className="text-xs font-bold text-[#236b50]">Copy this secret now</p>
            <p className="mt-1 text-[11px] text-[#568371]">For security, the full secret will not be shown again.</p>
            <code className="mt-3 block rounded-md border border-[#cae5d7] bg-white px-3 py-2 dr-mono text-[11px] text-[#326b56]">{createdSecret}</code>
          </div>
          <button onClick={() => { navigator.clipboard?.writeText(createdSecret); setCreatedSecret(null); }} className="text-[#398365]" data-testid="button-copy-secret">
            <Copy className="h-4 w-4" />
          </button>
        </div>
      )}

      {showForm && (
        <div className="dr-card dr-shadow mb-5 p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end">
            <label>
              <span className="mb-1.5 block text-[11px] font-bold text-[#53627a]">Key name</span>
              <input value={name} onChange={e => setName(e.target.value)} data-testid="input-key-name" placeholder="e.g. Production backend" className="h-10 w-full rounded-lg border border-[#d6dfe9] bg-white px-3 text-xs outline-none focus:border-[#637da8]" />
            </label>
            <label>
              <span className="mb-1.5 block text-[11px] font-bold text-[#53627a]">Environment</span>
              <select value={environment} onChange={e => setEnvironment(e.target.value as 'test' | 'production')} data-testid="select-key-environment" className="h-10 w-full rounded-lg border border-[#d6dfe9] bg-white px-3 text-xs outline-none">
                <option value="test">Test</option>
                <option value="production">Production</option>
              </select>
            </label>
            <div className="flex gap-2">
              <Btn onClick={submit} disabled={create.isPending}>{create.isPending ? 'Creating…' : 'Create key'}</Btn>
              <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}

      {keys.isLoading ? (
        <LoadingRows />
      ) : keys.isError ? (
        <QueryError retry={() => keys.refetch()} />
      ) : list.length === 0 ? (
        <Empty icon={KeyRound} title="No API keys yet" copy="Create a test key to make your first request." action={<Btn onClick={() => setShowForm(true)} icon={<Plus className="h-3.5 w-3.5" />}>Create first key</Btn>} />
      ) : (
        <div className="dr-card dr-shadow overflow-hidden w-full">
          <div className="hidden grid-cols-[1.25fr_.8fr_1fr_.85fr_.6fr_auto] gap-4 border-b border-[#e6eaf0] bg-[#fafbfd] px-5 py-3 md:grid">
            <span className="dr-label text-[#8793a4]">Name</span>
            <span className="dr-label text-[#8793a4]">Environment</span>
            <span className="dr-label text-[#8793a4]">Key</span>
            <span className="dr-label text-[#8793a4]">Last used</span>
            <span className="dr-label text-[#8793a4]">Usage</span>
            <span />
          </div>
          {list.map(key => (
            <KeyRow
              key={key.id}
              item={key}
              revoke={() => {
                if (confirm('Revoke this API key?')) {
                  revoke.mutate(
                    { id: key.id },
                    { onSuccess: () => client.invalidateQueries({ queryKey: getListApiKeysQueryKey() }) }
                  );
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function KeyRow({ item, revoke }: { item: ApiKey; revoke: () => void }) {
  return (
    <div className="grid gap-3 border-b border-[#edf0f4] px-5 py-4 last:border-b-0 md:grid-cols-[1.25fr_.8fr_1fr_.85fr_.6fr_auto] md:items-center md:gap-4">
      <div>
        <p className="text-xs font-bold text-[#354765]">{item.name}</p>
        <p className="mt-0.5 text-[10px] text-[#99a3b1]">Created {date(item.createdAt)}</p>
      </div>
      <span className="w-fit rounded bg-[#edf2f8] px-2 py-1 dr-mono text-[9px] uppercase text-[#55709a]">{item.environment}</span>
      <code className="dr-mono text-[11px] text-[#697890]">{item.maskedKey}</code>
      <span className="text-[11px] text-[#7f8b9d]">{item.lastUsed ? ago(item.lastUsed) : 'Never used'}</span>
      <span className="text-[11px] font-semibold text-[#52637f]">{item.usage.toLocaleString('en-IN')}</span>
      <button onClick={revoke} className="justify-self-start rounded-md p-2 text-[#9aa4b2] hover:bg-[#fff0ee] hover:text-[#bd443b] md:justify-self-end" aria-label={`Revoke ${item.name}`} data-testid={`button-revoke-${item.id}`}>
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
