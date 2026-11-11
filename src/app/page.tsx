'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, KeyRound, ShieldCheck, AlertCircle, ArrowRight, School, Calendar, Info } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Duplicate collision handling
  const [collisionData, setCollisionData] = useState<{
    show: boolean;
    code: string;
    candidates: { id: string; year: string; name_en_masked: string }[];
  }>({
    show: false,
    code: '',
    candidates: [],
  });
  const [selectedYear, setSelectedYear] = useState('Year 1');
  const [birthDate, setBirthDate] = useState('');
  const [secLoading, setSecLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let cleanCode = code.trim().toLowerCase();
    if (!cleanCode) {
      setError('Please enter your login code.');
      return;
    }

    // Auto-prefix ips@ if the student just entered 5 digits
    if (/^\d{4,5}$/.test(cleanCode)) {
      cleanCode = `ips@${cleanCode}`;
    }

    if (!cleanCode.startsWith('ips@')) {
      setError('Invalid format. Code must start with "ips@" followed by 5 digits (e.g. ips@12345).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid Login Code');
        setLoading(false);
        return;
      }

      if (data.collision) {
        // Handle code collision securely
        setCollisionData({
          show: true,
          code: cleanCode,
          candidates: data.candidates || [],
        });
        setSelectedYear(data.candidates?.[0]?.year || 'Year 1');
        setLoading(false);
        return;
      }

      if (data.success) {
        router.push('/results');
      }
    } catch (err) {
      setError('Unable to connect to the server. Please check your network.');
      setLoading(false);
    }
  };

  const handleSecondaryVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSecLoading(true);

    try {
      const res = await fetch('/api/auth/verify-secondary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: collisionData.code,
          year: selectedYear,
          birthDate: birthDate.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed. Please check your year and birth date.');
        setSecLoading(false);
        return;
      }

      if (data.success) {
        router.push('/results');
      }
    } catch (err) {
      setError('Secondary verification failed. Please try again.');
      setSecLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-slate-100 p-4 sm:p-6 md:p-8">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header bar */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <School className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-slate-200 uppercase">International Public School</h1>
            <p className="text-xs text-blue-300 font-medium">Academic Portal • IPS</p>
          </div>
        </div>

        <a
          href="/admin/login"
          className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/60 hover:border-slate-600 bg-slate-800/40"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Staff Portal</span>
        </a>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          {/* Logo Crest */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-xl shadow-blue-500/25 mb-4 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Student Results</h2>
            <p className="text-sm text-slate-400 mt-1">Mid-term Examination Results</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {!collisionData.show ? (
            /* Normal Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="student-code" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Student Login Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-5 h-5 text-blue-400" />
                  </div>
                  <input
                    id="student-code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="ips@12345"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-mono transition"
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                  <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>Format: <code className="text-blue-300 font-mono">ips@12345</code> (last 5 digits of National ID)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed group text-base"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Secondary Verification Form for Duplicate Codes */
            <form onSubmit={handleSecondaryVerify} className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                <p className="font-semibold mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  Security Verification Required
                </p>
                <p>
                  This login code is associated with multiple registered students across academic cohorts. Please confirm your details below.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Academic Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Year 1">Year 1</option>
                  <option value="Year 2">Year 2</option>
                  <option value="Year 3">Year 3</option>
                  <option value="Year 4">Year 4</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Date of Birth (YYYY-MM-DD or DD-MM-YYYY)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  <input
                    type="text"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    placeholder="YYYY-MM-DD (e.g. 2020-02-26)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCollisionData({ show: false, code: '', candidates: [] });
                    setError(null);
                  }}
                  className="flex-1 py-3 px-3 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-medium transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={secLoading}
                  className="flex-[2] py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
                >
                  {secLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify & Access</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Academic Years Notice */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-center gap-3 text-xs text-slate-500">
            <span>Supported:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-medium">Year 1</span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-medium">Year 2</span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-medium">Year 3</span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-medium">Year 4</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-md w-full mx-auto text-center text-xs text-slate-500 py-3">
        <p>© 2025 International Public School. All rights reserved.</p>
        <p className="mt-1 text-slate-600">Official student assessment and reporting portal</p>
      </footer>
    </div>
  );
}
