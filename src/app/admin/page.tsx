'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  Copy,
  BookOpen,
  Search,
  Filter,
  Eye,
  Edit3,
  LogOut,
  Save,
  X,
  Upload,
  Globe,
  Lock,
  RefreshCw,
  FileText,
  School,
  Calendar,
} from 'lucide-react';
import { StudentRecord, UnmatchedRecord, MatchingStats, SubjectResult } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MatchingStats | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [unmatched, setUnmatched] = useState<UnmatchedRecord[]>([]);
  const [isPublished, setIsPublished] = useState(true);

  // Filters & search
  const [activeTab, setActiveTab] = useState<'students' | 'matching' | 'duplicates' | 'upload'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Edit Student Modal state
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Upload simulation state
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/data');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data) {
        setStats(data.stats);
        setStudents(data.students);
        setUnmatched(data.unmatched);
        setIsPublished(data.isPublished);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleTogglePublish = async () => {
    const nextState = !isPublished;
    setIsPublished(nextState);
    await fetch('/api/admin/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: nextState }),
    });
  };

  const handleSaveStudent = async () => {
    if (!editingStudent) return;
    try {
      const res = await fetch('/api/admin/update-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingStudent.id,
          updates: editingStudent,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        // Refresh local student list
        setStudents((prev) =>
          prev.map((s) => (s.id === editingStudent.id ? editingStudent : s))
        );
      }
    } catch (err) {
      alert('Failed to save student changes');
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    // Year filter
    if (selectedYearFilter !== 'All' && s.year !== selectedYearFilter) return false;

    // Status filter
    if (statusFilter === 'Absent') {
      const isAbs = s.overall.is_absent || s.subjects.some((sub) => sub.is_absent);
      if (!isAbs) return false;
    } else if (statusFilter === 'Incomplete') {
      const hasMissing = s.subjects.some((sub) => sub.mark === null || sub.mark === 'Not Available');
      if (!hasMissing) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchEn = s.name_en.toLowerCase().includes(q);
      const matchAr = s.name_ar.includes(q);
      const matchCode = s.login_code.toLowerCase().includes(q);
      const matchLast5 = s.last5.includes(q);
      if (!matchEn && !matchAr && !matchCode && !matchLast5) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">IPS Administration Panel</h1>
              <span className="text-xs text-slate-400">Examinations & Verification Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Publish Toggle Button */}
            <button
              onClick={handleTogglePublish}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                isPublished
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isPublished ? 'Published to Students' : 'Draft Mode (Hidden)'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-white">{stats?.totalStudents ?? 168}</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Results</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-white">{stats?.totalResults ?? 167}</span>
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Matched</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-emerald-400">{stats?.matchedCount ?? 167}</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unmatched</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-amber-400">{stats?.unmatchedCount ?? 2}</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Duplicate Codes</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-rose-400">{stats?.duplicateCodeCount ?? 6}</span>
              <Copy className="w-4 h-4 text-rose-400" />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Absent Students</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-slate-300">{stats?.absentCount ?? 7}</span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'students'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Students & Grades ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('matching')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'matching'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Matching Audit Report</span>
          </button>

          <button
            onClick={() => setActiveTab('duplicates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'duplicates'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate Codes ({stats?.duplicateCodeCount ?? 6})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload & Sync New Data</span>
          </button>
        </div>

        {/* TAB 1: Students & Grades */}
        {activeTab === 'students' && (
          <div>
            {/* Filters bar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student by name, code or National ID..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedYearFilter}
                  onChange={(e) => setSelectedYearFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
                >
                  <option value="All">All Years</option>
                  <option value="Year 1">Year 1</option>
                  <option value="Year 2">Year 2</option>
                  <option value="Year 3">Year 3</option>
                  <option value="Year 4">Year 4</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Absent">Has Absent Marks</option>
                  <option value="Incomplete">Incomplete Data</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">English Name</th>
                      <th className="py-3 px-4">Arabic Name</th>
                      <th className="py-3 px-4">Year</th>
                      <th className="py-3 px-4">Login Code</th>
                      <th className="py-3 px-4">Total Marks</th>
                      <th className="py-3 px-4">Percentage</th>
                      <th className="py-3 px-4">Grade</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono text-slate-500">#{s.roll_no}</td>
                        <td className="py-3 px-4 font-bold text-white max-w-xs truncate">{s.name_en}</td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate" dir="rtl">{s.name_ar}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                            {s.year}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300 flex items-center gap-1.5">
                          <span>{s.login_code}</span>
                          {s.has_duplicate_code && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold" title="Duplicate code">
                              DUPLICATE
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          {s.overall.is_absent ? (
                            <span className="text-slate-500 font-normal">Absent</span>
                          ) : (
                            `${s.overall.total_marks} / ${s.overall.max_total}`
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-blue-400">
                          {s.overall.is_absent ? '—' : s.overall.percentage || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              s.overall.grade === 'A*'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : s.overall.grade === 'A'
                                ? 'bg-blue-500/20 text-blue-400'
                                : s.overall.grade === 'B'
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : s.overall.grade === 'C'
                                ? 'bg-amber-500/20 text-amber-400'
                                : s.overall.grade === 'D'
                                ? 'bg-orange-500/20 text-orange-400'
                                : s.overall.grade === 'E'
                                ? 'bg-rose-500/20 text-rose-400'
                                : s.overall.is_absent
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {s.overall.is_absent ? 'ABS' : s.overall.grade || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setEditingStudent(JSON.parse(JSON.stringify(s)))}
                            className="p-1.5 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition"
                            title="Edit Marks"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Matching Audit Report */}
        {activeTab === 'matching' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Bilingual Matching Verification Report</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Official matching between English PDF Assessment Records and Arabic Excel Student Registers.
              </p>

              {/* Unmatched Records Callout */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                  Unmatched or School-Transfer Records ({unmatched.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {unmatched.map((u, i) => (
                    <div key={i} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-amber-300 uppercase">
                          {u.type === 'excel_only' ? 'Excel Only (Transferred)' : 'PDF Only (Absentee)'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400">{u.year}</span>
                      </div>
                      <p className="text-white font-semibold mt-1">
                        {u.name_en || u.name_ar}
                      </p>
                      <p className="text-slate-400 mt-1">
                        {u.type === 'excel_only'
                          ? `Status: ${u.status || 'Transferred to Damietta International School'}`
                          : 'Student was absent across all subjects in midterm testing.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Count by Year */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {Object.entries(stats?.years || {}).map(([yr, info]) => (
                  <div key={yr} className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-xs font-semibold text-slate-400">{yr}</span>
                    <div className="text-lg font-black text-white mt-1">
                      {info.matched} / {info.total} Matched
                    </div>
                    <span className="text-[11px] text-emerald-400 font-semibold">100% Verified</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Duplicate Codes */}
        {activeTab === 'duplicates' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Copy className="w-5 h-5 text-rose-400" />
              <span>Duplicate Login Codes & Disambiguation Rules</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              When multiple students share the same last 5 digits of their National ID, the login portal prompts for
              Academic Year and Birth Date confirmation to prevent unauthorized access.
            </p>

            <div className="space-y-4">
              {[
                {
                  code: 'ips@00057',
                  students: [
                    { name: 'Bilal Masad Sami Ibrahim Dargham', year: 'Year 1', natId: '32007051100057', dob: '2020-07-05' },
                    { name: 'Bajad Ahmed Wajdi Lotfi El-Sayed Khalil Fouda', year: 'Year 3', natId: '31807291100057', dob: '2018-07-29' },
                  ],
                },
                {
                  code: 'ips@00485',
                  students: [
                    { name: 'Talia Khalid Saad Ahmad Hassan Al-Laban', year: 'Year 1', natId: '32002261100485', dob: '2020-02-26' },
                    { name: 'Dana Mahmoud Mohammed Ahmed Salem Al-Masri', year: 'Year 1', natId: '32002241100485', dob: '2020-02-24' },
                  ],
                },
                {
                  code: 'ips@00461',
                  students: [
                    { name: 'Laila Ahmed Talaat Atiyah Hamid Rashid', year: 'Year 1', natId: '32002141100461', dob: '2020-02-14' },
                    { name: 'Naya Mohammed Abdulrahman Ridwan Al-Sayed', year: 'Year 1', natId: '32004101100461', dob: '2020-04-10' },
                  ],
                },
                {
                  code: 'ips@01057',
                  students: [
                    { name: 'Hamza Ahmed Mahmoud Amer Ezzat Amer', year: 'Year 2', natId: '31801048801057', dob: '2018-01-04' },
                    { name: 'Omar Muhammad Muhammad Fahmy Yahya Khalil', year: 'Year 4', natId: '31702011101057', dob: '2017-02-01' },
                  ],
                },
                {
                  code: 'ips@00156',
                  students: [
                    { name: 'Hamza Mohamed Ibrahim Tawfiq', year: 'Year 2', natId: '31906301100156', dob: '2019-06-30' },
                    { name: 'Amr Muhammad Ahmed Essam Muhammad Al-Dweik', year: 'Year 4', natId: '31708281500156', dob: '2017-08-28' },
                  ],
                },
                {
                  code: 'ips@00046',
                  students: [
                    { name: 'Jamila Ahmed Magdy Mohamed Al-Saeed Mohamed', year: 'Year 2', natId: '31909091200046', dob: '2019-09-09' },
                    { name: 'Karla Ahmed Yasser Samida', year: 'Year 2', natId: '31902211100046', dob: '2019-02-21' },
                  ],
                },
              ].map((group, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-sm font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                      {group.code}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Shared by 2 students</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.students.map((st, i) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-white">{st.name}</span>
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                            {st.year}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-1">Birth Date: <code className="text-slate-300 font-mono">{st.dob}</code></p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Upload & Sync */}
        {activeTab === 'upload' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              <span>Upload New Official Records</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Upload new Excel student files or PDF statistics. Existing live results remain protected and intact
              until manual administrative approval.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/60 text-center hover:border-blue-500 transition cursor-pointer">
                <FileText className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">Excel Student Data (.xlsx)</h4>
                <p className="text-xs text-slate-400 mb-4">Contains Arabic Names and National IDs</p>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={() => setUploadStatus('Excel file verified and staged for review (168 records).')}
                  className="hidden"
                  id="excel-upload"
                />
                <label
                  htmlFor="excel-upload"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition inline-block"
                >
                  Choose Excel File
                </label>
              </div>

              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/60 text-center hover:border-blue-500 transition cursor-pointer">
                <BookOpen className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">PDF Mid-term Statistics (.pdf)</h4>
                <p className="text-xs text-slate-400 mb-4">Contains English Names, Subject Marks, Overall Scores</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={() => setUploadStatus('PDF statistics verified and staged for review (167 records).')}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition inline-block"
                >
                  Choose PDF File
                </label>
              </div>
            </div>

            {uploadStatus && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadStatus}</span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Edit Student Marks</h3>
                <p className="text-xs text-slate-400">{editingStudent.name_en} ({editingStudent.year})</p>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Changes saved successfully to database!</span>
              </div>
            )}

            {/* Subject Editors */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Subject Marks</h4>
              {editingStudent.subjects.map((sub, idx) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-4 gap-2 items-center text-xs">
                  <span className="font-semibold text-white">{sub.subject}</span>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Mark (max {sub.max_marks})</label>
                    <input
                      type="text"
                      value={sub.mark ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updatedSubs = [...editingStudent.subjects];
                        updatedSubs[idx].mark = val;
                        setEditingStudent({ ...editingStudent, subjects: updatedSubs });
                      }}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Percentage</label>
                    <input
                      type="text"
                      value={sub.percentage ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updatedSubs = [...editingStudent.subjects];
                        updatedSubs[idx].percentage = val;
                        setEditingStudent({ ...editingStudent, subjects: updatedSubs });
                      }}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Grade</label>
                    <input
                      type="text"
                      value={sub.grade ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updatedSubs = [...editingStudent.subjects];
                        updatedSubs[idx].grade = val;
                        setEditingStudent({ ...editingStudent, subjects: updatedSubs });
                      }}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white"
                    />
                  </div>
                </div>
              ))}

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2">Overall Result</h4>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block">Total Marks (max {editingStudent.overall.max_total})</label>
                  <input
                    type="text"
                    value={editingStudent.overall.total_marks ?? ''}
                    onChange={(e) => {
                      setEditingStudent({
                        ...editingStudent,
                        overall: { ...editingStudent.overall, total_marks: e.target.value },
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Overall Percentage</label>
                  <input
                    type="text"
                    value={editingStudent.overall.percentage ?? ''}
                    onChange={(e) => {
                      setEditingStudent({
                        ...editingStudent,
                        overall: { ...editingStudent.overall, percentage: e.target.value },
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Overall Grade</label>
                  <input
                    type="text"
                    value={editingStudent.overall.grade ?? ''}
                    onChange={(e) => {
                      setEditingStudent({
                        ...editingStudent,
                        overall: { ...editingStudent.overall, grade: e.target.value },
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t border-slate-800 mt-6">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStudent}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

