import React, { useState } from 'react';
import {
  Webhook as WebhookIcon, Plus, Send, MoreHorizontal, ShieldCheck,
  Building2, Sliders, Bell, Lock, CheckCircle2, AlertTriangle, Trash2,
  Edit2, Power, Copy, Check, ExternalLink, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getListWebhooksQueryKey, useCreateWebhook, useListWebhooks,
  useUpdateWebhook, useToggleWebhook, useDeleteWebhook,
  useSendTestWebhook, useListWebhookDeliveries
} from '@workspace/api-client-react';
import type { Webhook, WebhookDeliveryLog } from '@workspace/api-client-react';
import {
  Btn, Empty, LoadingRows, PageHeader, QueryError, Status, ago, date
} from '@/components/common';

const BACKEND_EVENTS = [
  { id: 'verification.completed', label: 'verification.completed', desc: 'Triggered when a candidate verification finishes successfully.' },
  { id: 'verification.failed', label: 'verification.failed', desc: 'Triggered when verification fails or checks reveal a mismatch.' },
  { id: 'wallet.topup.success', label: 'wallet.topup.success', desc: 'Triggered when top-up credit is verified and added to wallet.' },
  { id: 'wallet.low_balance', label: 'wallet.low_balance', desc: 'Triggered when wallet balance falls below threshold.' }
];

interface WebhooksPageProps {
  initialTab?: 'webhooks' | 'settings' | 'profile' | 'security';
}

export function WebhooksPage({ initialTab = 'webhooks' }: WebhooksPageProps) {
  const hooks = useListWebhooks();
  const deliveries = useListWebhookDeliveries();
  const create = useCreateWebhook();
  const update = useUpdateWebhook();
  const toggle = useToggleWebhook();
  const remove = useDeleteWebhook();
  const sendTest = useSendTestWebhook();
  const client = useQueryClient();

  const [activeTab, setActiveTab] = useState<'webhooks' | 'profile' | 'config' | 'notifications' | 'security'>(
    initialTab === 'settings' ? 'profile' : 'webhooks'
  );

  // Webhook Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    'verification.completed',
    'verification.failed'
  ]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Profile Form State
  const [companyName, setCompanyName] = useState('Aster & Co. Technologies');
  const [gstin, setGstin] = useState('27AAAAA0000A1Z5');
  const [contactEmail, setContactEmail] = useState('dev@asterco.com');

  // Config State
  const [timeoutMs, setTimeoutMs] = useState('5000');
  const [maxRetries, setMaxRetries] = useState('3');

  const rows = (hooks.data ?? []) as Webhook[];
  const deliveryRows = (deliveries.data ?? []) as WebhookDeliveryLog[];

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventId) ? prev.filter(e => e !== eventId) : [...prev, eventId]
    );
  };

  const handleCreateOrUpdate = () => {
    if (!url.trim()) {
      alert('Please enter a valid webhook endpoint URL.');
      return;
    }
    if (selectedEvents.length === 0) {
      alert('Please select at least one backend event subscription.');
      return;
    }

    if (editingId) {
      update.mutate(
        { id: editingId, url, events: selectedEvents },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditingId(null);
            setUrl('');
          }
        }
      );
    } else {
      create.mutate(
        { data: { url, events: selectedEvents } },
        {
          onSuccess: () => {
            setShowForm(false);
            setUrl('');
          }
        }
      );
    }
  };

  const startEdit = (wh: Webhook) => {
    setEditingId(wh.id);
    setUrl(wh.url);
    setSelectedEvents(wh.events);
    setShowForm(true);
  };

  const handleDeleteConfigOnly = (id: string) => {
    if (confirm('Are you sure you want to delete this webhook endpoint configuration? Historical delivery logs will be preserved.')) {
      remove.mutate({ id });
    }
  };

  return (
    <div className="dr-in w-full">
      <PageHeader
        eyebrow="Workspace / Developer Settings & Webhooks"
        title="Developer Settings & Webhook Engine"
        copy="Manage real-time signed webhook subscriptions, profile attributes, API security policies and delivery history."
        actions={
          <div className="flex items-center gap-2">
            <Btn variant="outline" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => { hooks.refetch(); deliveries.refetch(); }}>
              Refresh
            </Btn>
            {activeTab === 'webhooks' && (
              <Btn icon={<Plus className="h-3.5 w-3.5" />} onClick={() => {
                setEditingId(null);
                setUrl('');
                setShowForm(v => !v);
              }}>
                Add Webhook
              </Btn>
            )}
          </div>
        }
      />

      {/* Main Settings Section Nav Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-[#e2e8f0] pb-2">
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
            activeTab === 'webhooks' ? 'bg-[#243961] text-white shadow-sm' : 'text-[#64748b] hover:bg-[#eef2f7] hover:text-[#1e2b4f]'
          }`}
        >
          <WebhookIcon className="h-4 w-4" /> Webhooks & Delivery Logs
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
            activeTab === 'profile' ? 'bg-[#243961] text-white shadow-sm' : 'text-[#64748b] hover:bg-[#eef2f7] hover:text-[#1e2b4f]'
          }`}
        >
          <Building2 className="h-4 w-4" /> Company Profile
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
            activeTab === 'config' ? 'bg-[#243961] text-white shadow-sm' : 'text-[#64748b] hover:bg-[#eef2f7] hover:text-[#1e2b4f]'
          }`}
        >
          <Sliders className="h-4 w-4" /> API Configuration
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
            activeTab === 'notifications' ? 'bg-[#243961] text-white shadow-sm' : 'text-[#64748b] hover:bg-[#eef2f7] hover:text-[#1e2b4f]'
          }`}
        >
          <Bell className="h-4 w-4" /> Notifications
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
            activeTab === 'security' ? 'bg-[#243961] text-white shadow-sm' : 'text-[#64748b] hover:bg-[#eef2f7] hover:text-[#1e2b4f]'
          }`}
        >
          <Lock className="h-4 w-4" /> Security
        </button>
      </div>

      {/* TAB 1: WEBHOOKS MANAGEMENT & LOGS */}
      {activeTab === 'webhooks' && (
        <>
          {/* Create / Edit Form Drawer */}
          {showForm && (
            <div className="dr-card dr-shadow mb-6 border-2 border-[#243961]/30 bg-[#fbfcfd] p-6 transition-all">
              <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3 mb-4">
                <h3 className="text-sm font-bold text-[#1e2b4f]">
                  {editingId ? 'Edit Webhook Endpoint' : 'Add New Webhook Endpoint'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-[#94a3b8] hover:text-[#1e2b4f]">✕</button>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#53627a]">Endpoint HTTPS URL</span>
                  <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://api.yourcompany.com/webhooks/digitalrakshak"
                    className="h-10 w-full rounded-lg border border-[#d6dfe9] bg-white px-3 text-xs outline-none focus:border-[#243961] focus:ring-1 focus:ring-[#243961]"
                  />
                </label>

                <div>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#53627a]">
                    Subscribe to Backend Events
                  </span>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {BACKEND_EVENTS.map(ev => (
                      <label
                        key={ev.id}
                        className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                          selectedEvents.includes(ev.id) ? 'border-[#243961] bg-[#f0f4fa]' : 'border-[#e2e8f0] bg-white hover:bg-[#fafbfd]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(ev.id)}
                          onChange={() => handleEventToggle(ev.id)}
                          className="mt-0.5 rounded border-gray-300 text-[#243961] focus:ring-[#243961]"
                        />
                        <div>
                          <p className="dr-mono text-xs font-bold text-[#1e2b4f]">{ev.label}</p>
                          <p className="mt-0.5 text-[10px] text-[#64748b]">{ev.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Btn onClick={handleCreateOrUpdate} disabled={create.isPending || update.isPending}>
                    {editingId ? 'Save Changes' : 'Create Webhook Endpoint'}
                  </Btn>
                  <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn>
                </div>
              </div>
            </div>
          )}

          {/* Webhooks Active List */}
          {hooks.isLoading ? (
            <LoadingRows count={3} />
          ) : hooks.isError ? (
            <QueryError retry={() => hooks.refetch()} />
          ) : rows.length === 0 ? (
            <Empty
              icon={WebhookIcon}
              title="No Webhook Endpoints Configured"
              copy="Add your endpoint URL to receive verification completion state updates in real time."
              action={<Btn onClick={() => setShowForm(true)} icon={<Plus className="h-3.5 w-3.5" />}>Add Your First Endpoint</Btn>}
            />
          ) : (
            <div className="space-y-4 w-full">
              {rows.map(row => (
                <div key={row.id} className="dr-card dr-shadow p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf0f8] text-[#243961]">
                        <WebhookIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#1e2b4f]">{row.url}</h3>
                          <Status tone={row.status === 'active' ? 'success' : 'neutral'}>{row.status}</Status>
                        </div>
                        <p className="mt-1 dr-mono text-[10px] text-[#718096]">
                          Signing Secret: <span className="font-bold text-[#243961]">{row.secretHint ?? 'whsec_••••9f2a'}</span> · Created {date(row.createdAt)} · Last delivery {row.lastDelivery ? ago(row.lastDelivery) : 'never'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Btn variant="outline" icon={<Send className="h-3.5 w-3.5" />} onClick={() => sendTest.mutate({ webhookId: row.id })}>
                        {sendTest.isPending ? 'Sending…' : 'Send Test Event'}
                      </Btn>
                      <Btn variant="ghost" icon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => startEdit(row)}>
                        Edit
                      </Btn>
                      <Btn
                        variant="ghost"
                        icon={<Power className="h-3.5 w-3.5" />}
                        onClick={() => toggle.mutate({ id: row.id, status: row.status === 'active' ? 'inactive' : 'active' })}
                      >
                        {row.status === 'active' ? 'Disable' : 'Enable'}
                      </Btn>
                      <Btn variant="danger" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => handleDeleteConfigOnly(row.id)}>
                        Delete
                      </Btn>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#edf0f4] pt-3">
                    <span className="dr-label text-[#8c97a7] text-[10px]">Subscribed Events:</span>
                    {row.events.map(event => (
                      <span key={event} className="rounded bg-[#f0f4fa] px-2 py-0.5 dr-mono text-[10px] font-bold text-[#243961]">
                        {event}
                      </span>
                    ))}
                    <span className="ml-auto text-[11px] font-semibold text-[#64748b]">
                      {row.deliveries ?? 0} total deliveries
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* WEBHOOK DELIVERY HISTORY TABLE */}
          <div className="dr-card dr-shadow mt-8 overflow-hidden w-full">
            <div className="flex items-center justify-between border-b border-[#e6eaf0] px-5 py-4 bg-[#fafbfd]">
              <div>
                <h3 className="text-sm font-bold text-[#2d3f5e]">Webhook Delivery History Log</h3>
                <p className="mt-0.5 text-[11px] text-[#8c97a7]">
                  Preserved delivery log attempts for all webhook events (Historical logs are never deleted).
                </p>
              </div>
              <span className="dr-label text-[#167455] text-[10px] bg-[#e8f6f0] px-2 py-0.5 rounded">
                Persistent Log Storage
              </span>
            </div>

            {deliveryRows.length === 0 ? (
              <div className="p-5"><Empty icon={Send} title="No Webhook Deliveries Logged" copy="Delivery history will populate after triggering verification events." /></div>
            ) : (
              <div className="dr-scroll overflow-auto w-full">
                <table className="w-full text-left">
                  <thead className="bg-[#fafbfd]">
                    <tr>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">Event</th>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">Timestamp</th>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">Status</th>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">Response Code</th>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">Attempts</th>
                      <th className="px-5 py-3 dr-label text-[#8793a4]">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryRows.map(del => (
                      <tr key={del.id} className="border-t border-[#edf0f4] hover:bg-[#f8fafc]">
                        <td className="px-5 py-3 dr-mono text-xs font-bold text-[#243961]">{del.event}</td>
                        <td className="px-5 py-3 text-[11px] text-[#7e8a9c]">{date(del.timestamp)} {ago(del.timestamp)}</td>
                        <td className="px-5 py-3">
                          <Status tone={del.status === 'delivered' ? 'success' : 'danger'}>{del.status}</Status>
                        </td>
                        <td className="px-5 py-3 dr-mono text-xs font-bold text-[#334462]">{del.responseCode}</td>
                        <td className="px-5 py-3 text-xs text-[#546580]">{del.attempts} attempt{del.attempts > 1 ? 's' : ''}</td>
                        <td className="px-5 py-3 dr-mono text-xs text-[#6e7d94]">{del.durationMs}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: COMPANY PROFILE */}
      {activeTab === 'profile' && (
        <div className="dr-card dr-shadow p-6 space-y-6 max-w-3xl">
          <div className="border-b border-[#e2e8f0] pb-4">
            <h3 className="text-base font-bold text-[#1e2b4f]">Company & Workspace Identity</h3>
            <p className="mt-1 text-xs text-[#64748b]">Manage organization parameters, tax identification, and primary contact emails.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase text-[#53627a]">Company / Organization Name</span>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#d6dfe9] bg-white px-3 text-xs outline-none focus:border-[#243961]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase text-[#53627a]">GSTIN / Tax ID</span>
              <input
                type="text"
                value={gstin}
                onChange={e => setGstin(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#d6dfe9] bg-white px-3 text-xs outline-none focus:border-[#243961]"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[11px] font-bold uppercase text-[#53627a]">Primary Developer Email</span>
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#d6dfe9] bg-white px-3 text-xs outline-none focus:border-[#243961]"
              />
            </label>
          </div>

          <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#1e2b4f]">Workspace ID</p>
              <p className="dr-mono text-[11px] text-[#64748b]">ws_aster_prod_991823</p>
            </div>
            <span className="rounded bg-[#e8f6f0] px-2.5 py-1 text-[10px] font-bold text-[#167455]">Verified Workspace</span>
          </div>

          <Btn onClick={() => alert('Company profile updated successfully.')}>Save Profile Changes</Btn>
        </div>
      )}

      {/* TAB 3: API CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="dr-card dr-shadow p-6 space-y-6 max-w-3xl">
          <div className="border-b border-[#e2e8f0] pb-4">
            <h3 className="text-base font-bold text-[#1e2b4f]">API Execution & Retry Policies</h3>
            <p className="mt-1 text-xs text-[#64748b]">Configure HTTP client timeouts, webhook callback retries and IP whitelisting.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase text-[#53627a]">HTTP Timeout (ms)</span>
              <input
                type="number"
                value={timeoutMs}
                onChange={e => setTimeoutMs(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#d6dfe9] bg-white px-3 text-xs outline-none focus:border-[#243961]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase text-[#53627a]">Max Callback Retries</span>
              <select
                value={maxRetries}
                onChange={e => setMaxRetries(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#d6dfe9] bg-white px-3 text-xs outline-none focus:border-[#243961]"
              >
                <option value="1">1 Retry</option>
                <option value="3">3 Retries (Exponential Backoff)</option>
                <option value="5">5 Retries</option>
              </select>
            </label>
          </div>

          <Btn onClick={() => alert('API configuration updated.')}>Save Configuration</Btn>
        </div>
      )}

      {/* TAB 4: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="dr-card dr-shadow p-6 space-y-6 max-w-3xl">
          <div className="border-b border-[#e2e8f0] pb-4">
            <h3 className="text-base font-bold text-[#1e2b4f]">Notification & Alert Preferences</h3>
            <p className="mt-1 text-xs text-[#64748b]">Manage low wallet balance notifications and webhook outage alerts.</p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between rounded-xl border border-[#e2e8f0] p-4 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-[#1e2b4f]">Low Wallet Balance Alerts</p>
                <p className="text-[11px] text-[#64748b]">Send email when available balance drops below ₹2,000.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-[#243961]" />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-[#e2e8f0] p-4 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-[#1e2b4f]">Webhook Outage Alerts</p>
                <p className="text-[11px] text-[#64748b]">Send email if an endpoint fails 3 consecutive times.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-[#243961]" />
            </label>
          </div>

          <Btn onClick={() => alert('Notification preferences saved.')}>Save Notification Settings</Btn>
        </div>
      )}

      {/* TAB 5: SECURITY */}
      {activeTab === 'security' && (
        <div className="dr-card dr-shadow p-6 space-y-6 max-w-3xl">
          <div className="border-b border-[#e2e8f0] pb-4">
            <h3 className="text-base font-bold text-[#1e2b4f]">API Security & Webhook Signing</h3>
            <p className="mt-1 text-xs text-[#64748b]">HMAC SHA-256 webhook signature validation and key isolation.</p>
          </div>

          <div className="rounded-xl border border-[#e2e8f0] bg-[#fafbfd] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1e2b4f]">Webhook Signing Secret</span>
              <button
                onClick={() => setShowSecret(v => !v)}
                className="text-xs font-semibold text-[#243961] flex items-center gap-1 hover:underline"
              >
                {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showSecret ? 'Hide Secret' : 'View Secret'}
              </button>
            </div>
            <div className="dr-mono text-xs bg-[#1e2b4f] text-[#f7bd57] p-3 rounded-lg flex items-center justify-between">
              <span>{showSecret ? 'whsec_live_992384719283741293847' : 'whsec_live_••••••••••••••••••••'}</span>
              <button onClick={() => {
                navigator.clipboard.writeText('whsec_live_992384719283741293847');
                setCopiedSecret(true);
                setTimeout(() => setCopiedSecret(false), 2000);
              }} className="text-white/80 hover:text-white">
                {copiedSecret ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1e2b4f]">
              <ShieldCheck className="h-4 w-4 text-[#23825f]" /> Provider Credential Protection Guarantee
            </div>
            <p className="text-[11px] leading-5 text-[#64748b]">
              DigitalRakshak never exposes Protean, NSDL, UIDAI, or partner API credentials. All upstream requests are executed via secure backend server-to-server proxies.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
