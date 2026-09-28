import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// --- Types ---
export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  tone: 'success' | 'warning' | 'danger' | 'info';
  type?: 'key' | 'verification' | 'system';
}

export interface ApiKey {
  id: string;
  name: string;
  environment: 'test' | 'production';
  maskedKey: string;
  secret?: string;
  createdAt: string;
  lastUsed?: string | null;
  usage: number;
}

export interface ApiLog {
  requestId: string;
  service: string;
  method: string;
  endpoint: string;
  status: string;
  responseTime: number;
  credits: number;
  createdAt: string;
  environment?: 'production' | 'test';
  amount?: number;
  requestParams?: Record<string, any>;
  responseBody?: Record<string, any>;
}

export interface VerificationRequest {
  requestId: string;
  service: string;
  candidate: string;
  status: 'verified' | 'failed' | 'pending' | 'success';
  amount: number;
  createdAt: string;
  result?: string;
}

export interface VerificationService {
  slug: string;
  name: string;
  category: string;
  description: string;
  status: 'active' | 'maintenance' | 'deprecated';
  price: number;
  method: string;
  endpoint: string;
  version: string;
  fields: string[];
}

export interface WalletTransaction {
  id: string;
  description: string;
  reference: string;
  date: string;
  createdAt?: string;
  status: 'completed' | 'pending' | 'failed';
  amount: number;
  type: 'credit' | 'debit';
  balance: number;
  balanceAfter?: number;
}

export interface Webhook {
  id: string;
  url: string;
  status: 'active' | 'inactive';
  secretHint?: string;
  lastDelivery?: string | null;
  events: string[];
  deliveries: number;
}

// --- Initial Mock Data State ---
const INITIAL_KEYS: ApiKey[] = [
  { id: 'key_1', name: 'Production Backend', environment: 'production', maskedKey: 'dr_live_••••89a2', createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), lastUsed: new Date(Date.now() - 3600000 * 2).toISOString(), usage: 14820 },
  { id: 'key_2', name: 'Staging Environment', environment: 'test', maskedKey: 'dr_test_••••4f12', createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), lastUsed: new Date(Date.now() - 3600000 * 12).toISOString(), usage: 1250 }
];

const INITIAL_SERVICES: VerificationService[] = [
  { slug: 'pan-verify', name: 'PAN Verification', category: 'Identity', description: 'Instant validation of Permanent Account Number against NSDL/ITD databases.', status: 'active', price: 2.50, method: 'POST', endpoint: '/v1/verify/pan', version: 'v1.2', fields: ['pan', 'name', 'dob'] },
  { slug: 'aadhaar-okyc', name: 'Aadhaar OKYC', category: 'Identity', description: 'OTP-based offline Aadhaar verification with demographic details.', status: 'active', price: 3.00, method: 'POST', endpoint: '/v1/verify/aadhaar', version: 'v2.0', fields: ['aadhaarNumber', 'otp'] },
  { slug: 'bank-penny-drop', name: 'Bank Account Penny Drop', category: 'Financial', description: 'Real-time bank account ownership check via IMPS penny drop.', status: 'active', price: 4.00, method: 'POST', endpoint: '/v1/verify/bank-account', version: 'v1.0', fields: ['accountNumber', 'ifsc'] },
  { slug: 'gstin-check', name: 'GSTIN Search & Verify', category: 'Business', description: 'Validate GST identification number, filing status, and business address.', status: 'active', price: 5.00, method: 'POST', endpoint: '/v1/verify/gstin', version: 'v1.1', fields: ['gstin'] }
];

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  { id: 'tx_101', description: 'Wallet Top-up (Razorpay)', reference: 'pay_P39k2fks', date: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'completed', amount: 5000, type: 'credit', balance: 18420 },
  { id: 'tx_100', description: 'Batch Verification Usage', reference: 'usage_batch_99', date: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'completed', amount: 1580, type: 'debit', balance: 13420 }
];

const INITIAL_WEBHOOKS: Webhook[] = [
  { id: 'wh_1', url: 'https://api.asterco.com/webhooks/digitalrakshak', status: 'active', secretHint: 'whsec_••••9f2a', lastDelivery: new Date(Date.now() - 1800000).toISOString(), events: ['verification.completed', 'verification.failed'], deliveries: 418 }
];

const INITIAL_LOGS: ApiLog[] = [
  {
    requestId: 'vrq_7f2d91c8',
    service: 'PAN Verification',
    method: 'POST',
    endpoint: '/v1/verify/pan',
    status: '200 OK',
    responseTime: 184,
    credits: 1,
    amount: 2.50,
    environment: 'production',
    createdAt: new Date(Date.now() - 300000).toISOString(),
    requestParams: { pan: 'ABCDE1234F', name: 'Aarav Mehta', dob: '1990-05-15' },
    responseBody: { status: 'VALID', panStatus: 'EXISTING_OPERATIONAL', nameMatched: true, matchScore: 98 }
  },
  {
    requestId: 'vrq_6e1c80b7',
    service: 'Bank Account Penny Drop',
    method: 'POST',
    endpoint: '/v1/verify/bank-account',
    status: '200 OK',
    responseTime: 310,
    credits: 2,
    amount: 4.00,
    environment: 'production',
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    requestParams: { accountNumber: '91823746192837', ifsc: 'HDFC0001234', beneficiaryName: 'Priya Sharma' },
    responseBody: { status: 'VERIFIED', accountActive: true, beneficiaryNameMatched: true, rrn: '329847192834' }
  },
  {
    requestId: 'vrq_5d0a79a6',
    service: 'Aadhaar OKYC',
    method: 'POST',
    endpoint: '/v1/verify/aadhaar',
    status: '200 OK',
    responseTime: 420,
    credits: 1,
    amount: 3.00,
    environment: 'production',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    requestParams: { aadhaarNumber: '548291038472', otp: '782910' },
    responseBody: { status: 'VERIFIED', addressMatched: true, state: 'Maharashtra', pincode: '400001' }
  },
  {
    requestId: 'vrq_4c9b68f5',
    service: 'GSTIN Search & Verify',
    method: 'POST',
    endpoint: '/v1/verify/gstin',
    status: '400 Bad Request',
    responseTime: 95,
    credits: 0,
    amount: 0.00,
    environment: 'test',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    requestParams: { gstin: '27AAAAA0000A1Z5' },
    responseBody: { error: 'INVALID_GSTIN_FORMAT', message: 'GSTIN checksum validation failed in test sandbox.' }
  },
  {
    requestId: 'vrq_3b8a57e4',
    service: 'PAN Verification',
    method: 'POST',
    endpoint: '/v1/verify/pan',
    status: '200 OK',
    responseTime: 165,
    credits: 1,
    amount: 2.50,
    environment: 'test',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    requestParams: { pan: 'XYZPD9876Q', name: 'Rohan Verma' },
    responseBody: { status: 'VALID', panStatus: 'EXISTING_OPERATIONAL', nameMatched: true, matchScore: 100 }
  }
];

const INITIAL_REQUESTS: VerificationRequest[] = [
  { requestId: 'vrq_7f2d91c8', service: 'PAN Verification', candidate: 'Aarav Mehta', status: 'verified', amount: 2.50, createdAt: new Date(Date.now() - 300000).toISOString(), result: 'Valid PAN record matched' },
  { requestId: 'vrq_6e1c80b7', service: 'Bank Account Penny Drop', candidate: 'Priya Sharma', status: 'verified', amount: 4.00, createdAt: new Date(Date.now() - 1200000).toISOString(), result: 'Account Active (Name Match: 98%)' }
];

const INITIAL_ACTIVITY: ActivityItem[] = [
  { id: 'act_1', title: 'PAN Verification executed', description: 'vrq_7f2d91c8 matched successfully', timestamp: new Date(Date.now() - 300000).toISOString(), tone: 'success', type: 'verification' },
  { id: 'act_2', title: 'New API key generated', description: 'Staging Environment created by Admin', timestamp: new Date(Date.now() - 86400000).toISOString(), tone: 'info', type: 'key' }
];

// Local state helpers
function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`dr_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T) {
  try {
    localStorage.setItem(`dr_${key}`, JSON.stringify(value));
  } catch {}
}

// --- Query Keys ---
export const getGetDashboardSummaryQueryKey = () => ['dashboard', 'summary'];
export const getGetDashboardActivityQueryKey = () => ['dashboard', 'activity'];
export const getGetWalletQueryKey = () => ['wallet'];
export const getListWalletTransactionsQueryKey = (params?: any) => ['wallet', 'transactions', params];
export const getListApiKeysQueryKey = () => ['keys'];
export const getListServicesQueryKey = () => ['services'];
export const getGetServiceQueryKey = (slug?: string) => ['services', slug];
export const getGetUsageSummaryQueryKey = () => ['usage', 'summary'];
export const getGetUsageTimeseriesQueryKey = () => ['usage', 'timeseries'];
export const getListApiLogsQueryKey = () => ['logs'];
export const getListVerificationRequestsQueryKey = (params?: any) => ['requests', params];
export const getListWebhooksQueryKey = () => ['webhooks'];

// --- Query & Mutation Hooks ---

export function useGetDashboardSummary() {
  return useQuery({
    queryKey: getGetDashboardSummaryQueryKey(),
    queryFn: async () => {
      const wallet = getStored('wallet', { balance: 18420 });
      return {
        walletBalance: wallet.balance,
        lowBalance: wallet.balance < 2000,
        totalRequests: 24892,
        successfulRequests: 24344,
        successRate: 97.8,
        currentMonthUsage: 38400,
        totalSpent: 142500,
        failedRequests: 548
      };
    }
  });
}

export function useGetDashboardActivity() {
  return useQuery({
    queryKey: getGetDashboardActivityQueryKey(),
    queryFn: async () => getStored('activity', INITIAL_ACTIVITY)
  });
}

export function useGetWallet() {
  return useQuery({
    queryKey: getGetWalletQueryKey(),
    queryFn: async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('dr_token');
        const res = await fetch('/api/v1/client/wallet', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const json = await res.json();
          if (json.status && json.data) {
            return {
              balance: json.data.balance,
              availableBalance: json.data.available_balance,
              currency: json.data.currency || 'INR',
              lowBalanceThreshold: json.data.low_balance_threshold || 2000,
              totalPurchased: json.data.total_purchased,
              totalSpent: json.data.total_spent,
              status: json.data.status
            };
          }
        }
      } catch (e) {}

      return getStored('wallet', {
        balance: 18420,
        currency: 'INR',
        lowBalanceThreshold: 2000,
        totalPurchased: 150000,
        totalSpent: 131580
      });
    }
  });
}

export function useListWalletTransactions(params?: { limit?: number }) {
  return useQuery({
    queryKey: getListWalletTransactionsQueryKey(params),
    queryFn: async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('dr_token');
        const query = params?.limit ? `?per_page=${params.limit}` : '';
        const res = await fetch(`/api/v1/client/wallet/transactions${query}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const json = await res.json();
          const items = json.data?.list || json.data?.items || json.data;
          if (Array.isArray(items)) {
            return items.map((tx: any) => ({
              id: String(tx.id || tx.transaction_reference),
              description: tx.description || 'Wallet Transaction',
              reference: tx.transaction_reference || tx.razorpay_payment_id || '—',
              date: tx.created_at,
              createdAt: tx.created_at,
              status: (tx.status || 'completed').toLowerCase(),
              amount: Number(tx.amount || 0),
              type: (tx.type || tx.direction || 'credit').toLowerCase() === 'credit' ? 'credit' : 'debit',
              balance: Number(tx.balance_after || tx.balance || 0),
              balanceAfter: Number(tx.balance_after || tx.balance || 0)
            }));
          }
        }
      } catch (e) {}

      const txs = getStored('transactions', INITIAL_TRANSACTIONS);
      return params?.limit ? txs.slice(0, params.limit) : txs;
    }
  });
}

export function useCreateTopup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { data: { amount: number } }) => {
      const amount = payload.data.amount;
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('dr_token');
        const res = await fetch('/api/v1/client/wallet/topup/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ amount })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.status && json.data) {
            return json.data;
          }
        }
      } catch (e) {}

      // Mock Fallback
      const currentWallet = getStored('wallet', { balance: 18420, currency: 'INR', lowBalanceThreshold: 2000, totalPurchased: 150000, totalSpent: 131580 });
      const newWallet = {
        ...currentWallet,
        balance: currentWallet.balance + amount,
        totalPurchased: currentWallet.totalPurchased + amount
      };
      setStored('wallet', newWallet);

      const txs = getStored('transactions', INITIAL_TRANSACTIONS);
      const newTx: WalletTransaction = {
        id: `tx_${Date.now()}`,
        description: 'Wallet Top-up (Manual)',
        reference: `topup_${Math.random().toString(36).substring(2, 9)}`,
        date: new Date().toISOString(),
        status: 'completed',
        amount,
        type: 'credit',
        balance: newWallet.balance
      };
      setStored('transactions', [newTx, ...txs]);
      return newTx;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListWalletTransactionsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    }
  });
}

export function useVerifyTopup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature?: string; reference?: string }) => {
      const token = localStorage.getItem('token') || localStorage.getItem('dr_token');
      const res = await fetch('/api/v1/client/wallet/topup/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Payment verification failed.');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListWalletTransactionsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    }
  });
}

export function usePayOrderWithWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { orderId: number | string }) => {
      const token = localStorage.getItem('token') || localStorage.getItem('dr_token');
      const res = await fetch(`/api/v1/client/orders/${payload.orderId}/pay-with-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Wallet payment failed.');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListWalletTransactionsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    }
  });
}

export function useGetPaymentOptions(orderId: number | string | null) {
  return useQuery({
    queryKey: ['order', orderId, 'payment-options'],
    queryFn: async () => {
      if (!orderId) return null;
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('dr_token');
        const res = await fetch(`/api/v1/client/orders/${orderId}/payment-options`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const json = await res.json();
          return json.data;
        }
      } catch (e) {}
      return null;
    },
    enabled: !!orderId
  });
}

export function useListApiKeys() {
  return useQuery({
    queryKey: getListApiKeysQueryKey(),
    queryFn: async () => getStored('keys', INITIAL_KEYS)
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { data: { name: string; environment: 'test' | 'production' } }) => {
      const { name, environment } = payload.data;
      const prefix = environment === 'production' ? 'dr_live_' : 'dr_test_';
      const secret = `${prefix}${Math.random().toString(36).substring(2, 14)}${Math.random().toString(36).substring(2, 14)}`;
      const maskedKey = `${prefix}••••${secret.slice(-4)}`;
      
      const keys = getStored('keys', INITIAL_KEYS);
      const newKey: ApiKey = {
        id: `key_${Date.now()}`,
        name,
        environment,
        maskedKey,
        secret,
        createdAt: new Date().toISOString(),
        lastUsed: null,
        usage: 0
      };
      setStored('keys', [newKey, ...keys]);
      return newKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListApiKeysQueryKey() });
    }
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string }) => {
      const keys = getStored<ApiKey[]>('keys', INITIAL_KEYS);
      const updated = keys.map(k => k.id === payload.id ? { ...k, status: 'revoked' } : k);
      setStored('keys', updated);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListApiKeysQueryKey() });
    }
  });
}

export function useRegenerateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string }) => {
      const keys = getStored<ApiKey[]>('keys', INITIAL_KEYS);
      const target = keys.find(k => k.id === payload.id);
      if (!target) throw new Error('API key not found');
      
      const prefix = target.environment === 'production' ? 'dr_live_' : 'dr_test_';
      const secret = `${prefix}${Math.random().toString(36).substring(2, 14)}${Math.random().toString(36).substring(2, 14)}`;
      const maskedKey = `${prefix}••••${secret.slice(-4)}`;
      
      const updated = keys.map(k => k.id === payload.id ? { ...k, maskedKey, secret, createdAt: new Date().toISOString() } : k);
      setStored('keys', updated);
      return { ...target, secret, maskedKey };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListApiKeysQueryKey() });
    }
  });
}

export function useListServices() {
  return useQuery({
    queryKey: getListServicesQueryKey(),
    queryFn: async () => getStored('services', INITIAL_SERVICES)
  });
}

export function useGetService(slug?: string, _options?: any) {
  return useQuery({
    queryKey: getGetServiceQueryKey(slug),
    enabled: !!slug,
    queryFn: async () => {
      const services = getStored<VerificationService[]>('services', INITIAL_SERVICES);
      return services.find(s => s.slug === slug) || null;
    }
  });
}

export function useGetUsageSummary() {
  return useQuery({
    queryKey: getGetUsageSummaryQueryKey(),
    queryFn: async () => ({
      totalRequests: 24892,
      successRate: 97.8,
      successCount: 24344,
      failedCount: 548,
      creditsConsumed: 38400,
      averageResponseTime: 194
    })
  });
}

export function useGetUsageTimeseries() {
  return useQuery({
    queryKey: getGetUsageTimeseriesQueryKey(),
    queryFn: async () => [
      { label: 'Mon', requests: 320, credits: 450 },
      { label: 'Tue', requests: 480, credits: 620 },
      { label: 'Wed', requests: 510, credits: 710 },
      { label: 'Thu', requests: 640, credits: 890 },
      { label: 'Fri', requests: 590, credits: 810 },
      { label: 'Sat', requests: 380, credits: 520 },
      { label: 'Sun', requests: 410, credits: 580 }
    ]
  });
}

export function useListApiLogs(params?: { limit?: number }) {
  return useQuery({
    queryKey: getListApiLogsQueryKey(),
    queryFn: async () => {
      const logs = getStored<ApiLog[]>('logs', INITIAL_LOGS);
      return params?.limit ? logs.slice(0, params.limit) : logs;
    }
  });
}

export function useListVerificationRequests(params?: { limit?: number }) {
  return useQuery({
    queryKey: getListVerificationRequestsQueryKey(params),
    queryFn: async () => {
      const reqs = getStored<VerificationRequest[]>('requests', INITIAL_REQUESTS);
      return params?.limit ? reqs.slice(0, params.limit) : reqs;
    }
  });
}

export interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  event: string;
  timestamp: string;
  status: 'delivered' | 'failed';
  responseCode: number;
  attempts: number;
  durationMs: number;
}

const INITIAL_WEBHOOK_DELIVERIES: WebhookDeliveryLog[] = [
  { id: 'del_101', webhookId: 'wh_1', event: 'verification.completed', timestamp: new Date(Date.now() - 1800000).toISOString(), status: 'delivered', responseCode: 200, attempts: 1, durationMs: 142 },
  { id: 'del_100', webhookId: 'wh_1', event: 'verification.failed', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), status: 'delivered', responseCode: 200, attempts: 1, durationMs: 188 },
  { id: 'del_099', webhookId: 'wh_1', event: 'wallet.low_balance', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'failed', responseCode: 504, attempts: 3, durationMs: 5000 },
  { id: 'del_098', webhookId: 'wh_1', event: 'wallet.topup.success', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'delivered', responseCode: 200, attempts: 1, durationMs: 95 }
];

export function useListWebhooks() {
  return useQuery({
    queryKey: getListWebhooksQueryKey(),
    queryFn: async () => getStored('webhooks', INITIAL_WEBHOOKS)
  });
}

export function useListWebhookDeliveries(webhookId?: string) {
  return useQuery({
    queryKey: ['webhooks', 'deliveries', webhookId],
    queryFn: async () => {
      const deliveries = getStored<WebhookDeliveryLog[]>('webhook_deliveries', INITIAL_WEBHOOK_DELIVERIES);
      return webhookId ? deliveries.filter(d => d.webhookId === webhookId) : deliveries;
    }
  });
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { data: { url: string; events: string[] } }) => {
      const { url, events } = payload.data;
      const hooks = getStored<Webhook[]>('webhooks', INITIAL_WEBHOOKS);
      const newHook: Webhook = {
        id: `wh_${Date.now()}`,
        url,
        status: 'active',
        secretHint: `whsec_••••${Math.random().toString(36).substring(2, 6)}`,
        lastDelivery: null,
        events,
        deliveries: 0,
        createdAt: new Date().toISOString()
      };
      setStored('webhooks', [newHook, ...hooks]);
      return newHook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListWebhooksQueryKey() });
    }
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; url: string; events: string[] }) => {
      const hooks = getStored<Webhook[]>('webhooks', INITIAL_WEBHOOKS);
      const updated = hooks.map(h => h.id === payload.id ? { ...h, url: payload.url, events: payload.events } : h);
      setStored('webhooks', updated);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListWebhooksQueryKey() });
    }
  });
}

export function useToggleWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; status: 'active' | 'inactive' }) => {
      const hooks = getStored<Webhook[]>('webhooks', INITIAL_WEBHOOKS);
      const updated = hooks.map(h => h.id === payload.id ? { ...h, status: payload.status } : h);
      setStored('webhooks', updated);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListWebhooksQueryKey() });
    }
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string }) => {
      const hooks = getStored<Webhook[]>('webhooks', INITIAL_WEBHOOKS);
      // ONLY delete endpoint config, NEVER delete historical webhook_deliveries
      const updated = hooks.filter(h => h.id !== payload.id);
      setStored('webhooks', updated);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListWebhooksQueryKey() });
    }
  });
}

export function useSendTestWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { webhookId: string }) => {
      const deliveries = getStored<WebhookDeliveryLog[]>('webhook_deliveries', INITIAL_WEBHOOK_DELIVERIES);
      const newDelivery: WebhookDeliveryLog = {
        id: `del_${Date.now()}`,
        webhookId: payload.webhookId,
        event: 'verification.completed',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        responseCode: 200,
        attempts: 1,
        durationMs: Math.floor(Math.random() * 120) + 80
      };
      setStored('webhook_deliveries', [newDelivery, ...deliveries]);

      // update last delivery on webhook
      const hooks = getStored<Webhook[]>('webhooks', INITIAL_WEBHOOKS);
      const updated = hooks.map(h => h.id === payload.webhookId ? {
        ...h,
        lastDelivery: newDelivery.timestamp,
        deliveries: (h.deliveries || 0) + 1
      } : h);
      setStored('webhooks', updated);
      return newDelivery;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListWebhooksQueryKey() });
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'deliveries'] });
    }
  });
}

export function useVerifyPan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { data: { pan: string; name: string } }) => {
      const requestId = `vrq_${Math.random().toString(36).substring(2, 10)}`;
      const success = true;

      // add to requests
      const reqs = getStored<VerificationRequest[]>('requests', INITIAL_REQUESTS);
      const newReq: VerificationRequest = {
        requestId,
        service: 'PAN Verification',
        candidate: payload.data.name || 'Sample Candidate',
        status: 'verified',
        amount: 2.50,
        createdAt: new Date().toISOString(),
        result: `Match confirmed for ${payload.data.pan}`
      };
      setStored('requests', [newReq, ...reqs]);

      // add to logs
      const logs = getStored<ApiLog[]>('logs', INITIAL_LOGS);
      const newLog: ApiLog = {
        requestId,
        service: 'PAN Verification',
        method: 'POST',
        endpoint: '/v1/verify/pan',
        status: '200 OK',
        responseTime: Math.floor(Math.random() * 150) + 100,
        credits: 1,
        createdAt: new Date().toISOString()
      };
      setStored('logs', [newLog, ...logs]);

      // update wallet
      const currentWallet = getStored('wallet', { balance: 18420, currency: 'INR', lowBalanceThreshold: 2000, totalPurchased: 150000, totalSpent: 131580 });
      setStored('wallet', {
        ...currentWallet,
        balance: Math.max(0, currentWallet.balance - 2.50),
        totalSpent: currentWallet.totalSpent + 2.50
      });

      return {
        requestId,
        success,
        data: { status: 'verified', pan: payload.data.pan, name: payload.data.name },
        billing: { creditsUsed: 1 }
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListVerificationRequestsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListApiLogsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
    }
  });
}
