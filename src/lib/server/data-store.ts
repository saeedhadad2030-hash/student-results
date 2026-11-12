import fs from 'fs';
import path from 'path';
import {
  StudentRecord,
  UnmatchedRecord,
  MatchingStats,
  SubjectResult,
  OverallResult,
  DisplaySettings,
} from '@/types';

// Path to bundled private datasets
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const UNMATCHED_FILE = path.join(DATA_DIR, 'unmatched.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// In-memory cache for fast lookups & serverless state
let cachedStudents: StudentRecord[] | null = null;
let cachedUnmatched: UnmatchedRecord[] | null = null;
let cachedSettings: DisplaySettings | null = null;

function loadData() {
  if (!cachedStudents) {
    try {
      if (fs.existsSync(STUDENTS_FILE)) {
        const raw = fs.readFileSync(STUDENTS_FILE, 'utf-8');
        cachedStudents = JSON.parse(raw);
      } else {
        cachedStudents = [];
      }
    } catch (err) {
      console.error('Error loading students data:', err);
      cachedStudents = [];
    }
  }

  if (!cachedUnmatched) {
    try {
      if (fs.existsSync(UNMATCHED_FILE)) {
        const raw = fs.readFileSync(UNMATCHED_FILE, 'utf-8');
        cachedUnmatched = JSON.parse(raw);
      } else {
        cachedUnmatched = [];
      }
    } catch (err) {
      console.error('Error loading unmatched data:', err);
      cachedUnmatched = [];
    }
  }
}

function persistStudents(): boolean {
  if (!cachedStudents) return false;
  try {
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(cachedStudents, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to persist student changes to disk:', err);
    return false;
  }
}

export function getDisplaySettings(): DisplaySettings {
  if (!cachedSettings) {
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        cachedSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      }
    } catch (e) {
      console.error('Error reading settings file:', e);
    }
    if (!cachedSettings) {
      cachedSettings = {
        isPublished: true,
        showMarks: true,
        showPercentage: true,
        showGrade: true,
        showOverall: true,
        activeTerm: 'Mid-term Examination',
        availableTerms: ['Mid-term Examination', 'Final Examination'],
      };
    }
  }
  return cachedSettings;
}

export function updateDisplaySettings(updates: Partial<DisplaySettings>): DisplaySettings {
  const current = getDisplaySettings();
  cachedSettings = {
    ...current,
    ...updates,
  };
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(cachedSettings, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write settings file:', e);
  }
  return cachedSettings;
}

export function getAllStudents(): StudentRecord[] {
  loadData();
  return cachedStudents || [];
}

export function getUnmatchedRecords(): UnmatchedRecord[] {
  loadData();
  return cachedUnmatched || [];
}

export function isResultsPublished(): boolean {
  return getDisplaySettings().isPublished;
}

export function setResultsPublished(published: boolean): void {
  updateDisplaySettings({ isPublished: published });
}

export type LoginLookupResult =
  | { status: 'found'; student: StudentRecord }
  | { status: 'collision'; count: number; candidates: { id: string; year: string; name_en_masked: string }[] }
  | { status: 'not_found' };

/**
 * Look up student strictly by 5-digit login code: "ips@12345" or "12345"
 * Last 4 digits are rejected per user instruction.
 */
export function lookupByLoginCode(code: string): LoginLookupResult {
  loadData();
  const normalized = code.trim().toLowerCase();

  // Extract the digits: either "ips@12345" or "12345"
  let digits = normalized;
  if (normalized.startsWith('ips@')) {
    digits = normalized.replace('ips@', '');
  }

  // Strict 5 digits only
  if (!/^\d{5}$/.test(digits)) {
    return { status: 'not_found' };
  }

  const all = cachedStudents || [];
  // Match by exact last 5 digits or full code
  const matches = all.filter((s) => {
    return s.last5 === digits || s.login_code.toLowerCase() === `ips@${digits}`;
  });

  if (matches.length === 0) {
    return { status: 'not_found' };
  }

  if (matches.length === 1) {
    return { status: 'found', student: matches[0] };
  }

  // Duplicate collision detected!
  return {
    status: 'collision',
    count: matches.length,
    candidates: matches.map((m) => ({
      id: m.id,
      year: m.year,
      name_en_masked: maskName(m.name_en),
    })),
  };
}

/**
 * Secondary verification for students who share duplicate codes
 * Allows specifying Academic Year and Birth Date (YYYY-MM-DD or DD/MM/YYYY)
 */
export function verifySecondaryLogin(
  code: string,
  year: string,
  birthDateOrLast4: string
): StudentRecord | null {
  loadData();
  const normalizedCode = code.trim().toLowerCase();
  let digits = normalizedCode.replace('ips@', '');

  // Strict 5 digits
  if (!/^\d{5}$/.test(digits)) {
    return null;
  }

  const all = cachedStudents || [];
  const candidates = all.filter(
    (s) => s.last5 === digits || s.login_code.toLowerCase() === `ips@${digits}`
  );

  const cleanInput = birthDateOrLast4.trim().replace(/\//g, '-');

  for (const c of candidates) {
    if (c.year.toLowerCase() === year.trim().toLowerCase()) {
      // Check birth date match
      if (c.birth_date === cleanInput) {
        return c;
      }
      // Or birth date in DD-MM-YYYY format
      const parts = c.birth_date.split('-'); // [YYYY, MM, DD]
      if (parts.length === 3) {
        const ddmmyyyy = `${parts[2]}-${parts[1]}-${parts[0]}`;
        if (ddmmyyyy === cleanInput) {
          return c;
        }
      }
      // If candidate matched year and there are only candidates in different years
      const candidatesInSameYear = candidates.filter(
        (cand) => cand.year.toLowerCase() === year.trim().toLowerCase()
      );
      if (candidatesInSameYear.length === 1) {
        return c;
      }
    }
  }

  return null;
}

export function getStudentById(id: string): StudentRecord | null {
  loadData();
  const all = cachedStudents || [];
  return all.find((s) => s.id === id) || null;
}

function recomputeDuplicates(all: StudentRecord[]) {
  const counts: Record<string, string[]> = {};
  for (const s of all) {
    if (!s.last5) continue;
    if (!counts[s.last5]) counts[s.last5] = [];
    counts[s.last5].push(s.id);
  }

  for (const s of all) {
    const matchingIds = (s.last5 && counts[s.last5]) || [];
    s.duplicate_count = matchingIds.length;
    s.has_duplicate_code = matchingIds.length > 1;
    s.collision_ids = matchingIds.filter((cid) => cid !== s.id);
  }
}

export function addStudent(newStudent: {
  name_en: string;
  name_ar?: string;
  year: 'Year 1' | 'Year 2' | 'Year 3' | 'Year 4';
  last5: string;
  gender?: 'ذكر' | 'أنثى' | 'Male' | 'Female';
  birth_date?: string;
  roll_no?: number;
  subjects?: SubjectResult[];
  overall?: OverallResult;
}): { success: boolean; student?: StudentRecord; error?: string } {
  loadData();
  if (!cachedStudents) cachedStudents = [];

  const last5 = newStudent.last5.trim();
  if (!/^\d{5}$/.test(last5)) {
    return { success: false, error: 'Student login code must be exactly 5 digits (e.g. 12345)' };
  }

  if (!newStudent.name_en?.trim()) {
    return { success: false, error: 'English name is required.' };
  }

  const yearNum = newStudent.year.replace('Year ', '');
  const id = `Year${yearNum}_${Date.now()}`;
  const roll_no = newStudent.roll_no || (cachedStudents.filter((s) => s.year === newStudent.year).length + 1);

  let subjects = newStudent.subjects;
  let overall = newStudent.overall;

  if (!subjects || subjects.length === 0) {
    const yearDefaults: Record<string, { maxTotal: number; subs: { name: string; max: number }[] }> = {
      'Year 1': { maxTotal: 120, subs: [{ name: 'English', max: 30 }, { name: 'Maths', max: 50 }, { name: 'Science', max: 25 }, { name: 'Arabic', max: 15 }] },
      'Year 2': { maxTotal: 125, subs: [{ name: 'English', max: 35 }, { name: 'Maths', max: 40 }, { name: 'Science', max: 35 }, { name: 'Arabic', max: 15 }] },
      'Year 3': { maxTotal: 165, subs: [{ name: 'English', max: 40 }, { name: 'Maths', max: 60 }, { name: 'Science', max: 40 }, { name: 'Arabic', max: 25 }] },
      'Year 4': { maxTotal: 230, subs: [{ name: 'English', max: 40 }, { name: 'Maths', max: 60 }, { name: 'Science', max: 40 }, { name: 'Second L', max: 30 }, { name: 'Social', max: 30 }, { name: 'Arabic', max: 30 }] },
    };

    const config = yearDefaults[newStudent.year] || yearDefaults['Year 1'];
    subjects = config.subs.map((s) => ({
      subject: s.name,
      max_marks: s.max,
      mark: null,
      percentage: null,
      grade: null,
      is_absent: false,
    }));
    overall = {
      total_marks: null,
      max_total: config.maxTotal,
      percentage: null,
      grade: null,
      is_absent: false,
      is_error: false,
    };
  }

  const record: StudentRecord = {
    id,
    roll_no,
    year: newStudent.year,
    name_en: newStudent.name_en.trim(),
    name_ar: newStudent.name_ar?.trim() || '',
    gender: newStudent.gender || 'ذكر',
    national_id_hash: '',
    last5,
    last4: last5.slice(-4),
    birth_date: newStudent.birth_date || '',
    login_code: `ips@${last5}`,
    status: 'enrolled',
    has_duplicate_code: false,
    subjects,
    overall: overall!,
    is_published: true,
    updated_at: new Date().toISOString(),
  };

  cachedStudents.push(record);
  recomputeDuplicates(cachedStudents);
  persistStudents();

  return { success: true, student: record };
}

export function deleteStudent(id: string): { success: boolean; error?: string } {
  loadData();
  if (!cachedStudents) return { success: false, error: 'Database not loaded' };

  const idx = cachedStudents.findIndex((s) => s.id === id);
  if (idx === -1) {
    return { success: false, error: 'Student not found' };
  }

  cachedStudents.splice(idx, 1);
  recomputeDuplicates(cachedStudents);
  persistStudents();

  return { success: true };
}

export function updateStudent(id: string, updates: Partial<StudentRecord>): boolean {
  loadData();
  if (!cachedStudents) return false;
  const idx = cachedStudents.findIndex((s) => s.id === id);
  if (idx === -1) return false;

  const current = cachedStudents[idx];
  const last5 = updates.last5 ? updates.last5.trim() : current.last5;
  const login_code = updates.last5 ? `ips@${last5}` : (updates.login_code || current.login_code);
  const last4 = last5 ? last5.slice(-4) : current.last4;

  cachedStudents[idx] = {
    ...current,
    ...updates,
    last5,
    last4,
    login_code,
    updated_at: new Date().toISOString(),
  };

  recomputeDuplicates(cachedStudents);
  persistStudents();
  return true;
}

export function getMatchingStats(): MatchingStats {
  loadData();
  const all = cachedStudents || [];
  const unmatched = cachedUnmatched || [];
  const settings = getDisplaySettings();

  const years: Record<string, { total: number; matched: number; absent: number }> = {
    'Year 1': { total: 0, matched: 0, absent: 0 },
    'Year 2': { total: 0, matched: 0, absent: 0 },
    'Year 3': { total: 0, matched: 0, absent: 0 },
    'Year 4': { total: 0, matched: 0, absent: 0 },
  };

  let absentCount = 0;
  for (const s of all) {
    if (years[s.year]) {
      years[s.year].total += 1;
      years[s.year].matched += 1;
      if (s.overall.is_absent || s.overall.total_marks === 'Absent') {
        years[s.year].absent += 1;
        absentCount += 1;
      }
    }
  }

  // Count duplicates
  const codeCounts: Record<string, number> = {};
  for (const s of all) {
    codeCounts[s.login_code] = (codeCounts[s.login_code] || 0) + 1;
  }
  const duplicateCodeCount = Object.values(codeCounts).filter((c) => c > 1).length;

  return {
    totalStudents: all.length + unmatched.filter((u) => u.type === 'excel_only').length,
    totalResults: all.length + unmatched.filter((u) => u.type === 'pdf_only').length,
    matchedCount: all.length,
    unmatchedCount: unmatched.length,
    duplicateCodeCount,
    absentCount,
    isPublished: settings.isPublished,
    years,
  };
}

function maskName(name: string): string {
  const parts = name.split(' ');
  if (parts.length <= 1) return name;
  return parts[0] + ' ' + parts.slice(1).map((p) => p[0] + '***').join(' ');
}
