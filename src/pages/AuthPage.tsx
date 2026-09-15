import React, { useState } from 'react';
import { ArrowRight, Check, CheckCircle2, Zap } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { LogoMark } from '@/components/common';

export function AuthPage({ register = false }: { register?: boolean }) {
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="dr-noise flex min-h-[100dvh] bg-[#eef2f7]">
      <div className="hidden w-[44%] flex-col justify-between bg-[#1e2b4f] p-10 text-white lg:flex">
        <LogoMark inverse />
        <div>
          <p className="dr-label text-[#f2c46b]">DigitalRakshak / access</p>
          <h1 className="mt-5 max-w-md font-[family-name:var(--app-font-serif)] text-5xl font-bold leading-[.98] tracking-[-.06em]">
            {register ? 'Start with a cleaner signal.' : 'Good to see you again.'}
          </h1>
          <p className="mt-5 max-w-sm text-[14px] leading-6 text-[#aab7ce]">
            {register ? 'Create a workspace for your team and make your first verification request before your coffee gets cold.' : 'Your verification workspace is ready. Pick up where your team left off.'}
          </p>
          <div className="mt-12 grid max-w-sm grid-cols-2 gap-2">
            {['Scoped API keys', 'Live request logs', 'Built-in audit trail', '₹ billing visibility'].map(item => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[.06] px-3 py-3 text-[11px] text-[#cbd6e8]">
                <Check className="mb-2 h-3.5 w-3.5 text-[#f2c46b]" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#8e9fbd]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4bc08b]" />
          API status operational <span className="mx-1 text-white/20">•</span> Mumbai region
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <LogoMark />
          <Link href="/" data-testid="link-auth-home" className="text-xs font-semibold text-[#53647d]">
            Back to home
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center px-6 py-10">
          <div className="mb-8 lg:hidden">
            <p className="dr-label text-[#b68429]">Secure workspace access</p>
          </div>

          <div className="mb-8">
            <p className="dr-label text-[#b68429]">{register ? 'New workspace' : 'Welcome back'}</p>
            <h2 className="mt-3 font-[family-name:var(--app-font-serif)] text-3xl font-bold tracking-[-.05em] text-[#24314c]">
              {register ? 'Create your workspace' : 'Sign in to DigitalRakshak'}
            </h2>
            <p className="mt-2 text-[13px] text-[#7a8799]">
              {register ? 'No card required. Start with ₹100 in demo credits.' : 'Use your work email to continue.'}
            </p>
          </div>

          {submitted ? (
            <div className="rounded-xl border border-[#c6e6d8] bg-[#f1fbf6] p-5">
              <CheckCircle2 className="h-6 w-6 text-[#269069]" />
              <h3 className="mt-3 text-sm font-bold text-[#245c48]">{register ? 'Workspace created' : 'Signed in successfully'}</h3>
              <p className="mt-1 text-xs leading-5 text-[#628273]">Taking you to the verification cockpit now.</p>
            </div>
          ) : (
            <form
              onSubmit={e => {
                e.preventDefault();
                setSubmitted(true);
                localStorage.setItem('auth_token', 'dr_token_' + Date.now());
                setTimeout(() => setLocation('/dashboard'), 700);
              }}
              className="space-y-4"
            >
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold text-[#53627a]">Work email</span>
                <input
                  required
                  type="email"
                  data-testid="input-auth-email"
                  placeholder="you@company.com"
                  className="h-11 w-full rounded-lg border border-[#d6dfe9] bg-white px-3.5 text-sm text-[#273a5a] outline-none transition focus:border-[#5f79a6] focus:ring-2 focus:ring-[#dae4f3]"
                />
              </label>

              {register && (
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold text-[#53627a]">Company name</span>
                  <input
                    required
                    data-testid="input-company-name"
                    placeholder="Aster & Co."
                    className="h-11 w-full rounded-lg border border-[#d6dfe9] bg-white px-3.5 text-sm text-[#273a5a] outline-none transition focus:border-[#5f79a6] focus:ring-2 focus:ring-[#dae4f3]"
                  />
                </label>
              )}

              <label className="block">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#53627a]">Password</span>
                  {!register && (
                    <button
                      type="button"
                      onClick={() => alert('Password reset instructions would be sent to your email.')}
                      className="text-[11px] font-semibold text-[#496795]"
                      data-testid="button-forgot-password"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    required
                    minLength={8}
                    type={showPassword ? 'text' : 'password'}
                    data-testid="input-auth-password"
                    placeholder="Minimum 8 characters"
                    className="h-11 w-full rounded-lg border border-[#d6dfe9] bg-white px-3.5 pr-16 text-sm text-[#273a5a] outline-none transition focus:border-[#5f79a6] focus:ring-2 focus:ring-[#dae4f3]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-3 text-[10px] font-bold text-[#6f7d91]"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              {register && (
                <label className="flex items-start gap-2 pt-1 text-[11px] leading-4 text-[#7b8798]">
                  <input required type="checkbox" data-testid="input-terms" className="mt-0.5 accent-[#243961]" />
                  I agree to the DigitalRakshak terms and privacy policy.
                </label>
              )}

              <button
                type="submit"
                data-testid="button-auth-submit"
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#243961] text-[13px] font-bold text-white shadow-[0_7px_16px_rgba(36,57,97,.16)] hover:bg-[#1b2d50]"
              >
                {register ? 'Create workspace' : 'Continue'} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          <div className="mt-8 flex items-center gap-3 text-[11px] text-[#8b96a7]">
            <span className="h-px flex-1 bg-[#dce3eb]" />or<span className="h-px flex-1 bg-[#dce3eb]" />
          </div>

          <button
            onClick={() => {
              localStorage.setItem('auth_token', 'dr_demo_token');
              setLocation('/dashboard');
            }}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#d6dfe9] bg-white text-[12px] font-bold text-[#405374] hover:bg-[#fafbfd]"
            data-testid="button-demo-access"
          >
            <Zap className="h-3.5 w-3.5 text-[#c28c2e]" />
            Use demo workspace
          </button>

          <p className="mt-7 text-center text-[11px] text-[#8b96a7]">
            {register ? 'Already have a workspace?' : 'New to DigitalRakshak?'} {' '}
            <Link href={register ? '/login' : '/register'} data-testid="link-auth-switch" className="font-bold text-[#496795]">
              {register ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
