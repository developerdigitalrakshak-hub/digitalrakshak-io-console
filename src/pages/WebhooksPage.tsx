import React, { useState } from 'react';
import { MoreHorizontal, Plus, Send, Webhook as WebhookIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getListWebhooksQueryKey, useCreateWebhook, useListWebhooks
} from '@workspace/api-client-react';
import type { Webhook } from '@workspace/api-client-react';
import {
  Btn, Empty, LoadingRows, PageHeader, QueryError, Status, ago
} from '@/components/common';

export function WebhooksPage() {
  const hooks = useListWebhooks();
  const create = useCreateWebhook();
  const client = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState('verification.completed, verification.failed');

  const rows = (hooks.data ?? []) as Webhook[];

  const submit = () => {
    if (!url.trim()) return;
    create.mutate(
      { data: { url, events: events.split(',').map(x => x.trim()).filter(Boolean) } },
      {
        onSuccess: () => {
          setUrl('');
          setShowForm(false);
          client.invalidateQueries({ queryKey: getListWebhooksQueryKey() });
        }
      }
    );
  };

  return (
    <div className="dr-in w-full">
      <PageHeader
        eyebrow="Workspace / Webhooks"
        title="Push results where work happens."
        copy="Receive signed, observable events whenever a verification changes state."
        actions={<Btn icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowForm(v => !v)}>Add endpoint</Btn>}
      />

      {showForm && (
        <div className="dr-card dr-shadow mb-5 p-5">
          <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_auto] md:items-end">
            <label>
              <span className="mb-1.5 block text-[11px] font-bold text-[#53627a]">Endpoint URL</span>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                data-testid="input-webhook-url"
                placeholder="https://api.yourcompany.com/hooks"
                className="h-10 w-full rounded-lg border border-[#d6dfe9] bg-white px-3 text-xs outline-none focus:border-[#637da8]"
              />
            </label>
            <label>
              <span className="mb-1.5 block text-[11px] font-bold text-[#53627a]">Events, comma separated</span>
              <input
                value={events}
                onChange={e => setEvents(e.target.value)}
                data-testid="input-webhook-events"
                className="h-10 w-full rounded-lg border border-[#d6dfe9] bg-white px-3 text-xs outline-none focus:border-[#637da8]"
              />
            </label>
            <div className="flex gap-2">
              <Btn onClick={submit} disabled={create.isPending}>{create.isPending ? 'Adding…' : 'Add endpoint'}</Btn>
              <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}

      {hooks.isLoading ? (
        <LoadingRows count={3} />
      ) : hooks.isError ? (
        <QueryError retry={() => hooks.refetch()} />
      ) : rows.length === 0 ? (
        <Empty
          icon={WebhookIcon}
          title="No webhook endpoints"
          copy="Add an endpoint to receive verification outcomes in real time."
          action={<Btn onClick={() => setShowForm(true)} icon={<Plus className="h-3.5 w-3.5" />}>Add your first endpoint</Btn>}
        />
      ) : (
        <div className="space-y-3 w-full">
          {rows.map(row => (
            <div key={row.id} className="dr-card dr-shadow p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#eaf0f8] text-[#42618d]">
                    <WebhookIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#344664]">{row.url}</h3>
                      <Status tone={row.status === 'active' ? 'success' : 'warning'}>{row.status}</Status>
                    </div>
                    <p className="mt-1 dr-mono text-[10px] text-[#8b96a6]">
                      {row.secretHint ?? 'Secret configured'} · Last delivery {row.lastDelivery ? ago(row.lastDelivery) : 'never'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Btn variant="outline" icon={<Send className="h-3.5 w-3.5" />} onClick={() => alert('Test delivery sent in demo mode.')}>
                    Send test
                  </Btn>
                  <button className="rounded-md p-2 text-[#9ba5b3] hover:bg-[#f1f4f8]" data-testid={`button-webhook-menu-${row.id}`}>
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#edf0f4] pt-4">
                <span className="dr-label mr-1 text-[#8c97a7]">Subscribed events</span>
                {row.events.map(event => (
                  <span key={event} className="rounded bg-[#f1f4f8] px-2 py-1 dr-mono text-[9px] text-[#64748a]">{event}</span>
                ))}
                <span className="ml-auto text-[10px] text-[#8b96a6]">{row.deliveries} deliveries</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
