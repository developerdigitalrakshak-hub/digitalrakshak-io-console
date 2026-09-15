import React, { useState } from 'react';
import {
  Activity, AlertTriangle, ArrowUpRight, BarChart3, BookOpen, Boxes,
  CircleHelp, Database, ExternalLink, FileCheck2, KeyRound, LayoutDashboard,
  Menu, PanelLeftClose, PanelLeftOpen, RefreshCw, Search, Settings2, ShieldCheck, WalletCards,
  Webhook as WebhookIcon, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'wouter';

export const money = (value = 0) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
export const date = (value?: string | null) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const ago = (value?: string | null) => value ? new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

export function LogoMark({ inverse = false, collapsed = false }: { inverse?: boolean; collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5" data-testid="brand-logo">
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9px] ${inverse ? 'bg-[#f7bd57]' : 'bg-[#f7bd57]'}`}>
        <ShieldCheck className="h-[18px] w-[18px] text-[#1e2b4f]" strokeWidth={2.8} />
      </div>
      {!collapsed && (
        <span className={`font-[family-name:var(--app-font-serif)] text-[17px] font-bold tracking-[-.04em] whitespace-nowrap transition-opacity duration-200 ${inverse ? 'text-white' : 'text-[#1e2b4f]'}`}>
          digital<span className="text-[#e0a43d]">rakshak</span>
        </span>
      )}
    </div>
  );
}

export function Btn({
  children, onClick, variant = 'primary', icon, className = '', type = 'button', disabled = false
}: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'soft' | 'ghost' | 'danger' | 'outline'; icon?: React.ReactNode; className?: string; type?: 'button' | 'submit'; disabled?: boolean;
}) {
  const styles = {
    primary: 'bg-[#243961] text-white shadow-[0_5px_14px_rgba(36,57,97,.16)] hover:bg-[#1c2e51]',
    soft: 'bg-[#f3c976] text-[#263554] hover:bg-[#f6d58f]',
    ghost: 'text-[#53627a] hover:bg-[#eef1f5] hover:text-[#243961]',
    danger: 'bg-[#fff0ee] text-[#bd443b] hover:bg-[#ffe2de]',
    outline: 'border border-[#d9e0e8] bg-white text-[#2a3b5c] hover:border-[#b4c0d2] hover:bg-[#fafbfd]'
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-testid={`button-${String(children).toLowerCase().replace(/\s+/g, '-')}`}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-[12px] font-semibold transition-all duration-200 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {icon}{children}
    </button>
  );
}

export function Status({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'info' }) {
  const cls = { success: 'bg-[#e8f6f0] text-[#167455]', warning: 'bg-[#fff5dd] text-[#9a6a0c]', danger: 'bg-[#fff0ee] text-[#bd443b]', info: 'bg-[#e8f0ff] text-[#39598c]', neutral: 'bg-[#eef1f5] text-[#5e6a7d]' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[.06em] ${cls[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}

export function Skeleton({ className = '' }: { className?: string }) { return <div className={`animate-pulse rounded-md bg-[#e9edf2] ${className}`} />; }
export function LoadingRows({ count = 4 }: { count?: number }) { return <div className="space-y-2">{Array.from({ length: count }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>; }

export function Empty({ icon: Icon = Database, title, copy, action }: { icon?: typeof Database; title: string; copy: string; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-[210px] flex-col items-center justify-center rounded-xl border border-dashed border-[#ced7e3] bg-[#fbfcfd] px-5 text-center">
      <Icon className="mb-3 h-7 w-7 text-[#96a3b5]" />
      <h3 className="text-sm font-bold text-[#334462]">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-5 text-[#758297]">{copy}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function QueryError({ retry }: { retry: () => void }) {
  return (
    <div className="flex min-h-[150px] items-center justify-between rounded-xl border border-[#f2c8c3] bg-[#fff8f7] px-5">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-[#bd443b]" />
        <div>
          <p className="text-sm font-bold text-[#653b39]">We could not load this surface</p>
          <p className="text-xs text-[#99716e]">The API may be waking up. Try again in a moment.</p>
        </div>
      </div>
      <Btn variant="outline" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={retry}>Retry</Btn>
    </div>
  );
}

export function PageHeader({ eyebrow, title, copy, actions }: { eyebrow: string; title: string; copy: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="dr-label text-[#b68429]">{eyebrow}</p>
        <h1 className="mt-2 font-[family-name:var(--app-font-serif)] text-[28px] font-bold tracking-[-.05em] text-[#24314c] md:text-[34px]">{title}</h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[#7a8799]">{copy}</p>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Metric({ label, value, note, icon: Icon, trend, accent = 'blue' }: { label: string; value: string; note: string; icon: typeof WalletCards; trend?: string; accent?: string }) {
  const colors: Record<string, string> = { blue: 'bg-[#e9eff9] text-[#42628f]', gold: 'bg-[#fff3d5] text-[#b57d18]', green: 'bg-[#e7f5ee] text-[#258360]', red: 'bg-[#fff0ee] text-[#bb4b42]' };
  return (
    <div className="dr-card dr-shadow p-4">
      <div className="flex items-start justify-between">
        <div className={`grid h-8 w-8 place-items-center rounded-lg ${colors[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
        {trend && <span className="flex items-center gap-1 text-[10px] font-bold text-[#2b9a6e]"><ArrowUpRight className="h-3 w-3" />{trend}</span>}
      </div>
      <p className="mt-5 text-[11px] font-semibold text-[#7c899c]">{label}</p>
      <p className="mt-1 text-[24px] font-bold tracking-[-.04em] text-[#283956]" data-testid={`metric-${label.toLowerCase().replace(/\s+/g, '-')}`}>{value}</p>
      <p className="mt-1 text-[10px] text-[#96a0ae]">{note}</p>
    </div>
  );
}

export const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/keys', label: 'API keys', icon: KeyRound },
  { href: '/dashboard/services', label: 'Services', icon: Boxes },
  { href: '/dashboard/wallet', label: 'Wallet', icon: WalletCards },
  { href: '/dashboard/usage', label: 'Usage & logs', icon: BarChart3 },
  { href: '/dashboard/requests', label: 'Requests', icon: FileCheck2 },
  { href: '/dashboard/webhooks', label: 'Webhooks', icon: WebhookIcon },
  { href: '/dashboard/docs', label: 'Docs', icon: BookOpen }
];

export function Sidebar({
  mobileOpen, setMobileOpen, collapsed, setCollapsed
}: {
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [location] = useLocation();

  return (
    <aside
      className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 flex flex-col bg-[#1e2b4f] text-white transition-all duration-300 md:relative md:translate-x-0 ${
        collapsed ? 'w-[72px]' : 'w-[246px]'
      }`}
    >
      {/* Top Brand Header & Collapse Trigger */}
      <div className={`flex h-[72px] items-center border-b border-white/10 ${collapsed ? 'justify-center px-2' : 'px-6'}`}>
        <LogoMark inverse collapsed={collapsed} />
        
        {/* Mobile Close */}
        <button className="ml-auto text-white/60 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>

        {/* Desktop Collapse Toggle Button inside Sidebar */}
        <button
          onClick={() => setCollapsed(v => !v)}
          className={`hidden md:flex p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors ${collapsed ? 'mt-2' : 'ml-auto'}`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Workspace Indicator */}
      <div className={`pt-6 ${collapsed ? 'px-2' : 'px-4'}`}>
        {!collapsed && <p className="dr-label mb-3 px-3 text-[#8896b0]">Workspace</p>}
        <div className={`flex items-center rounded-lg bg-white/[.08] ${collapsed ? 'justify-center p-2' : 'justify-between px-3 py-2.5'}`} title="Aster & Co. Production">
          <div className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#f2c46b] text-[11px] font-bold text-[#243961]">
              AC
            </div>
            {!collapsed && (
              <div>
                <p className="text-xs font-semibold">Aster & Co.</p>
                <p className="text-[10px] text-[#9aa8c1]">Production</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className={`dr-scroll mt-8 flex-1 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}>
        {!collapsed && <p className="dr-label mb-3 px-3 text-[#8896b0]">Operate</p>}
        
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard' ? location === href : location.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              data-testid={`link-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
              className={`mb-1 flex items-center gap-3 rounded-lg text-[12px] font-semibold transition-colors ${
                collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
              } ${active ? 'bg-[#f2c46b] text-[#243961]' : 'text-[#afbad0] hover:bg-white/[.08] hover:text-white'}`}
            >
              <Icon className="h-[16px] w-[16px] shrink-0" strokeWidth={active ? 2.5 : 1.8} />
              {!collapsed && <span>{label}</span>}
              {!collapsed && label === 'Webhooks' && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#4bc08b]" />}
            </Link>
          );
        })}

        {!collapsed && <p className="dr-label mb-3 mt-8 px-3 text-[#8896b0]">Manage</p>}
        
        <Link
          href="/admin"
          title={collapsed ? "Admin console" : undefined}
          data-testid="link-admin"
          className={`flex items-center gap-3 rounded-lg text-[12px] font-semibold ${
            collapsed ? 'justify-center p-2.5 mt-4' : 'px-3 py-2.5'
          } ${location === '/admin' ? 'bg-white/[.1] text-white' : 'text-[#afbad0] hover:bg-white/[.08] hover:text-white'}`}
        >
          <Settings2 className="h-[16px] w-[16px] shrink-0" />
          {!collapsed && <span>Admin console</span>}
        </Link>
      </nav>

      {/* Footer Status Box */}
      {!collapsed ? (
        <div className="m-3 rounded-xl border border-white/10 bg-white/[.06] p-3.5">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#50c890] dr-pulse" />
            <span className="text-[11px] font-semibold">All systems operational</span>
          </div>
          <p className="text-[10px] leading-4 text-[#9aa8c1]">API uptime 99.98% this month</p>
          <Link href="/dashboard/docs" className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#f2c46b]">
            Status page <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="m-2 py-3 flex items-center justify-center border-t border-white/10" title="All systems operational (99.98%)">
          <div className="h-2.5 w-2.5 rounded-full bg-[#50c890] dr-pulse" />
        </div>
      )}
    </aside>
  );
}

export function Topbar({
  setMobileOpen, collapsed, setCollapsed
}: {
  setMobileOpen: (value: boolean) => void;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [location] = useLocation();
  const current = navItems.find(item => item.href === location)?.label ?? (location === '/admin' ? 'Admin console' : 'Overview');

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-[#e0e5ec] bg-white/85 px-5 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button className="text-[#51617c] md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="hidden md:flex p-1.5 rounded-lg border border-[#e0e5ec] text-[#51617c] hover:bg-[#f4f6f8] transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>

        <div>
          <p className="text-[13px] font-bold text-[#263755]">{current}</p>
          <p className="hidden text-[10px] text-[#8994a5] sm:block">Aster & Co. / workspace</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden items-center gap-2 rounded-lg border border-[#dfe5ed] bg-[#fafcfe] px-3 py-2 sm:flex">
          <Search className="h-3.5 w-3.5 text-[#8a97aa]" />
          <span className="text-[11px] text-[#8a97aa]">Search workspace</span>
          <kbd className="ml-3 rounded border border-[#dfe5ed] px-1.5 py-0.5 text-[9px] text-[#9aa5b5]">⌘ K</kbd>
        </div>
        <button className="grid h-9 w-9 place-items-center rounded-lg border border-[#e0e5ec] text-[#6d7a8e] hover:bg-[#f4f6f8]" aria-label="Help" data-testid="button-help">
          <CircleHelp className="h-4 w-4" />
        </button>
        <button className="grid h-9 w-9 place-items-center rounded-lg border border-[#e0e5ec] text-[#6d7a8e] hover:bg-[#f4f6f8]" aria-label="Settings" data-testid="button-settings">
          <Settings2 className="h-4 w-4" />
        </button>
        <div className="ml-1 grid h-8 w-8 place-items-center rounded-full bg-[#dfe8f5] text-[11px] font-bold text-[#2e4d7e]">AM</div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-[100dvh] bg-[#f5f7fa] w-full">
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      {mobileOpen && (
        <button className="fixed inset-0 z-30 bg-[#14213d]/35 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" />
      )}
      <div className="min-w-0 flex-1 flex flex-col">
        <Topbar
          setMobileOpen={setMobileOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
        {/* Full Sized Page Container */}
        <main className="w-full max-w-none px-5 py-6 md:px-8 md:py-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
