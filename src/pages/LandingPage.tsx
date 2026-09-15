import React from 'react';
import {
  ArrowRight, ArrowUpRight, BookOpen, FileCheck2, LockKeyhole, ShieldCheck, TrendingUp, Zap
} from 'lucide-react';
import { Link } from 'wouter';
import { LogoMark } from '@/components/common';

export function LandingPage() {
  const jsonExample = `{\n  "success": true,\n  "requestId": "vrq_7f2d91c8",\n  "data": {\n    "pan": "FZKPM••••L",\n    "name": "Aarav Mehta",\n    "status": "verified"\n  },\n  "billing": {\n    "creditsUsed": 1,\n    "creditsRemaining": 1842\n  }\n}`;

  return (
    <div className="dr-noise overflow-hidden bg-[#f7f9fb] text-[#24324d] min-h-screen">
      <header className="absolute left-0 right-0 top-0 z-20 mx-auto flex max-w-[1240px] items-center justify-between px-6 py-6 lg:px-0">
        <LogoMark />
        <nav className="hidden items-center gap-7 text-[12px] font-semibold text-[#5d6b82] md:flex">
          <a href="#platform" data-testid="link-platform">Platform</a>
          <a href="#services" data-testid="link-services">Services</a>
          <a href="#developers" data-testid="link-developers">Developers</a>
          <a href="#security" data-testid="link-security">Security</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" data-testid="link-login" className="rounded-lg px-3 py-2 text-[12px] font-semibold text-[#425371] hover:bg-[#f1f4f8]">
            Sign in
          </Link>
          <Link href="/register" data-testid="link-start" className="rounded-lg bg-[#243961] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_6px_16px_rgba(36,57,97,.18)] hover:bg-[#1c2e51]">
            Start building <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <section className="dr-grid relative overflow-hidden px-6 pb-24 pt-36 lg:px-0">
        <div className="mx-auto grid max-w-[1240px] items-center gap-14 lg:grid-cols-[1.04fr_.96fr]">
          <div className="dr-in">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#dce4ef] bg-white/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.1em] text-[#5b6e8f]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3eb483]" />India's verification infrastructure
            </div>
            <h1 className="max-w-[700px] font-[family-name:var(--app-font-serif)] text-[clamp(3rem,6vw,5.7rem)] font-bold leading-[.97] tracking-[-.07em] text-[#1e2b4f]">
              Trust, built into<br /><span className="text-[#c38b2b]">every request.</span>
            </h1>
            <p className="mt-7 max-w-[530px] text-[16px] leading-7 text-[#66748a]">
              One precise API for identity, business, and background verification. Make better decisions before the risk gets expensive.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/register" data-testid="link-hero-register" className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#243961] px-5 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(36,57,97,.2)] hover:bg-[#1c2e51]">
                Create your workspace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard/docs" data-testid="link-hero-docs" className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#d6deea] bg-white px-5 text-[13px] font-bold text-[#405374] hover:border-[#afbdd0]">
                Read the docs <BookOpen className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-9 flex items-center gap-4 text-[11px] text-[#8793a5]">
              <div className="flex -space-x-2">
                <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#f7f9fb] bg-[#e3b463] text-[9px] font-bold text-[#493d23]">SP</span>
                <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#f7f9fb] bg-[#b6d8d0] text-[9px] font-bold text-[#294b49]">VK</span>
                <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#f7f9fb] bg-[#c8d5ee] text-[9px] font-bold text-[#334a77]">RM</span>
              </div>
              <span>Trusted by teams processing<br /><b className="text-[#52627d]">1.2M+ checks / month</b></span>
            </div>
          </div>
          <div className="dr-in-2 relative">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#f3c76e]/25 blur-3xl" />
            <div className="relative rounded-2xl border border-[#dce4ee] bg-[#1f2f54] p-3 shadow-[0_28px_70px_rgba(31,47,84,.22)]">
              <div className="rounded-xl bg-[#263a64] p-5 text-white">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-[#f2c46b]">
                      <ShieldCheck className="h-4 w-4 text-[#243961]" />
                    </span>
                    <span className="text-[12px] font-bold">Verification console</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] text-[#a8bbd8]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4dc18b]" />Live
                  </span>
                </div>
                <div className="mb-5 grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-white/10 bg-white/[.07] p-3">
                    <span className="dr-label text-[#9fb0ce]">Requests</span>
                    <p className="mt-2 text-xl font-bold">24,892</p>
                    <span className="text-[10px] text-[#69d19e]">+18.4%</span>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[.07] p-3">
                    <span className="dr-label text-[#9fb0ce]">Pass rate</span>
                    <p className="mt-2 text-xl font-bold">97.8%</p>
                    <span className="text-[10px] text-[#69d19e]">healthy</span>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[.07] p-3">
                    <span className="dr-label text-[#9fb0ce]">Spend</span>
                    <p className="mt-2 text-xl font-bold">₹38.4k</p>
                    <span className="text-[10px] text-[#f2c46b]">this month</span>
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#1e2d50] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#dbe5f5]">Verification volume</span>
                    <span className="dr-mono text-[10px] text-[#90a5c7]">LAST 7 DAYS</span>
                  </div>
                  <div className="flex h-28 items-end gap-2">
                    {[35, 46, 42, 64, 58, 82, 71, 92, 75, 100, 84, 90].map((n, i) => (
                      <div key={i} className={`flex-1 rounded-t-sm ${i > 8 ? 'bg-[#f2c46b]' : 'bg-[#6f88b4]'}`} style={{ height: `${n}%` }} />
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between dr-mono text-[9px] text-[#7086ab]">
                    <span>MON</span><span>WED</span><span>FRI</span><span>SUN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="border-y border-[#e2e7ee] bg-white px-6 py-20 lg:px-0">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <p className="dr-label text-[#bd8a31]">01 / The platform</p>
              <h2 className="mt-4 max-w-md font-[family-name:var(--app-font-serif)] text-4xl font-bold leading-[1.04] tracking-[-.055em] text-[#24314c]">
                The signal behind every confident decision.
              </h2>
            </div>
            <p className="max-w-xl self-end text-[15px] leading-7 text-[#6a778b]">
              DigitalRakshak turns fragmented verification workflows into a single, observable system. From your first API call to the millionth, the same rigor holds.
            </p>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            <Feature icon={Zap} title="One API surface" copy="A predictable contract across PAN, GSTIN, bank account, UAN and more. Ship once, expand coverage anytime." accent="gold" />
            <Feature icon={LockKeyhole} title="Built for sensitive data" copy="Least-privilege keys, clear audit trails, and encrypted handling from request to result." accent="blue" />
            <Feature icon={TrendingUp} title="Signals you can act on" copy="Fast responses with structured outcomes, so your product does the deciding — not a spreadsheet." accent="green" />
          </div>
        </div>
      </section>

      <section id="services" className="bg-[#f1f4f8] px-6 py-20 lg:px-0">
        <div className="mx-auto max-w-[1240px]">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="dr-label text-[#bd8a31]">02 / Coverage</p>
              <h2 className="mt-4 font-[family-name:var(--app-font-serif)] text-4xl font-bold tracking-[-.055em] text-[#24314c]">The checks that move work forward.</h2>
            </div>
            <Link href="/register" data-testid="link-explore-catalog" className="text-[12px] font-bold text-[#3f5c8a]">
              Explore the catalog <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {[
              ['01', 'Identity', 'PAN, Aadhaar & UAN signals'],
              ['02', 'Business', 'GSTIN, CIN & director checks'],
              ['03', 'Financial', 'Bank account & penny drop'],
              ['04', 'Background', 'Employment & address history']
            ].map(([n, title, desc]) => (
              <div key={n} className="group rounded-xl border border-[#dce3eb] bg-white p-5 transition-transform duration-200 hover:-translate-y-1 hover:border-[#bdcadb]">
                <span className="dr-mono text-[10px] text-[#be8d39]">{n}</span>
                <div className="mt-10 flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf0f8] text-[#3d5a86]">
                  <FileCheck2 className="h-4 w-4" />
                </div>
                <h3 className="mt-4 text-[15px] font-bold text-[#2c3d5d]">{title}</h3>
                <p className="mt-1 text-[12px] leading-5 text-[#7b8799]">{desc}</p>
                <ArrowUpRight className="mt-5 h-4 w-4 text-[#aab5c3] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="developers" className="bg-[#1e2b4f] px-6 py-20 text-white lg:px-0">
        <div className="mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="dr-label text-[#f2c46b]">03 / For developers</p>
            <h2 className="mt-4 font-[family-name:var(--app-font-serif)] text-4xl font-bold leading-[1.04] tracking-[-.055em]">
              A first request<br />should feel easy.
            </h2>
            <p className="mt-5 max-w-md text-[14px] leading-6 text-[#aab7ce]">
              Copy one example, add your key, and get a useful response in under five minutes. The console keeps the rest close at hand.
            </p>
            <Link href="/dashboard/docs" data-testid="link-developer-docs" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#f2c46b] px-4 py-3 text-[12px] font-bold text-[#243961] hover:bg-[#f6d58f]">
              Open quickstart <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#152342] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="dr-mono text-[10px] text-[#8ea2c5]">POST /v1/verify/pan</span>
              <span className="rounded bg-[#23395f] px-2 py-1 text-[9px] text-[#9eb2d4]">200 OK</span>
            </div>
            <pre className="overflow-auto p-5 font-[family-name:var(--app-font-mono)] text-[11px] leading-6 text-[#b5c8e8]"><code>{jsonExample}</code></pre>
          </div>
        </div>
      </section>

      <section id="security" className="bg-[#f7f9fb] px-6 py-20 lg:px-0">
        <div className="mx-auto max-w-[1240px] rounded-2xl border border-[#dce4ee] bg-white p-8 md:p-12">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <p className="dr-label text-[#bd8a31]">04 / Responsible by default</p>
              <h2 className="mt-4 max-w-lg font-[family-name:var(--app-font-serif)] text-3xl font-bold tracking-[-.05em] text-[#24314c]">Confidence is a product feature.</h2>
              <p className="mt-3 max-w-lg text-[14px] leading-6 text-[#718097]">Every workspace ships with scoped environments, usage visibility, and the paper trail finance and compliance teams expect.</p>
            </div>
            <div className="grid h-28 w-28 place-items-center rounded-full border-[8px] border-[#e5f3ed] bg-[#f7fcf9]">
              <ShieldCheck className="h-10 w-10 text-[#299269]" />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e2e7ee] bg-white px-6 py-8 lg:px-0">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4">
          <LogoMark />
          <p className="text-[11px] text-[#8a95a5]">Verification infrastructure for the real world.</p>
          <span className="dr-mono text-[10px] text-[#a1aab8]">© 2025 DigitalRakshak</span>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon: Icon, title, copy, accent }: { icon: typeof Zap; title: string; copy: string; accent: string }) {
  const colors: Record<string, string> = { gold: 'bg-[#fff4da] text-[#b77c15]', blue: 'bg-[#e8effa] text-[#385d93]', green: 'bg-[#e7f5ef] text-[#258360]' };
  return (
    <div className="rounded-xl border border-[#e0e6ee] bg-[#fbfcfd] p-5">
      <div className={`grid h-9 w-9 place-items-center rounded-lg ${colors[accent]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="mt-5 text-[15px] font-bold text-[#2d3d5b]">{title}</h3>
      <p className="mt-2 text-[12px] leading-5 text-[#778499]">{copy}</p>
    </div>
  );
}
