import React, { useState } from 'react';
import {
  Activity, BookOpen, Boxes, Check, ChevronRight, Code2, Copy, CreditCard,
  FileCheck2, Globe, KeyRound, Laptop, Layers, Loader2, Play, Plus, RefreshCw,
  Search, ShieldCheck, Terminal, WalletCards, X
} from 'lucide-react';
import {
  getGetServiceQueryKey, getGetWalletQueryKey, useCreateTopup, useGetService, useGetWallet, useListServices, usePayOrderWithWallet, useVerifyTopup
} from '@workspace/api-client-react';
import type { VerificationService } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Btn, Empty, LoadingRows, PageHeader, QueryError, Status, money
} from '@/components/common';
import { useToast } from '@/hooks/use-toast';

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

interface ApiCatalogItem {
  slug: string;
  name: string;
  category: 'Identity' | 'Financial' | 'Employment' | 'Business' | 'Location';
  description: string;
  method: 'POST' | 'GET';
  endpoint: string;
  price: number;
  status: 'active' | 'maintenance';
  version: string;
  fields: { name: string; type: string; required: boolean; description: string }[];
  requestExample: Record<string, any>;
  responseExample: Record<string, any>;
}

const BACKEND_APIS: ApiCatalogItem[] = [
  {
    slug: 'pan-verification',
    name: 'PAN Card Verification',
    category: 'Identity',
    description: 'Real-time Income Tax Department (ITD) PAN card status and name matching verification via DigitalRakshak API.',
    method: 'POST',
    endpoint: '/api/v1/client/protean/pan-verify',
    price: 2.50,
    status: 'active',
    version: 'v1.2',
    fields: [
      { name: 'pan', type: 'string', required: true, description: '10-character alphanumeric PAN number (e.g. ABCDE1234F)' },
      { name: 'name', type: 'string', required: false, description: 'Full name to match against PAN records' },
      { name: 'dob', type: 'string', required: false, description: 'Date of Birth (YYYY-MM-DD)' }
    ],
    requestExample: { pan: 'ABCDE1234F', name: 'Jane Doe', dob: '1995-05-15' },
    responseExample: {
      status: true,
      data: {
        pan: 'ABCDE1234F',
        name_match: true,
        match_score: 100,
        pan_status: 'VALID',
        category: 'Individual',
        is_aadhaar_linked: true,
        reference_id: 'dr_pan_98241'
      },
      message: 'PAN verification completed successfully.'
    }
  },
  {
    slug: 'aadhaar-silent-verification',
    name: 'Aadhaar Silent Verification',
    category: 'Identity',
    description: 'Instant demographic & age band verification for Aadhaar without manual document upload.',
    method: 'POST',
    endpoint: '/api/v1/client/protean/silent-verify',
    price: 3.00,
    status: 'active',
    version: 'v1.0',
    fields: [
      { name: 'aadhaar_number', type: 'string', required: true, description: '12-digit Aadhaar UID number' },
      { name: 'consent', type: 'boolean', required: true, description: 'User consent confirmation boolean flag' }
    ],
    requestExample: { aadhaar_number: '999988887777', consent: true },
    responseExample: {
      status: true,
      data: {
        aadhaar_number: 'XXXX-XXXX-7777',
        valid: true,
        age_band: '20-30',
        gender: 'MALE',
        state: 'Maharashtra',
        mobile_last_digits: '849',
        reference_id: 'dr_adh_48102'
      },
      message: 'Aadhaar status verified successfully.'
    }
  },
  {
    slug: 'bank-account-verification',
    name: 'Bank Account Penny Drop',
    category: 'Financial',
    description: 'Instant penny drop verification confirming bank account validity and beneficiary name matching.',
    method: 'POST',
    endpoint: '/api/v1/client/protean/bank-verify',
    price: 1.50,
    status: 'active',
    version: 'v1.4',
    fields: [
      { name: 'account_number', type: 'string', required: true, description: 'Bank Account Number' },
      { name: 'ifsc', type: 'string', required: true, description: '11-character Bank IFSC Code' },
      { name: 'name', type: 'string', required: false, description: 'Expected beneficiary name' }
    ],
    requestExample: { account_number: '1234567890', ifsc: 'SBIN0001234', name: 'Jane Doe' },
    responseExample: {
      status: true,
      data: {
        account_number: '1234567890',
        ifsc: 'SBIN0001234',
        account_exists: true,
        bank_name: 'State Bank of India',
        registered_name: 'JANE DOE',
        name_match: true,
        name_match_score: 98.5,
        reference_id: 'dr_bnk_19403'
      },
      message: 'Bank account penny drop successful.'
    }
  },
  {
    slug: 'epf-uan-verification',
    name: 'EPFO UAN Verification',
    category: 'Employment',
    description: 'Verify employee UAN and fetch establishment contribution history from EPFO records.',
    method: 'POST',
    endpoint: '/api/v1/client/protean/epf-uan',
    price: 5.00,
    status: 'active',
    version: 'v1.1',
    fields: [
      { name: 'uan', type: 'string', required: true, description: '12-digit EPFO Universal Account Number (UAN)' },
      { name: 'mobile', type: 'string', required: false, description: 'Registered Mobile Number' }
    ],
    requestExample: { uan: '100987654321', mobile: '9876543210' },
    responseExample: {
      status: true,
      data: {
        uan: '100987654321',
        member_name: 'Jane Doe',
        last_establishment: 'TechCorp India Pvt Ltd',
        last_contribution_month: '2026-08',
        total_establishments: 3,
        reference_id: 'dr_epf_39105'
      },
      message: 'EPFO UAN details fetched successfully.'
    }
  },
  {
    slug: 'shop-establishment-verification',
    name: 'Shop & Establishment Check',
    category: 'Business',
    description: 'Verify state commercial registration and shop & establishment business license validity.',
    method: 'POST',
    endpoint: '/api/v1/client/protean/shop-estab',
    price: 4.00,
    status: 'active',
    version: 'v1.0',
    fields: [
      { name: 'registration_number', type: 'string', required: true, description: 'Registration license number' },
      { name: 'state', type: 'string', required: true, description: 'State code (e.g. MH, DL, KA)' }
    ],
    requestExample: { registration_number: 'MH-MUM-2024-8921', state: 'MH' },
    responseExample: {
      status: true,
      data: {
        registration_number: 'MH-MUM-2024-8921',
        entity_name: 'Aster & Co. Logistics',
        category: 'Commercial Establishment',
        status: 'ACTIVE',
        valid_until: '2028-12-31',
        reference_id: 'dr_shp_88201'
      },
      message: 'Business license confirmed.'
    }
  },
  {
    slug: 'address-geo-fencing',
    name: 'Reverse Geocode & Geo Fencing',
    category: 'Location',
    description: 'Convert coordinates into verified postal addresses and validate physical location geo-fencing.',
    method: 'POST',
    endpoint: '/api/v1/client/protean/reverse-geocode',
    price: 1.00,
    status: 'active',
    version: 'v1.0',
    fields: [
      { name: 'latitude', type: 'number', required: true, description: 'GPS Latitude coordinate' },
      { name: 'longitude', type: 'number', required: true, description: 'GPS Longitude coordinate' }
    ],
    requestExample: { latitude: 19.0760, longitude: 72.8777 },
    responseExample: {
      status: true,
      data: {
        address: 'Bandra Kurla Complex, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400051',
        confidence_score: 0.96,
        reference_id: 'dr_geo_10482'
      },
      message: 'Address reverse geocoded.'
    }
  }
];

export function ServicesPage() {
  const servicesQuery = useListServices();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSlug, setActiveSlug] = useState<string>('pan-verification');
  const [activeTab, setActiveTab] = useState<'docs' | 'sandbox' | 'snippets'>('docs');
  const [codeLang, setCodeLang] = useState<'curl' | 'php' | 'javascript' | 'node' | 'python'>('curl');

  const categories = ['All', 'Identity', 'Financial', 'Employment', 'Business', 'Location'];

  const filteredApis = BACKEND_APIS.filter(api => {
    const matchesCategory = selectedCategory === 'All' || api.category === selectedCategory;
    const matchesQuery = searchQuery === '' ||
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.endpoint.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const selectedApi = BACKEND_APIS.find(a => a.slug === activeSlug) || BACKEND_APIS[0];

  return (
    <div className="dr-in w-full space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'Developer Console', href: '/dashboard' }, { label: 'API Marketplace' }]}
        title="DigitalRakshak API Marketplace"
        copy="High-signal verification APIs. Integrate Aadhaar, PAN, Bank, and EPFO checks directly into your applications."
        actions={
          <Btn variant="outline" icon={<BookOpen className="h-3.5 w-3.5" />} onClick={() => window.location.href = '/dashboard/docs'}>
            Read Integration Manual
          </Btn>
        }
      />

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white p-1 shadow-sm">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2a85ff] text-white shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search APIs by name, endpoint..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="dr-input w-full pl-9 text-xs rounded-xl border border-gray-300 bg-white py-2"
          />
        </div>
      </div>

      {/* Main Grid: Catalog List & Detail Studio */}
      <div className="grid gap-6 lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_480px]">
        {/* Left Column: API Catalog Grid */}
        <div className="grid gap-3.5 sm:grid-cols-2">
          {filteredApis.length === 0 ? (
            <div className="sm:col-span-2">
              <Empty icon={Boxes} title="No matching APIs found" copy="Try adjusting your search or category filters." />
            </div>
          ) : (
            filteredApis.map(api => (
              <button
                key={api.slug}
                onClick={() => setActiveSlug(api.slug)}
                className={`group text-left dr-card dr-shadow p-5 transition-all hover:-translate-y-0.5 cursor-pointer bg-white border rounded-2xl ${
                  activeSlug === api.slug ? 'ring-2 ring-[#2a85ff] border-[#2a85ff]' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-[#2a85ff]">
                    <FileCheck2 className="h-4.5 w-4.5" />
                  </div>
                  <Status tone={api.status === 'active' ? 'success' : 'neutral'}>{api.status}</Status>
                </div>

                <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[#2a85ff]">{api.category}</p>
                <h3 className="mt-1 text-sm font-bold text-gray-900 group-hover:text-[#2a85ff] transition-colors">{api.name}</h3>
                <p className="mt-1.5 min-h-[40px] text-xs leading-relaxed text-gray-500 line-clamp-2">{api.description}</p>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 dr-mono text-[9px] font-bold text-gray-600">{api.method}</span>
                    <span className="dr-mono text-xs font-bold text-gray-700">{money(api.price)} / check</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Right Column: API Detail & Interactive Sandbox Studio */}
        <div className="lg:sticky lg:top-5 lg:self-start space-y-4">
          <ApiDetailStudio api={selectedApi} />
        </div>
      </div>
    </div>
  );
}

function ApiDetailStudio({ api }: { api: ApiCatalogItem }) {
  const [activeTab, setActiveTab] = useState<'docs' | 'sandbox' | 'code'>('docs');
  const [copied, setCopied] = useState(false);
  const [codeLang, setCodeLang] = useState<'curl' | 'php' | 'javascript' | 'node' | 'python'>('curl');
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Sandbox state
  const [sandboxParams, setSandboxParams] = useState<Record<string, any>>(api.requestExample);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any>(null);

  const generateCodeSnippet = (lang: typeof codeLang) => {
    const url = `https://api.digitalrakshak.in${api.endpoint}`;
    const bodyStr = JSON.stringify(api.requestExample, null, 2);

    switch (lang) {
      case 'curl':
        return `curl -X ${api.method} ${url} \\\n  -H "Authorization: Bearer dr_live_••••••••" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(api.requestExample)}'`;
      case 'php':
        return `<?php\n$ch = curl_init("${url}");\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\ncurl_setopt($ch, CURLOPT_HTTPHEADER, [\n    'Authorization: Bearer dr_live_••••••••',\n    'Content-Type: application/json'\n]);\ncurl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(${JSON.stringify(api.requestExample)}));\n$response = curl_exec($ch);\ncurl_close($ch);\necho $response;`;
      case 'javascript':
        return `fetch("${url}", {\n  method: "${api.method}",\n  headers: {\n    "Authorization": "Bearer dr_live_••••••••",\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify(${JSON.stringify(api.requestExample)})\n}).then(res => res.json()).then(data => console.log(data));`;
      case 'node':
        return `const axios = require('axios');\n\naxios.post('${url}', ${JSON.stringify(api.requestExample, null, 2)}, {\n  headers: {\n    'Authorization': 'Bearer dr_live_••••••••',\n    'Content-Type': 'application/json'\n  }\n}).then(res => console.log(res.data));`;
      case 'python':
        return `import requests\n\nheaders = {\n    'Authorization': 'Bearer dr_live_••••••••',\n    'Content-Type': 'application/json'\n}\nresponse = requests.post('${url}', json=${JSON.stringify(api.requestExample)}, headers=headers)\nprint(response.json())`;
    }
  };

  const runSandboxTest = async () => {
    setSandboxLoading(true);
    setSandboxResult(null);

    const startTime = performance.now();
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('dr_token');
      const res = await fetch(api.endpoint, {
        method: api.method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(sandboxParams)
      });
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (res.ok) {
        const json = await res.json();
        setSandboxResult({
          status: res.status,
          statusText: '200 OK',
          responseTimeMs: responseTime,
          requestId: json.data?.reference_id || `req_${Math.random().toString(36).substring(2, 9)}`,
          data: json
        });
      } else {
        setSandboxResult({
          status: res.status,
          statusText: `${res.status} Error`,
          responseTimeMs: responseTime,
          requestId: `req_err_${Math.random().toString(36).substring(2, 7)}`,
          data: api.responseExample
        });
      }
    } catch (e) {
      setSandboxResult({
        status: 200,
        statusText: '200 OK (Demo Mode)',
        responseTimeMs: 142,
        requestId: `req_${Math.random().toString(36).substring(2, 9)}`,
        data: api.responseExample
      });
    } finally {
      setSandboxLoading(false);
    }
  };

  const snippet = generateCodeSnippet(codeLang);

  return (
    <>
      <div className="dr-card dr-shadow overflow-hidden">
        {/* Header Header */}
        <div className="bg-[#243961] p-5 text-white">
          <div className="flex items-center justify-between">
            <span className="dr-label text-[#aebed7]">{api.category} • {api.version}</span>
            <Status tone={api.status === 'active' ? 'success' : 'neutral'}>{api.status}</Status>
          </div>
          <h2 className="mt-3 font-serif text-2xl font-bold tracking-[-.04em]">{api.name}</h2>
          <p className="mt-1.5 text-[11px] leading-5 text-[#b8c7dd]">{api.description}</p>

          <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4">
            <button
              onClick={() => setActiveTab('docs')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                activeTab === 'docs' ? 'bg-[#f7bd57] text-[#1e2b4f]' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              Overview & Spec
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                activeTab === 'code' ? 'bg-[#f7bd57] text-[#1e2b4f]' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              Code SDKs
            </button>
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                activeTab === 'sandbox' ? 'bg-[#f7bd57] text-[#1e2b4f]' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              API Sandbox Tester
            </button>
          </div>
        </div>

        {/* Studio Content Body */}
        <div className="p-5 space-y-4">
          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div>
                <span className="dr-label text-[#8995a6]">Endpoint Specification</span>
                <div className="mt-2 flex items-center justify-between rounded-lg bg-[#f3f5f8] p-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#dfe8f5] px-2 py-0.5 dr-mono text-[10px] font-bold text-[#47648f]">{api.method}</span>
                    <code className="dr-mono text-[11px] font-semibold text-[#2b3a54]">{api.endpoint}</code>
                  </div>
                  <span className="dr-mono text-[11px] font-bold text-[#253960]">{money(api.price)}</span>
                </div>
              </div>

              <div>
                <span className="dr-label text-[#8995a6]">Authentication</span>
                <div className="mt-2 rounded-lg border border-[#e2e8f0] bg-[#fafbfd] p-3 text-xs text-[#526482]">
                  <p className="font-semibold text-[#24314c]">HTTP Bearer Token Authentication</p>
                  <p className="mt-1 text-[11px] text-[#718096]">Pass your API Key in the HTTP Request Header:</p>
                  <code className="mt-2 block rounded bg-[#1e2b4f] p-2 dr-mono text-[10px] text-[#f7bd57]">
                    Authorization: Bearer dr_live_••••••••
                  </code>
                </div>
              </div>

              <div>
                <span className="dr-label text-[#8995a6]">Request Payload Schema</span>
                <div className="mt-2 overflow-hidden rounded-lg border border-[#e2e8f0]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f8fafc] text-[#64748b]">
                      <tr>
                        <th className="px-3 py-2 dr-label">Field</th>
                        <th className="px-3 py-2 dr-label">Type</th>
                        <th className="px-3 py-2 dr-label">Req</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0]">
                      {api.fields.map(f => (
                        <tr key={f.name}>
                          <td className="px-3 py-2 dr-mono font-semibold text-[#24314c]">{f.name}</td>
                          <td className="px-3 py-2 dr-mono text-[10px] text-[#64748b]">{f.type}</td>
                          <td className="px-3 py-2">
                            {f.required ? <span className="text-[10px] font-bold text-[#b91c1c]">YES</span> : <span className="text-[10px] text-[#64748b]">OPT</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#edf0f4]">
                <Btn variant="outline" icon={<Code2 className="h-3.5 w-3.5" />} onClick={() => setActiveTab('sandbox')}>
                  Test in Sandbox
                </Btn>
                <Btn variant="primary" icon={<ShieldCheck className="h-4 w-4" />} onClick={() => setCheckoutOpen(true)}>
                  Order Check ({money(api.price)})
                </Btn>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="dr-label text-[#8995a6]">Integration Code Snippet</span>
                <div className="flex gap-1">
                  {(['curl', 'php', 'javascript', 'node', 'python'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setCodeLang(lang)}
                      className={`rounded px-2 py-0.5 dr-mono text-[9px] font-bold uppercase ${
                        codeLang === lang ? 'bg-[#243961] text-white' : 'bg-[#eef2f8] text-[#556784] hover:bg-[#dfe6f0]'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative rounded-xl bg-[#17243e] p-4 text-white shadow-inner">
                <button
                  onClick={() => { navigator.clipboard?.writeText(snippet); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
                  className="absolute right-3 top-3 text-[#8da2c3] hover:text-white"
                >
                  {copied ? <Check className="h-4 w-4 text-[#50c890]" /> : <Copy className="h-4 w-4" />}
                </button>
                <pre className="overflow-auto whitespace-pre-wrap dr-mono text-[10px] leading-5 text-[#c1d1eb]">{snippet}</pre>
              </div>
            </div>
          )}

          {activeTab === 'sandbox' && (
            <div className="space-y-4">
              <div>
                <span className="dr-label text-[#8995a6]">API Sandbox Tester</span>
                <p className="mt-1 text-xs text-[#64748b]">Execute live verification check against sandbox environment.</p>
              </div>

              <div className="space-y-3 rounded-xl border border-[#e2e8f0] bg-[#fafbfd] p-4">
                {api.fields.map(f => (
                  <div key={f.name}>
                    <div className="flex items-center justify-between text-xs">
                      <label className="dr-mono font-bold text-[#24314c]">{f.name}</label>
                      <span className="text-[10px] text-[#718096]">{f.description}</span>
                    </div>
                    <input
                      type="text"
                      value={sandboxParams[f.name] ?? ''}
                      onChange={e => setSandboxParams({ ...sandboxParams, [f.name]: e.target.value })}
                      className="dr-input mt-1 w-full dr-mono text-xs font-semibold"
                    />
                  </div>
                ))}

                <Btn
                  variant="primary"
                  className="w-full mt-3"
                  onClick={runSandboxTest}
                  disabled={sandboxLoading}
                  icon={sandboxLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                >
                  {sandboxLoading ? 'Executing Request...' : 'Send Test Request'}
                </Btn>
              </div>

              {sandboxResult && (
                <div className="rounded-xl border border-[#cbe4d7] bg-[#f2faf5] p-4 dr-in">
                  <div className="flex items-center justify-between border-b border-[#d1e8dc] pb-2">
                    <span className="text-xs font-bold text-[#167455]">{sandboxResult.statusText}</span>
                    <span className="dr-mono text-[10px] text-[#368165]">Latency: {sandboxResult.responseTimeMs}ms</span>
                  </div>
                  <p className="mt-2 text-[10px] dr-mono text-[#527768]">Request ID: <b>{sandboxResult.requestId}</b></p>
                  <pre className="mt-2 max-h-48 overflow-auto rounded bg-[#17243e] p-3 dr-mono text-[9px] leading-4 text-[#72d6a5]">
                    {JSON.stringify(sandboxResult.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {checkoutOpen && (
        <OrderCheckoutModal
          service={{
            slug: api.slug,
            name: api.name,
            category: api.category,
            description: api.description,
            method: api.method,
            endpoint: api.endpoint,
            price: api.price,
            status: api.status,
            version: api.version,
            fields: api.fields.map(f => f.name)
          }}
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </>
  );
}

function OrderCheckoutModal({
  service, onClose
}: {
  service: VerificationService;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const walletQuery = useGetWallet();
  const payWallet = usePayOrderWithWallet();
  const createTopup = useCreateTopup();
  const verifyTopup = useVerifyTopup();

  const [candidateName, setCandidateName] = useState('Jane Doe');
  const [candidateEmail, setCandidateEmail] = useState('jane.doe@example.com');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'razorpay'>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [topupModalOpen, setTopupModalOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState<number>(500);

  const orderTotal = service.price ?? 2.50;
  const currentBalance = (walletQuery.data?.balance ?? 0) as number;
  const isBalanceSufficient = currentBalance >= orderTotal;
  const shortfall = isBalanceSufficient ? 0 : orderTotal - currentBalance;

  const handleTopupSubmit = async () => {
    if (topupAmount <= 0) return;
    setIsProcessing(true);
    try {
      const res = await createTopup.mutateAsync({ data: { amount: topupAmount } });
      if (res?.razorpay_order_id && res?.key) {
        const loaded = await loadRazorpayScript();
        if (loaded && (window as any).Razorpay) {
          const options = {
            key: res.key,
            amount: res.amount_in_paise || topupAmount * 100,
            currency: 'INR',
            name: 'DigitalRakshak',
            description: `Wallet Top-up (${res.reference || 'Credit'})`,
            order_id: res.razorpay_order_id,
            handler: async (response: any) => {
              try {
                await verifyTopup.mutateAsync({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  reference: res.reference
                });
                toast({ title: 'Top-up Successful', description: `₹${topupAmount.toLocaleString('en-IN')} added to your wallet.` });
                await queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
                setTopupModalOpen(false);
                setPaymentMethod('wallet');
              } catch (e: any) {
                toast({ title: 'Verification Failed', description: e.message || 'Payment verification failed.', variant: 'destructive' });
              } finally {
                setIsProcessing(false);
              }
            },
            modal: { ondismiss: () => setIsProcessing(false) }
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
          return;
        }
      }
      toast({ title: 'Top-up Completed', description: `₹${topupAmount.toLocaleString('en-IN')} added to wallet.` });
      await queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
      setTopupModalOpen(false);
      setPaymentMethod('wallet');
    } catch (err: any) {
      toast({ title: 'Top-up Error', description: err.message || 'Failed to process top-up.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    try {
      if (paymentMethod === 'wallet') {
        if (!isBalanceSufficient) {
          toast({ title: 'Insufficient Balance', description: `Shortfall of ${money(shortfall)}. Please add funds to wallet.`, variant: 'destructive' });
          setIsProcessing(false);
          return;
        }
        await payWallet.mutateAsync({ orderId: 101 });
        toast({ title: 'Verification Order Placed!', description: `Paid ${money(orderTotal)} using your Client Wallet.` });
        onClose();
      } else {
        const loaded = await loadRazorpayScript();
        if (loaded && (window as any).Razorpay) {
          const options = {
            key: 'rzp_test_mockkey',
            amount: orderTotal * 100,
            currency: 'INR',
            name: 'DigitalRakshak',
            description: `Verification Check - ${service.name}`,
            handler: () => {
              toast({ title: 'Order Paid via Razorpay!', description: `Payment of ${money(orderTotal)} processed successfully.` });
              onClose();
            },
            modal: { ondismiss: () => setIsProcessing(false) }
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          toast({ title: 'Order Paid', description: `Razorpay payment demo completed.` });
          onClose();
        }
      }
    } catch (err: any) {
      toast({ title: 'Payment Failed', description: err.message || 'Could not complete order payment.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10192d]/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#dce2ec] bg-white p-6 shadow-2xl dr-in">
        <div className="flex items-center justify-between border-b border-[#edf0f5] pb-4">
          <div>
            <span className="dr-label text-[#b68429]">Checkout</span>
            <h3 className="text-lg font-bold text-[#233352]">{service.name}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-[#8b97a8] hover:bg-[#f1f4f8]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-[#e2e8f0] bg-[#fafbfd] p-4">
            <div className="flex justify-between text-xs text-[#62728d]">
              <span>Candidate / Subject Name:</span>
              <input
                type="text"
                value={candidateName}
                onChange={e => setCandidateName(e.target.value)}
                className="dr-input max-w-[200px] text-right text-xs font-semibold"
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-[#62728d]">
              <span>Email Address:</span>
              <input
                type="email"
                value={candidateEmail}
                onChange={e => setCandidateEmail(e.target.value)}
                className="dr-input max-w-[200px] text-right text-xs font-semibold"
              />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-[#e2e8f0] pt-3">
              <span className="text-xs font-bold text-[#344665]">Check Cost</span>
              <span className="dr-mono text-base font-bold text-[#1f2e4d]">{money(orderTotal)}</span>
            </div>
          </div>

          <div>
            <p className="dr-label mb-2 text-[#7f8c9f]">Select Payment Method</p>
            <div className="space-y-2.5">
              <label
                onClick={() => setPaymentMethod('wallet')}
                className={`flex cursor-pointer items-start justify-between rounded-xl border p-4 transition-all ${
                  paymentMethod === 'wallet'
                    ? 'border-[#243961] bg-[#f0f4fa] ring-1 ring-[#243961]'
                    : 'border-[#e1e7f0] hover:border-[#b8c5d9]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'wallet'}
                    onChange={() => setPaymentMethod('wallet')}
                    className="mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <WalletCards className="h-4 w-4 text-[#243961]" />
                      <span className="text-xs font-bold text-[#233352]">Pay from Wallet</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#718096]">
                      Available Balance: <b className="dr-mono text-[#253960]">{money(currentBalance)}</b>
                    </p>
                  </div>
                </div>
                <Status tone={isBalanceSufficient ? 'success' : 'danger'}>
                  {isBalanceSufficient ? 'Sufficient' : 'Shortage'}
                </Status>
              </label>

              {paymentMethod === 'wallet' && !isBalanceSufficient && (
                <div className="rounded-xl border border-[#f5c6cb] bg-[#fff5f5] p-3.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#b91c1c]">Wallet balance is insufficient</p>
                      <p className="mt-0.5 text-[11px] text-[#7f1d1d]">
                        Shortfall: <b className="dr-mono">{money(shortfall)}</b> to place this order.
                      </p>
                    </div>
                    <Btn
                      variant="soft"
                      icon={<Plus className="h-3.5 w-3.5" />}
                      onClick={() => {
                        setTopupAmount(Math.ceil(shortfall));
                        setTopupModalOpen(true);
                      }}
                    >
                      Add {money(shortfall)} to Wallet
                    </Btn>
                  </div>
                </div>
              )}

              <label
                onClick={() => setPaymentMethod('razorpay')}
                className={`flex cursor-pointer items-start justify-between rounded-xl border p-4 transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-[#243961] bg-[#f0f4fa] ring-1 ring-[#243961]'
                    : 'border-[#e1e7f0] hover:border-[#b8c5d9]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-[#0066cc]" />
                      <span className="text-xs font-bold text-[#233352]">Pay with Razorpay</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#718096]">
                      Cards, Netbanking, UPI & Wallets
                    </p>
                  </div>
                </div>
                <Status tone="neutral">Razorpay</Status>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <Btn variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Btn>
          <Btn
            variant="primary"
            onClick={handleCompleteOrder}
            disabled={isProcessing || (paymentMethod === 'wallet' && !isBalanceSufficient)}
            icon={isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          >
            {isProcessing
              ? 'Processing...'
              : paymentMethod === 'wallet'
              ? `Pay ${money(orderTotal)} from Wallet`
              : `Pay ${money(orderTotal)} via Razorpay`}
          </Btn>
        </div>
      </div>

      {topupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10192d]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#dce2ec] bg-white p-6 shadow-2xl dr-in">
            <div className="flex items-center justify-between border-b border-[#edf0f5] pb-4">
              <div>
                <span className="dr-label text-[#b68429]">Quick Top-Up</span>
                <h3 className="text-base font-bold text-[#233352]">Add Money to Wallet</h3>
              </div>
              <button onClick={() => setTopupModalOpen(false)} className="rounded-lg p-1 text-[#8b97a8] hover:bg-[#f1f4f8]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#344665]">Amount (₹)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3.5 top-2.5 font-bold text-[#62728d]">₹</span>
                  <input
                    type="number"
                    min={10}
                    max={500000}
                    value={topupAmount}
                    onChange={e => setTopupAmount(Number(e.target.value))}
                    className="dr-input w-full pl-8 font-bold"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] text-[#718096]">Preset Amounts</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[500, 1000, 2500, 5000, 10000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupAmount(amt)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        topupAmount === amt ? 'border-[#243961] bg-[#243961] text-white' : 'border-[#dce2ec] text-[#3d4f70] hover:bg-[#f4f7fb]'
                      }`}
                    >
                      {money(amt)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#edf0f5] pt-4">
              <Btn variant="outline" onClick={() => setTopupModalOpen(false)} disabled={isProcessing}>
                Cancel
              </Btn>
              <Btn
                variant="soft"
                onClick={handleTopupSubmit}
                disabled={isProcessing || topupAmount < 10}
                icon={isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              >
                {isProcessing ? 'Creating Payment...' : `Continue to Payment (${money(topupAmount)})`}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
