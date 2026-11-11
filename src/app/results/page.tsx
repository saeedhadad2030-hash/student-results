'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  LogOut,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  School,
  Sparkles,
} from 'lucide-react';
import { SubjectResult, OverallResult } from '@/types';

interface StudentData {
  id: string;
  roll_no: number;
  name_en: string;
  year: string;
  subjects: SubjectResult[];
  overall: OverallResult;
}

export default function ResultsPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/student/me')
      .then(async (res) => {
        if (res.status === 401) {
          router.push('/');
          return;
        }
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to load examination results');
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.student) {
          setStudent(data.student);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper for grade color styling
  const getGradeBadgeStyle = (grade: string | null) => {
    if (!grade || grade === 'Absent' || grade === 'Not Available' || grade === 'N/A') {
      return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
    }
    const g = grade.toUpperCase();
    if (g === 'A*') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-500/20';
    }
    if (g === 'A') {
      return 'bg-blue-50 text-blue-700 border-blue-300 ring-1 ring-blue-500/20';
    }
    if (g === 'B') {
      return 'bg-cyan-50 text-cyan-700 border-cyan-300 ring-1 ring-cyan-500/20';
    }
    if (g === 'C') {
      return 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-500/20';
    }
    if (g === 'D') {
      return 'bg-orange-50 text-orange-700 border-orange-300 ring-1 ring-orange-500/20';
    }
    if (g === 'E') {
      return 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-500/20';
    }
    if (g === 'F') {
      return 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-500/20';
    }
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  const getProgressBarColor = (grade: string | null) => {
    if (!grade || grade === 'Absent') return 'bg-slate-300';
    const g = grade.toUpperCase();
    if (g === 'A*') return 'bg-emerald-500';
    if (g === 'A') return 'bg-blue-500';
    if (g === 'B') return 'bg-cyan-500';
    if (g === 'C') return 'bg-amber-500';
    if (g === 'D') return 'bg-orange-500';
    if (g === 'E') return 'bg-rose-500';
    if (g === 'F') return 'bg-red-500';
    return 'bg-blue-500';
  };

  const parsePercentNumber = (pct: string | null) => {
    if (!pct) return 0;
    const num = parseInt(pct.replace('%', ''), 10);
    return isNaN(num) ? 0 : Math.min(Math.max(num, 0), 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-600">Retrieving official examination records...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-xl text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-600 mb-6">{error || 'Session expired or record unavailable.'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-16 print:bg-white print:p-0 print:pb-0">
      {/* Top Navigation Bar - Hidden on print */}
      <nav className="no-print bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-slate-900">International Public School</span>
              <span className="hidden sm:inline-block text-xs text-slate-500 ml-2 font-medium">Results Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Report</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Printable Official Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent pointer-events-none rounded-bl-full" />

          {/* School Badge Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 flex-shrink-0">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  International Public School
                </h1>
                <p className="text-xs sm:text-sm text-blue-700 font-semibold tracking-wide uppercase">
                  Official Statement of Examination Results
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider">
                {student.year}
              </span>
              <span className="text-xs text-slate-500 sm:mt-1 font-mono">Candidate #{student.roll_no}</span>
            </div>
          </div>

          {/* Student Profile Info */}
          <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student Name</span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 capitalize">
                {student.name_en}
              </h2>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Academic Period</span>
              <p className="text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Mid-term Assessment</span>
              </p>
            </div>
          </div>
        </div>

        {/* Examination Title Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Subject Breakdown</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {student.subjects.length} Assessed Subjects
          </span>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {student.subjects.map((subj, index) => {
            const isAbsent = subj.is_absent || subj.mark === 'Absent';
            const pctNum = isAbsent ? 0 : parsePercentNumber(subj.percentage);

            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{subj.subject}</h4>
                    <span className="text-xs text-slate-400 font-medium">
                      Maximum: {subj.max_marks} marks
                    </span>
                  </div>

                  {/* Grade Badge */}
                  <div
                    className={`px-3 py-1 rounded-xl text-sm font-extrabold border ${getGradeBadgeStyle(
                      subj.grade
                    )}`}
                  >
                    {isAbsent ? 'ABSENT' : subj.grade || 'N/A'}
                  </div>
                </div>

                {/* Score & Percentage */}
                <div className="flex items-baseline justify-between mt-4 mb-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {isAbsent ? 'Absent' : subj.mark ?? 'N/A'}
                    </span>
                    {!isAbsent && (
                      <span className="text-xs text-slate-400 font-semibold">/ {subj.max_marks}</span>
                    )}
                  </div>

                  <span className="text-sm font-bold text-slate-700">
                    {isAbsent ? '—' : subj.percentage || 'N/A'}
                  </span>
                </div>

                {/* Percentage Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${getProgressBarColor(
                      subj.grade
                    )}`}
                    style={{ width: `${pctNum}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall Performance Section */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-8 border border-slate-700/50">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/20">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">Overall Performance</h3>
                  <p className="text-xs text-slate-400 font-medium">Composite Academic Evaluation</p>
                </div>
              </div>

              {/* Overall Grade Pill */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Overall Grade</span>
                  <span className="text-xs font-semibold text-blue-300">
                    Scale A* - F
                  </span>
                </div>
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black border shadow-lg ${
                    student.overall.grade === 'A*'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30'
                      : student.overall.grade === 'A'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-400/30'
                      : student.overall.grade === 'B'
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400/30'
                      : student.overall.grade === 'C'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-400/30'
                      : student.overall.grade === 'D'
                      ? 'bg-orange-500/20 text-orange-400 border-orange-400/30'
                      : student.overall.grade === 'E'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-400/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {student.overall.is_absent ? 'ABS' : student.overall.grade || 'N/A'}
                </div>
              </div>
            </div>

            {/* Overall Stats Figures */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Marks</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-black text-white">
                    {student.overall.is_absent ? 'Absent' : student.overall.total_marks ?? 'N/A'}
                  </span>
                  {!student.overall.is_absent && (
                    <span className="text-sm font-semibold text-slate-400">
                      / {student.overall.max_total}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Percentage</span>
                <div className="mt-1">
                  <span className="text-3xl font-black text-blue-400">
                    {student.overall.is_absent ? '—' : student.overall.percentage || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Academic Standing</span>
                <div className="mt-1 flex items-center gap-1.5 text-slate-200">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold">
                    {student.overall.grade === 'A*'
                      ? 'Distinction / Highest Honors'
                      : student.overall.grade === 'A'
                      ? 'Excellent Performance'
                      : student.overall.grade === 'B'
                      ? 'Very Good Standing'
                      : student.overall.grade === 'C'
                      ? 'Satisfactory'
                      : student.overall.grade === 'D'
                      ? 'Pass'
                      : student.overall.is_absent
                      ? 'Examination Absent'
                      : 'Needs Improvement'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Official Grading Scale Reference Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>School Grading Criteria Reference</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="block font-black text-emerald-800 text-sm">A*</span>
              <span className="text-emerald-700 font-semibold">95% – 100%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <span className="block font-black text-blue-800 text-sm">A</span>
              <span className="text-blue-700 font-semibold">85% – 94%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200">
              <span className="block font-black text-cyan-800 text-sm">B</span>
              <span className="text-cyan-700 font-semibold">75% – 84%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="block font-black text-amber-800 text-sm">C</span>
              <span className="text-amber-700 font-semibold">65% – 74%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200">
              <span className="block font-black text-orange-800 text-sm">D</span>
              <span className="text-orange-700 font-semibold">55% – 64%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
              <span className="block font-black text-rose-800 text-sm">E</span>
              <span className="text-rose-700 font-semibold">40% – 54%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200">
              <span className="block font-black text-red-800 text-sm">F</span>
              <span className="text-red-700 font-semibold">Below 40%</span>
            </div>
          </div>
        </div>

        {/* Print Signatures - Visible only on Print */}
        <div className="hidden print:block pt-12 mt-12 border-t border-slate-300">
          <div className="flex justify-between items-center text-xs text-slate-600">
            <div className="text-center">
              <div className="w-40 border-b border-slate-400 mb-2"></div>
              <span>Class Teacher Signature</span>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-1">
                Official Stamp
              </div>
            </div>
            <div className="text-center">
              <div className="w-40 border-b border-slate-400 mb-2"></div>
              <span>School Principal Signature</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

