import React, { useState, useRef, useEffect } from 'react';
import {
  Activity, AlertTriangle, ArrowUpRight, BarChart3, BookOpen, Boxes,
  CircleHelp, Database, ExternalLink, FileCheck2, KeyRound, LayoutDashboard,
  Menu, PanelLeftClose, PanelLeftOpen, RefreshCw, Search, Settings2, ShieldCheck, WalletCards,
  Webhook as WebhookIcon, X, ChevronLeft, ChevronRight, Receipt, ArrowRightLeft, Bell, User, LogOut, ChevronDown
} from 'lucide-react';
import { Link, useLocation } from 'wouter';

export const money = (value = 0) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
export const date = (value?: string | null) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const ago = (value?: string | null) => value ? new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

export function LogoMark({ inverse = false, collapsed = false }: { inverse?: boolean; collapsed?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <img
        src="/img/logo/logo-light-full.png"
        alt="DigitalRakshak Logo"
        className="h-9 w-auto object-contain"
        onError={(e) => {
          // Fallback if image path fails
          e.currentTarget.style.display = 'none';
          const next = e.currentTarget.nextElementSibling;
          if (next) (next as HTMLElement).style.display = 'flex';
        }}
      />
      <div className="hidden items-center gap-2" style={{ display: 'none' }}>
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#2a85ff] text-white shadow-xs">
          <ShieldCheck className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <span className="text-lg font-bold text-gray-900 tracking-tight">
          digital<span className="text-[#2a85ff]">rakshak</span>
        </span>
      </div>
      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-[#2a85ff] border border-blue-200">
        IO
      </span>
    </Link>
  );
}

export function Btn({
  children, onClick, variant = 'primary', icon, className = '', type = 'button', disabled = false
}: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'soft' | 'ghost' | 'danger' | 'outline'; icon?: React.ReactNode; className?: string; type?: 'button' | 'submit'; disabled?: boolean;
}) {
  const styles = {
    primary: 'bg-[#2a85ff] text-white shadow-xs hover:bg-[#0069f6] active:bg-[#0069f6]',
    soft: 'bg-blue-50 text-[#2a85ff] hover:bg-blue-100 hover:text-[#0069f6]',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    danger: 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:border-[#2a85ff] hover:text-[#2a85ff] hover:bg-gray-50'
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-testid={`button-${String(children).toLowerCase().replace(/\s+/g, '-')}`}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold transition-all duration-150 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {icon}{children}
    </button>
  );
}

export function Status({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'info' }) {
  const cls = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    info: 'bg-blue-50 text-blue-700 border-blue-200/80',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200'
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
}

export function Skeleton({ className = '' }: { className?: string }) { return <div className={`animate-pulse rounded-xl bg-gray-200/70 ${className}`} />; }
export function LoadingRows({ count = 4 }: { count?: number }) { return <div className="space-y-2">{Array.from({ length: count }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>; }

export function Empty({ icon: Icon = Database, title, copy, action }: { icon?: typeof Database; title: string; copy: string; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-8 text-center shadow-xs">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gray-100 text-gray-400 mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-gray-500">{copy}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function QueryError({ retry }: { retry: () => void }) {
  return (
    <div className="flex min-h-[140px] items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/60 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-rose-900">We could not load this surface</p>
          <p className="text-xs text-rose-700">The API service may be updating. Please try again.</p>
        </div>
      </div>
      <Btn variant="outline" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={retry}>Retry</Btn>
    </div>
  );
}

export function PageHeader({
  eyebrow, title, copy, actions, breadcrumbs
}: {
  eyebrow?: string;
  title: string;
  copy: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-gray-200/70 pb-6">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="mb-2 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-gray-300">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[#2a85ff] transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-gray-900">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        ) : eyebrow ? (
          <p className="dr-label text-[#2a85ff] font-semibold">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-xs md:text-sm text-gray-500 leading-relaxed">{copy}</p>
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export function Metric({ label, value, note, icon: Icon, trend, accent = 'blue' }: { label: string; value: string; note: string; icon: typeof WalletCards; trend?: string; accent?: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-[#2a85ff] border border-blue-100',
    gold: 'bg-amber-50 text-amber-600 border border-amber-100',
    green: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    red: 'bg-rose-50 text-rose-600 border border-rose-100'
  };
  return (
    <div className="dr-card dr-shadow p-5 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${colors[accent] || colors.blue}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600 border border-emerald-100">
            <ArrowUpRight className="h-3 w-3" />{trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900" data-testid={`metric-${label.toLowerCase().replace(/\s+/g, '-')}`}>{value}</p>
      <p className="mt-1 text-[11px] text-gray-400 font-medium">{note}</p>
    </div>
  );
}

export const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/keys', label: 'API Keys', icon: KeyRound },
  { href: '/dashboard/services', label: 'Services', icon: Boxes },
  { href: '/dashboard/wallet', label: 'Wallet', icon: WalletCards },
  { href: '/dashboard/billing', label: 'Billing', icon: Receipt },
  { href: '/dashboard/transactions', label: 'Transactions', icon: ArrowRightLeft },
  { href: '/dashboard/usage', label: 'Usage & Logs', icon: BarChart3 },
  { href: '/dashboard/requests', label: 'Requests', icon: FileCheck2 },
  { href: '/dashboard/webhooks', label: 'Webhooks', icon: WebhookIcon },
  { href: '/dashboard/docs', label: 'Docs', icon: BookOpen }
];

export function AppHeader({
  mobileOpen, setMobileOpen
}: {
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
}) {
  const [location] = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md print:hidden shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Section: Mobile Menu Button & Brand Logo */}
        <div className="flex items-center gap-4">
          <button
            className="grid h-9 w-9 place-items-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <LogoMark />
        </div>

        {/* Center Section: Top Horizontal Navigation Links */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/dashboard' ? location === href || location === '/' : location.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-blue-50 text-[#2a85ff] font-bold shadow-2xs'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-[#2a85ff]' : 'text-gray-400'}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Workspace Search, Help, Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search */}
          <div className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 md:flex">
            <Search className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">Search APIs & logs...</span>
            <kbd className="ml-2 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-gray-400 shadow-2xs">⌘K</kbd>
          </div>

          {/* Help Button */}
          <Link
            href="/dashboard/docs"
            className="grid h-9 w-9 place-items-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title="Documentation"
          >
            <CircleHelp className="h-4 w-4" />
          </Link>

          {/* Notifications Button */}
          <button
            className="relative grid h-9 w-9 place-items-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#2a85ff]" />
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 rounded-xl border border-gray-200 p-1 pr-2.5 hover:bg-gray-50 transition-colors"
            >
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#2a85ff] text-[11px] font-bold text-white shadow-2xs">
                AM
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-bold leading-none text-gray-900">Aster & Co.</p>
                <p className="text-[10px] text-gray-400 font-medium">Production</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg z-50">
                <div className="border-b border-gray-100 px-3 py-2">
                  <p className="text-xs font-bold text-gray-900">Aster & Co. Production</p>
                  <p className="text-[10px] text-gray-500">api@asterco.com</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    <Settings2 className="h-4 w-4 text-gray-400" />
                    <span>Workspace Settings</span>
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#2a85ff] hover:bg-blue-50"
                  >
                    <ShieldCheck className="h-4 w-4 text-[#2a85ff]" />
                    <span>Admin Console</span>
                  </Link>
                </div>
                <div className="border-t border-gray-100 pt-1">
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = '/login';
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4 text-rose-500" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Drawer Navigation Overlay */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 pt-3 pb-6 lg:hidden shadow-lg">
          <nav className="grid gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = href === '/dashboard' ? location === href || location === '/' : location.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                    active ? 'bg-blue-50 text-[#2a85ff] font-bold' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-[#2a85ff]' : 'text-gray-400'}`} />
                  <span>{label}</span>
                </Link>
              );
            })}
            <div className="mt-3 border-t border-gray-100 pt-3">
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#2a85ff] bg-blue-50/60"
              >
                <Settings2 className="h-4 w-4 text-[#2a85ff]" />
                <span>Admin Console</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 w-full flex flex-col font-sans">
      <AppHeader mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {children}
      </main>
      <footer className="w-full border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-wrap items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} DigitalRakshak.io. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-400">
            <Link href="/dashboard/docs" className="hover:text-gray-600">Documentation</Link>
            <span>•</span>
            <Link href="/dashboard/services" className="hover:text-gray-600">Verification APIs</Link>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 dr-pulse" /> All Systems Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
