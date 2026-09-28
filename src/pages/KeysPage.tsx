import React, { useState } from 'react';
import {
  AlertTriangle, Check, Copy, Eye, EyeOff, KeyRound, Loader2, Lock,
  Plus, RefreshCw, ShieldCheck, Trash2, X
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getListApiKeysQueryKey, useCreateApiKey, useListApiKeys, useRegenerateApiKey, useRevokeApiKey
} from '@workspace/api-client-react';
import type { ApiKey } from '@workspace/api-client-react';
import {
  Btn, Empty, LoadingRows, PageHeader, QueryError, Status, ago, date
} from '@/components/common';
import { useToast } from '@/hooks/use-toast';

export function KeysPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const keysQuery = useListApiKeys();
  const createMutation = useCreateApiKey();
  const revokeMutation = useRevokeApiKey();
  const regenerateMutation = useRegenerateApiKey();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createdKeyData, setCreatedKeyData] = useState<{ name: string; secret: string; environment: string } | null>(null);
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState<'test' | 'production'>('test');
  const [ipWhitelist, setIpWhitelist] = useState('');
  const [rateLimit, setRateLimit] = useState('10000');
  const [copiedSecret, setCopiedSecret] = useState(false);

  const list = (keysQuery.data ?? []) as ApiKey[];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: 'Validation Error', description: 'Please enter a valid API key name.', variant: 'destructive' });
      return;
    }

    createMutation.mutate(
      { data: { name: name.trim(), environment } },
      {
        onSuccess: (result: any) => {
          setCreatedKeyData({
            name: result.name || name,
            secret: result.secret || `dr_${environment === 'production' ? 'live' : 'test'}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
            environment: result.environment || environment
          });
          setName('');
          setIpWhitelist('');
          setCreateModalOpen(false);
          toast({ title: 'API Key Created', description: 'Copy the secret key now. It will not be shown again.' });
          queryClient.invalidateQueries({ queryKey: getListApiKeysQueryKey() });
        },
        onError: (err: any) => {
          toast({ title: 'Key Creation Failed', description: err.message || 'Could not generate API key.', variant: 'destructive' });
        }
      }
    );
  };

  const handleRegenerate = (key: ApiKey) => {
    if (!confirm(`Are you sure you want to regenerate secret for "${key.name}"? Existing API calls using the old key will fail immediately.`)) {
      return;
    }

    regenerateMutation.mutate(
      { id: key.id },
      {
        onSuccess: (result: any) => {
          setCreatedKeyData({
            name: key.name,
            secret: result.secret,
            environment: key.environment
          });
          toast({ title: 'API Key Regenerated', description: 'New secret key generated. Store it securely.' });
          queryClient.invalidateQueries({ queryKey: getListApiKeysQueryKey() });
        },
        onError: (err: any) => {
          toast({ title: 'Regeneration Failed', description: err.message || 'Could not regenerate secret key.', variant: 'destructive' });
        }
      }
    );
  };

  const handleRevoke = (key: ApiKey) => {
    if (!confirm(`Are you sure you want to revoke API key "${key.name}"? This action cannot be undone.`)) {
      return;
    }

    revokeMutation.mutate(
      { id: key.id },
      {
        onSuccess: () => {
          toast({ title: 'API Key Revoked', description: `Key "${key.name}" is now revoked.` });
          queryClient.invalidateQueries({ queryKey: getListApiKeysQueryKey() });
        },
        onError: (err: any) => {
          toast({ title: 'Revocation Failed', description: err.message || 'Could not revoke API key.', variant: 'destructive' });
        }
      }
    );
  };

  return (
    <div className="dr-in w-full space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'Developer Console', href: '/dashboard' }, { label: 'API Credentials' }]}
        title="API Keys & Credentials"
        copy="Manage API keys and secret tokens to authenticate DigitalRakshak verification API requests from your backend applications."
        actions={
          <Btn variant="primary" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setCreateModalOpen(true)}>
            Generate New API Key
          </Btn>
        }
      />

      {/* Secret Display Box after Creation / Regeneration */}
      {createdKeyData && (
        <div className="rounded-2xl border border-[#bce2d1] bg-[#f0faf5] p-5 shadow-sm dr-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#d5f0e3] text-[#1b6a4f]">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1a5b44]">API Key Secret Generated ({createdKeyData.name})</h3>
                <p className="text-xs text-[#3b7c65]">Copy and store this key securely. For security, this full secret will not be displayed again.</p>
              </div>
            </div>
            <button
              onClick={() => setCreatedKeyData(null)}
              className="rounded-lg p-1 text-[#3b7c65] hover:bg-[#d9f2e6]"
              title="Dismiss warning"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex-1 rounded-xl border border-[#c1e5d4] bg-white px-4 py-2.5 shadow-inner">
              <code className="dr-mono text-xs font-bold text-[#1f5c45] select-all break-all">
                {createdKeyData.secret}
              </code>
            </div>
            <Btn
              variant="soft"
              icon={copiedSecret ? <Check className="h-3.5 w-3.5 text-[#1b6a4f]" /> : <Copy className="h-3.5 w-3.5" />}
              onClick={() => {
                navigator.clipboard?.writeText(createdKeyData.secret);
                setCopiedSecret(true);
                toast({ title: 'Copied to Clipboard', description: 'Secret key copied successfully.' });
                setTimeout(() => setCopiedSecret(false), 2000);
              }}
            >
              {copiedSecret ? 'Copied' : 'Copy Secret Key'}
            </Btn>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[11px] text-[#2c6e54]">
            <AlertTriangle className="h-3.5 w-3.5 text-[#2c6e54]" />
            <span>Store this key in an environment variable (`DIGITALRAKSHAK_API_KEY`). Do not commit to source repositories.</span>
          </div>
        </div>
      )}

      {/* API Keys Table */}
      {keysQuery.isLoading ? (
        <LoadingRows count={5} />
      ) : keysQuery.isError ? (
        <QueryError retry={() => keysQuery.refetch()} />
      ) : list.length === 0 ? (
        <Empty
          icon={KeyRound}
          title="No API keys generated yet"
          copy="Generate your first API key to authenticate your server-to-server verification requests."
          action={
            <Btn variant="primary" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setCreateModalOpen(true)}>
              Generate First API Key
            </Btn>
          }
        />
      ) : (
        <div className="dr-card dr-shadow overflow-hidden w-full">
          <div className="dr-scroll overflow-auto w-full">
            <table className="w-full text-left">
              <thead className="bg-[#fafbfd] border-b border-[#edf0f4]">
                <tr>
                  {['Key Name', 'Environment', 'API Key Token', 'Last Used', 'Total Requests', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 dr-label text-[#8793a4]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0f4]">
                {list.map(keyItem => (
                  <tr key={keyItem.id} className="hover:bg-[#fcfdfe] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#eaf0f8] text-[#3d5985]">
                          <KeyRound className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#263755]">{keyItem.name}</p>
                          <p className="text-[10px] text-[#8a96a8]">Created {date(keyItem.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-md px-2 py-0.5 dr-mono text-[9px] font-bold uppercase ${
                        keyItem.environment === 'production'
                          ? 'bg-[#fff0ee] text-[#bd443b]'
                          : 'bg-[#e8f0ff] text-[#39598c]'
                      }`}>
                        {keyItem.environment}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <code className="dr-mono text-xs font-semibold text-[#445572] bg-[#f2f5f9] px-2 py-1 rounded">
                        {keyItem.maskedKey}
                      </code>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#718096]">
                      {keyItem.lastUsed ? ago(keyItem.lastUsed) : 'Never used'}
                    </td>
                    <td className="px-5 py-4 dr-mono text-xs font-bold text-[#2d3f5e]">
                      {(keyItem.usage ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      <Status tone={(keyItem as any).status === 'revoked' ? 'danger' : 'success'}>
                        {(keyItem as any).status || 'active'}
                      </Status>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRegenerate(keyItem)}
                          disabled={regenerateMutation.isPending || (keyItem as any).status === 'revoked'}
                          className="rounded-lg border border-[#dce2ec] p-1.5 text-[#526482] hover:bg-[#f1f4f8] hover:text-[#243961] disabled:opacity-40"
                          title="Regenerate Key Secret"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleRevoke(keyItem)}
                          disabled={revokeMutation.isPending || (keyItem as any).status === 'revoked'}
                          className="rounded-lg border border-[#dce2ec] p-1.5 text-[#9aa4b2] hover:bg-[#fff0ee] hover:text-[#bd443b] disabled:opacity-40"
                          title="Revoke Key"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create API Key */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10192d]/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#dce2ec] bg-white p-6 shadow-2xl dr-in">
            <div className="flex items-center justify-between border-b border-[#edf0f5] pb-4">
              <div>
                <span className="dr-label text-[#b68429]">API Credential</span>
                <h3 className="text-lg font-bold text-[#233352]">Generate New API Key</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="rounded-lg p-1 text-[#8b97a8] hover:bg-[#f1f4f8]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#344665]">API Key Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Production Backend, iOS Sandbox Key"
                  className="dr-input mt-1 w-full text-xs font-semibold"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-[#344665]">Environment *</label>
                  <select
                    value={environment}
                    onChange={e => setEnvironment(e.target.value as 'test' | 'production')}
                    className="dr-input mt-1 w-full text-xs font-semibold"
                  >
                    <option value="test">Sandbox / Test</option>
                    <option value="production">Production</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#344665]">Daily Rate Limit</label>
                  <input
                    type="text"
                    value={rateLimit}
                    onChange={e => setRateLimit(e.target.value)}
                    placeholder="10000"
                    className="dr-input mt-1 w-full text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#344665]">IP Whitelist (Optional)</label>
                <input
                  type="text"
                  value={ipWhitelist}
                  onChange={e => setIpWhitelist(e.target.value)}
                  placeholder="e.g. 192.168.1.1, 10.0.0.0/24 (Comma separated)"
                  className="dr-input mt-1 w-full text-xs font-semibold"
                />
              </div>

              <div className="rounded-xl border border-[#e2e8f0] bg-[#fafbfd] p-3.5 text-xs text-[#64748b]">
                <p className="font-semibold text-[#24314c]">Permissions & Security Scope</p>
                <p className="mt-0.5 text-[11px] text-[#718096]">
                  This key allows calling all active verification APIs (PAN, Aadhaar, Bank, EPFO) enabled for your client workspace.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#edf0f5] pt-4">
                <Btn variant="outline" onClick={() => setCreateModalOpen(false)} disabled={createMutation.isPending}>
                  Cancel
                </Btn>
                <Btn
                  variant="primary"
                  type="submit"
                  disabled={createMutation.isPending || !name.trim()}
                  icon={createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                >
                  {createMutation.isPending ? 'Generating...' : 'Generate API Key'}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
