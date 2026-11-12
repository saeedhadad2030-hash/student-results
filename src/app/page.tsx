'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Info, Calendar } from 'lucide-react';

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
      setError('Please enter your student code.');
      return;
    }

    // Auto-prefix ips@ if the student entered exactly 5 digits
    if (/^\d{5}$/.test(cleanCode)) {
      cleanCode = `ips@${cleanCode}`;
    }

    if (!cleanCode.startsWith('ips@') || !/^ips@\d{5}$/.test(cleanCode)) {
      setError('Invalid format. Code must be in the format ips@12345 (strictly the last 5 digits of National ID).');
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
        setError(data.error || 'Invalid Login Code.');
        setLoading(false);
        return;
      }

      if (data.collision) {
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
      setError('Unable to connect to the server. Please check your connection.');
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
        setError(data.error || 'Verification failed. Please check your academic year and birth date.');
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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-[#f5f7fb] text-[#14233b] relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[35rem] h-[35rem] bg-[#dce9ff]/60 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-blue-100/40 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>
      </div>

      <main className="relative z-10 w-full max-w-[480px]">
        <div className="bg-white border border-[#1c345c]/10 rounded-[24px] p-7 sm:p-10 shadow-[0_16px_45px_rgba(22,44,81,0.09)] text-center">
          {/* Official School Logo */}
          <div className="mb-4 flex justify-center">
            <img
              src="/logo.jpg"
              alt="IPS New Mansoura - International Public Schools"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-full bg-white p-1 shadow-md border border-slate-100 hover:scale-105 transition-transform"
            />
          </div>

          <p className="text-[0.72rem] font-bold tracking-[0.15em] uppercase text-[#5273a2] mb-1">
            ACADEMIC RESULTS PORTAL
          </p>

          {/* School Name as Main Title */}
          <h1 className="text-2xl sm:text-[1.85rem] font-bold text-[#14233b] tracking-tight mb-1 font-serif">
            IPS New Mansoura
          </h1>

          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
            International Public School
          </p>

          <p className="text-[#63718a] text-[13.5px] leading-relaxed mb-6 max-w-xs mx-auto">
            Enter your private student code to view your official examination results report.
          </p>

          {!collisionData.show ? (
            /* Main Login Form */
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label htmlFor="student-code" className="block text-[0.85rem] font-semibold text-[#334868] mb-1.5">
                  Student Code
                </label>
                <input
                  id="student-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ips@12345"
                  className="w-full px-3.5 py-3 bg-white border border-[#d4ddeb] rounded-[10px] text-[#14233b] placeholder-slate-400 focus:outline-none focus:border-[#276de8] focus:ring-4 focus:ring-[#276de8]/15 text-base transition font-mono"
                  autoComplete="off"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#276de8] hover:bg-[#1b5dca] text-white font-bold rounded-[10px] shadow-sm flex items-center justify-center gap-2 transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-wait text-[15px]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Login</span>
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Duplicate Code Secondary Verification Form */
            <form onSubmit={handleSecondaryVerify} className="space-y-4 text-left">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <p className="font-bold mb-1 flex items-center gap-1.5 text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  Additional Verification Required
                </p>
                <p className="leading-relaxed">
                  This code is shared across different cohorts. Please select your Academic Year and Birth Date to view your report.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334868] uppercase tracking-wider mb-1.5">
                  Academic Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#d4ddeb] rounded-lg text-sm text-[#14233b] focus:outline-none focus:border-[#276de8]"
                >
                  <option value="Year 1">Year 1</option>
                  <option value="Year 2">Year 2</option>
                  <option value="Year 3">Year 3</option>
                  <option value="Year 4">Year 4</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334868] uppercase tracking-wider mb-1.5">
                  Date of Birth (YYYY-MM-DD)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    placeholder="YYYY-MM-DD (e.g. 2020-02-26)"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#d4ddeb] rounded-lg text-sm font-mono text-[#14233b] focus:outline-none focus:border-[#276de8]"
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
                  className="flex-1 py-2.5 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={secLoading}
                  className="flex-[2] py-2.5 px-4 bg-[#276de8] hover:bg-[#1b5dca] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  {secLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Verify & Continue →</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Error Message */}
          {error && (
            <p className="mt-4 text-xs font-bold text-rose-600 leading-normal" role="alert">
              {error}
            </p>
          )}

          {/* Admin Access Link */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <a
              href="/admin/login"
              className="inline-block text-[13px] font-semibold text-[#406da9] hover:text-[#163f78] transition"
            >
              Administrator access
            </a>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-500">
          IPS New Mansoura • Official Examination Results
        </div>
      </main>
    </div>
  );
}
