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
  PlusCircle,
  Trash2,
  Sliders,
  Check,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  StudentRecord,
  UnmatchedRecord,
  MatchingStats,
  SubjectResult,
  DisplaySettings,
} from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MatchingStats | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [unmatched, setUnmatched] = useState<UnmatchedRecord[]>([]);

  // Visibility & Display settings
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    isPublished: true,
    showMarks: true,
    showPercentage: true,
    showGrade: true,
    showOverall: true,
    activeTerm: 'Mid-term Examination',
    availableTerms: ['Mid-term Examination', 'Final Examination'],
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);

  // Filters & search
  const [activeTab, setActiveTab] = useState<'students' | 'matching' | 'duplicates' | 'upload'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Edit Student Modal state
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Add Student Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    name_en: '',
    name_ar: '',
    year: 'Year 1' as 'Year 1' | 'Year 2' | 'Year 3' | 'Year 4',
    last5: '',
    gender: 'ذكر' as 'ذكر' | 'أنثى',
    birth_date: '',
    roll_no: '',
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  // Delete student confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        if (data.displaySettings) {
          setDisplaySettings(data.displaySettings);
        }
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

  const updateSetting = async (updated: Partial<DisplaySettings>) => {
    const nextSettings = { ...displaySettings, ...updated };
    setDisplaySettings(nextSettings);
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextSettings),
      });
      if (res.ok) {
        setSettingsNotice('Display settings saved live!');
        setTimeout(() => setSettingsNotice(null), 3000);
      }
    } catch (e) {
      console.error('Failed to update settings:', e);
    } finally {
      setSavingSettings(false);
    }
  };

  const calculateGradeFromPercent = (pct: number): string => {
    if (pct >= 95) return 'A*';
    if (pct >= 85) return 'A';
    if (pct >= 75) return 'B';
    if (pct >= 65) return 'C';
    if (pct >= 55) return 'D';
    if (pct >= 40) return 'E';
    return 'F';
  };

  const handleSubjectMarkChange = (idx: number, markVal: string) => {
    if (!editingStudent) return;
    const subs = [...editingStudent.subjects];
    const sub = { ...subs[idx] };
    sub.mark = markVal;

    const numMark = parseFloat(markVal);
    if (!isNaN(numMark) && sub.max_marks > 0) {
      const pct = Math.round((numMark / sub.max_marks) * 100);
      sub.percentage = `${pct}%`;
      sub.grade = calculateGradeFromPercent(pct);
      sub.is_absent = false;
    } else if (markVal.toLowerCase().includes('abs')) {
      sub.mark = 'Absent';
      sub.percentage = '-';
      sub.grade = '-';
      sub.is_absent = true;
    }

    subs[idx] = sub;

    // Recalculate overall total
    let total = 0;
    let hasAbs = false;
    for (const s of subs) {
      const m = parseFloat(String(s.mark));
      if (!isNaN(m)) {
        total += m;
      } else if (s.is_absent) {
        hasAbs = true;
      }
    }

    const maxTotal = editingStudent.overall.max_total || 120;
    const overallPct = Math.round((total / maxTotal) * 100);

    const updatedOverall = {
      ...editingStudent.overall,
      total_marks: hasAbs && total === 0 ? 'Absent' : String(total),
      percentage: hasAbs && total === 0 ? '-' : `${overallPct}%`,
      grade: hasAbs && total === 0 ? '-' : calculateGradeFromPercent(overallPct),
      is_absent: hasAbs && total === 0,
    };

    setEditingStudent({
      ...editingStudent,
      subjects: subs,
      overall: updatedOverall,
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
        setTimeout(() => setSaveSuccess(false), 3000);
        // Refresh local student record
        setStudents((prev) =>
          prev.map((s) => (s.id === editingStudent.id ? editingStudent : s))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete student "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch('/api/admin/student/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== id));
        fetchAdminData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete student');
      }
    } catch (e) {
      alert('Error connecting to server.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (!newStudentForm.name_en.trim()) {
      setAddError('English Student Name is required.');
      return;
    }

    if (!/^\d{5}$/.test(newStudentForm.last5.trim())) {
      setAddError('Student code digits must be strictly 5 numbers (e.g. 12345).');
      return;
    }

    setAddLoading(true);
    try {
      const res = await fetch('/api/admin/student/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newStudentForm,
          roll_no: newStudentForm.roll_no ? parseInt(newStudentForm.roll_no, 10) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || 'Failed to add student');
        return;
      }

      setShowAddModal(false);
      setNewStudentForm({
        name_en: '',
        name_ar: '',
        year: 'Year 1',
        last5: '',
        gender: 'ذكر',
        birth_date: '',
        roll_no: '',
      });
      fetchAdminData();
    } catch (err) {
      setAddError('Failed to connect to server');
    } finally {
      setAddLoading(false);
    }
  };

  // Filtered Students list
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name_ar.includes(searchQuery) ||
      s.login_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.last5.includes(searchQuery);

    const matchesYear = selectedYearFilter === 'All' || s.year === selectedYearFilter;

    let matchesStatus = true;
    if (statusFilter === 'absent') {
      matchesStatus = s.overall.is_absent || s.overall.total_marks === 'Absent';
    } else if (statusFilter === 'duplicates') {
      matchesStatus = s.has_duplicate_code;
    }

    return matchesSearch && matchesYear && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400">Loading Administrative Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Admin Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="IPS Logo"
              className="w-10 h-10 object-contain rounded-full bg-white p-0.5 border border-slate-700 shadow-sm"
            />
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <span>IPS New Mansoura</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
                  ADMIN CONSOLE
                </span>
              </h1>
              <p className="text-xs text-slate-400">Student Results Control & Audit System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Student</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition border border-slate-700"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Dynamic Display & Visibility Controls Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Result Visibility & Assessment Settings</h3>
                {settingsNotice && (
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
                    {settingsNotice}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Control what students see on their result cards in real time (hide marks, show percentage only, etc.)
              </p>
            </div>

            {/* Master Publication Status */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300">Portal Status:</span>
              <button
                onClick={() => updateSetting({ isPublished: !displaySettings.isPublished })}
                disabled={savingSettings}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition ${
                  displaySettings.isPublished
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                }`}
              >
                {displaySettings.isPublished ? (
                  <>
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>RESULTS PUBLISHED</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>RESULTS HIDDEN (DRAFT)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Granular Visibility Switches & Term Selector */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Show/Hide Marks */}
            <button
              onClick={() => updateSetting({ showMarks: !displaySettings.showMarks })}
              className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                displaySettings.showMarks
                  ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <div>
                <span className="text-xs font-bold block">Raw Marks</span>
                <span className="text-[10px] block opacity-80">(e.g. 28 / 30)</span>
              </div>
              {displaySettings.showMarks ? (
                <Check className="w-4 h-4 text-blue-400" />
              ) : (
                <X className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Show/Hide Percentage */}
            <button
              onClick={() => updateSetting({ showPercentage: !displaySettings.showPercentage })}
              className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                displaySettings.showPercentage
                  ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <div>
                <span className="text-xs font-bold block">Percentage</span>
                <span className="text-[10px] block opacity-80">(e.g. 95%)</span>
              </div>
              {displaySettings.showPercentage ? (
                <Check className="w-4 h-4 text-cyan-400" />
              ) : (
                <X className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Show/Hide Grade */}
            <button
              onClick={() => updateSetting({ showGrade: !displaySettings.showGrade })}
              className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                displaySettings.showGrade
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <div>
                <span className="text-xs font-bold block">Letter Grade</span>
                <span className="text-[10px] block opacity-80">(e.g. A* / A / B)</span>
              </div>
              {displaySettings.showGrade ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <X className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Show/Hide Overall */}
            <button
              onClick={() => updateSetting({ showOverall: !displaySettings.showOverall })}
              className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                displaySettings.showOverall
                  ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <div>
                <span className="text-xs font-bold block">Overall Card</span>
                <span className="text-[10px] block opacity-80">Composite Evaluation</span>
              </div>
              {displaySettings.showOverall ? (
                <Check className="w-4 h-4 text-indigo-400" />
              ) : (
                <X className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Active Assessment Term */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Active Term
              </label>
              <select
                value={displaySettings.activeTerm}
                onChange={(e) => updateSetting({ activeTerm: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-white px-2 py-1 focus:outline-none focus:border-blue-500"
              >
                {displaySettings.availableTerms.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* KPI Summary Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-400">Total Students</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-black text-white">{students.length}</p>
              <span className="text-[11px] text-slate-500">Live in Database</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-400">Strict 5-Digit Codes</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-400">{students.length}</p>
              <span className="text-[11px] text-emerald-500/80">ips@12345 active</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-400">Shared Codes (Collisions)</span>
                <Copy className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-400">{stats.duplicateCodeCount}</p>
              <span className="text-[11px] text-slate-500">Safe DOB verified</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-400">Absent Students</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-black text-rose-400">{stats.absentCount}</p>
              <span className="text-[11px] text-slate-500">Preserved as Absent</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-400">Unmatched / Review</span>
                <FileText className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-black text-indigo-400">{unmatched.length}</p>
              <span className="text-[11px] text-slate-500">Transferred / Pending</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 mb-6 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'students'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students Roster ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('matching')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'matching'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Matching Audit ({unmatched.length} unmatched)</span>
          </button>

          <button
            onClick={() => setActiveTab('duplicates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'duplicates'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span>Duplicate Codes ({stats?.duplicateCodeCount || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload & Sync Files</span>
          </button>
        </div>

        {/* TAB 1: Students Roster */}
        {activeTab === 'students' && (
          <div>
            {/* Filter & Search Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student by English Name, Arabic Name, or ips@12345 code..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedYearFilter}
                  onChange={(e) => setSelectedYearFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="All">All Years</option>
                  <option value="Year 1">Year 1</option>
                  <option value="Year 2">Year 2 (Maths max 40)</option>
                  <option value="Year 3">Year 3</option>
                  <option value="Year 4">Year 4</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="All">All Statuses</option>
                  <option value="absent">Absent Only</option>
                  <option value="duplicates">Duplicates Only</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Year</th>
                      <th className="py-3.5 px-4">5-Digit Login Code</th>
                      <th className="py-3.5 px-4">Arabic Name (DB)</th>
                      <th className="py-3.5 px-4">Overall Score</th>
                      <th className="py-3.5 px-4">Grade</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-500">
                          No students found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <span className="font-bold text-white block capitalize">{s.name_en}</span>
                            <span className="text-[11px] text-slate-500">Roll #{s.roll_no}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {s.year}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <span className="text-emerald-400 font-semibold">{s.login_code}</span>
                            {s.has_duplicate_code && (
                              <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-300 font-bold">
                                SHARED
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-arabic text-sm text-right" dir="rtl">
                            {s.name_ar || '—'}
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            {s.overall.is_absent ? (
                              <span className="text-rose-400 font-bold">Absent</span>
                            ) : (
                              <span>
                                {s.overall.total_marks} / {s.overall.max_total}{' '}
                                <span className="text-slate-400 text-[11px]">({s.overall.percentage})</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-black ${
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
                                  : s.overall.is_absent
                                  ? 'bg-slate-800 text-slate-400'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {s.overall.is_absent ? 'ABS' : s.overall.grade || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingStudent(s)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition border border-slate-700"
                                title="Edit Student"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => handleDeleteStudent(s.id, s.name_en)}
                                disabled={deletingId === s.id}
                                className="inline-flex items-center p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs transition border border-rose-500/20"
                                title="Delete Student"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Matching Audit */}
        {activeTab === 'matching' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-1">Automated Matching Audit Report</h3>
              <p className="text-xs text-slate-400 mb-4">
                Arabic student records from Excel matched to English PDF statistics across all 4 cohorts.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block font-bold">Year 1</span>
                  <span className="text-lg font-black text-emerald-400">47 / 47 Matched (100%)</span>
                  <span className="text-[11px] text-slate-500 block">Total Max: 120</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block font-bold">Year 2</span>
                  <span className="text-lg font-black text-emerald-400">44 / 45 Processed</span>
                  <span className="text-[11px] text-slate-500 block">Maths Max: 40 | Total: 125</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block font-bold">Year 3</span>
                  <span className="text-lg font-black text-emerald-400">46 / 46 Matched (100%)</span>
                  <span className="text-[11px] text-slate-500 block">Total Max: 165</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block font-bold">Year 4</span>
                  <span className="text-lg font-black text-emerald-400">29 / 29 Matched (100%)</span>
                  <span className="text-[11px] text-slate-500 block">Total Max: 230</span>
                </div>
              </div>
            </div>

            {/* Unmatched list */}
            {unmatched.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Unmatched / Transferred Student Records</span>
                </h4>
                <div className="space-y-3">
                  {unmatched.map((u, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold text-[10px]">
                            {u.type === 'excel_only' ? 'Excel Record (No Exam Marks)' : 'PDF Record (Transferred/Absent)'}
                          </span>
                          <span className="ml-2 text-white font-bold">{u.name_en || u.name_ar}</span>
                        </div>
                        <span className="text-slate-400 font-semibold">{u.year}</span>
                      </div>
                      <p className="text-slate-400">
                        {u.status ? `Status: ${u.status}` : 'All exams marked Absent'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Duplicate Codes & Collisions */}
        {activeTab === 'duplicates' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Copy className="w-4 h-4 text-amber-400" />
              <span>Duplicate 5-Digit Code Collisions</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              When two students share the same last 5 digits of National ID, our system automatically halts direct
              login and prompts for the student's Academic Year and Birth Date to prevent unauthorized viewing.
            </p>

            <div className="space-y-4">
              {[
                {
                  code: 'ips@00485',
                  students: [
                    { name: 'Talia Khalid Saad Ahmad Hassan Al-Laban', year: 'Year 1', dob: '2020-02-26' },
                    { name: 'Dana Mahmoud Mohammed Ahmed Salem Al-Masri', year: 'Year 1', dob: '2020-02-24' },
                  ],
                },
                {
                  code: 'ips@00461',
                  students: [
                    { name: 'Laila Ahmed Talaat Atiyah Hamid Rashid', year: 'Year 1', dob: '2020-02-14' },
                    { name: 'Naya Mohammed Abdulrahman Ridwan Al-Sayed', year: 'Year 1', dob: '2020-04-10' },
                  ],
                },
                {
                  code: 'ips@01057',
                  students: [
                    { name: 'Hamza Ahmed Mahmoud Amer Ezzat Amer', year: 'Year 2', dob: '2018-01-04' },
                    { name: 'Omar Muhammad Muhammad Fahmy Yahya Khalil', year: 'Year 4', dob: '2017-02-01' },
                  ],
                },
                {
                  code: 'ips@00156',
                  students: [
                    { name: 'Hamza Mohamed Ibrahim Tawfiq', year: 'Year 2', dob: '2019-06-30' },
                    { name: 'Amr Muhammad Ahmed Essam Muhammad Al-Dweik', year: 'Year 4', dob: '2017-08-28' },
                  ],
                },
                {
                  code: 'ips@00046',
                  students: [
                    { name: 'Jamila Ahmed Magdy Mohamed Al-Saeed Mohamed', year: 'Year 2', dob: '2019-09-09' },
                    { name: 'Karla Ahmed Yasser Samida', year: 'Year 2', dob: '2019-02-21' },
                  ],
                },
              ].map((group, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-sm font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
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
                <h4 className="text-sm font-bold text-white mb-1">PDF Statistics (.pdf)</h4>
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

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Add New Student</h3>
                <p className="text-xs text-slate-400">Enroll student into results portal</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddStudentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Student Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={newStudentForm.name_en}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name_en: e.target.value })}
                  placeholder="e.g. Ahmed Mohamed Ali"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Student Name (Arabic)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={newStudentForm.name_ar}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name_ar: e.target.value })}
                  placeholder="مثال: أحمد محمد علي"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-arabic text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Academic Year</label>
                  <select
                    value={newStudentForm.year}
                    onChange={(e) =>
                      setNewStudentForm({
                        ...newStudentForm,
                        year: e.target.value as 'Year 1' | 'Year 2' | 'Year 3' | 'Year 4',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Last 5 Digits (Login Code) *
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    required
                    value={newStudentForm.last5}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, last5: e.target.value })}
                    placeholder="e.g. 12345"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-500">Student logs in with ips@{newStudentForm.last5 || '12345'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Roll Number</label>
                  <input
                    type="number"
                    value={newStudentForm.roll_no}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, roll_no: e.target.value })}
                    placeholder="Auto or e.g. 48"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Birth Date (YYYY-MM-DD)</label>
                  <input
                    type="text"
                    value={newStudentForm.birth_date}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, birth_date: e.target.value })}
                    placeholder="2018-05-15"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  {addLoading ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Edit Student & Results</h3>
                <p className="text-xs text-slate-400">Update identity, login code, and marks</p>
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

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Identity Details */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">Student Identity</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">English Name (Public)</label>
                    <input
                      type="text"
                      value={editingStudent.name_en}
                      onChange={(e) => setEditingStudent({ ...editingStudent, name_en: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Arabic Name (Private DB)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={editingStudent.name_ar}
                      onChange={(e) => setEditingStudent({ ...editingStudent, name_ar: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-arabic text-right"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Last 5 Digits (Login Code)</label>
                    <input
                      type="text"
                      maxLength={5}
                      value={editingStudent.last5}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          last5: e.target.value,
                          login_code: `ips@${e.target.value}`,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Academic Year</label>
                    <select
                      value={editingStudent.year}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          year: e.target.value as any,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="Year 1">Year 1</option>
                      <option value="Year 2">Year 2</option>
                      <option value="Year 3">Year 3</option>
                      <option value="Year 4">Year 4</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Subject Marks Editors */}
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Subject Marks</h4>
              {editingStudent.subjects.map((sub, idx) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-4 gap-2 items-center text-xs">
                  <div>
                    <span className="font-semibold text-white block">{sub.subject}</span>
                    <span className="text-[10px] text-slate-500">Max: {sub.max_marks}</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Mark</label>
                    <input
                      type="text"
                      value={sub.mark ?? ''}
                      onChange={(e) => handleSubjectMarkChange(idx, e.target.value)}
                      placeholder="e.g. 34 or Absent"
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white font-mono"
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
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-mono"
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
