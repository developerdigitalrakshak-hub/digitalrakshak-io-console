import React, { useState } from 'react';
import { ArrowRight, Check, CheckCircle2, Zap } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { LogoMark } from '@/components/common';

export function AuthPage({ register = false }: { register?: boolean }) {
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Left Marketing Banner Panel */}
      <div className="hidden w-[44%] flex-col justify-between bg-white border-r border-gray-200 p-10 lg:flex">
        <LogoMark />
        <div>
          <p className="dr-label text-[#2a85ff] font-bold">DigitalRakshak.io / access</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 leading-tight">
            {register ? 'Start with a cleaner signal.' : 'Good to see you again.'}
          </h1>
          <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-md">
            {register ? 'Create a workspace for your team and make your first verification request before your coffee gets cold.' : 'Your verification workspace is ready. Pick up where your team left off.'}
          </p>
          <div className="mt-10 grid max-w-sm grid-cols-2 gap-3">
            {['Scoped API keys', 'Live request logs', 'Built-in audit trail', 'INR billing visibility'].map(item => (
              <div key={item} className="rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-3 text-xs font-semibold text-gray-700 flex items-center gap-2">
                <Check className="h-4 w-4 text-[#2a85ff]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 dr-pulse" />
          API status operational <span className="mx-1">•</span> Mumbai region
        </div>
      </div>

      {/* Right Auth Form Section */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between p-6 lg:hidden bg-white border-b border-gray-200">
          <LogoMark />
          <Link href="/" data-testid="link-auth-home" className="text-xs font-semibold text-gray-600 hover:text-gray-900">
            Back to home
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center px-6 py-12">
          <div className="mb-8">
            <p className="dr-label text-[#2a85ff] font-bold">{register ? 'New workspace' : 'Welcome back'}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              {register ? 'Create your workspace' : 'Sign in to DigitalRakshak'}
            </h2>
            <p className="mt-2 text-xs text-gray-500">
              {register ? 'No card required. Start with ₹100 in demo credits.' : 'Use your work email to continue.'}
            </p>
          </div>

          {submitted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              <h3 className="mt-3 text-base font-bold text-emerald-900">{register ? 'Workspace created' : 'Signed in successfully'}</h3>
              <p className="mt-1 text-xs text-emerald-700 leading-relaxed">Taking you to the verification dashboard now.</p>
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
                <span className="mb-1.5 block text-xs font-bold text-gray-700">Work email</span>
                <input
                  required
                  type="email"
                  data-testid="input-auth-email"
                  placeholder="you@company.com"
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none transition focus:border-[#2a85ff] focus:ring-2 focus:ring-[#2a85ff]/20"
                />
              </label>

              {register && (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-gray-700">Company name</span>
                  <input
                    required
                    data-testid="input-company-name"
                    placeholder="Aster & Co."
                    className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none transition focus:border-[#2a85ff] focus:ring-2 focus:ring-[#2a85ff]/20"
                  />
                </label>
              )}

              <label className="block">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Password</span>
                  {!register && (
                    <button
                      type="button"
                      onClick={() => alert('Password reset instructions sent to your email.')}
                      className="text-xs font-semibold text-[#2a85ff] hover:underline"
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
                    className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 pr-16 text-sm text-gray-900 outline-none transition focus:border-[#2a85ff] focus:ring-2 focus:ring-[#2a85ff]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-3 text-xs font-bold text-gray-400 hover:text-gray-700"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              {register && (
                <label className="flex items-start gap-2 pt-1 text-xs leading-relaxed text-gray-500">
                  <input required type="checkbox" data-testid="input-terms" className="mt-0.5 rounded border-gray-300 text-[#2a85ff] focus:ring-[#2a85ff]" />
                  I agree to the DigitalRakshak terms and privacy policy.
                </label>
              )}

              <button
                type="submit"
                data-testid="button-auth-submit"
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2a85ff] text-sm font-bold text-white shadow-xs hover:bg-[#0069f6] transition-colors cursor-pointer"
              >
                {register ? 'Create workspace' : 'Continue'} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          <div className="mt-8 flex items-center gap-3 text-xs text-gray-400 font-medium">
            <span className="h-px flex-1 bg-gray-200" />or<span className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            onClick={() => {
              localStorage.setItem('auth_token', 'dr_demo_token');
              setLocation('/dashboard');
            }}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            data-testid="button-demo-access"
          >
            <Zap className="h-4 w-4 text-[#2a85ff]" />
            Use demo workspace
          </button>

          <p className="mt-8 text-center text-xs text-gray-500 font-medium">
            {register ? 'Already have a workspace?' : 'New to DigitalRakshak?'} {' '}
            <Link href={register ? '/login' : '/register'} data-testid="link-auth-switch" className="font-bold text-[#2a85ff] hover:underline">
              {register ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
