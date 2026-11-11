import fs from 'fs';
import path from 'path';
import { StudentRecord, UnmatchedRecord, MatchingStats, SubjectResult, OverallResult } from '@/types';

// Path to bundled private datasets
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const UNMATCHED_FILE = path.join(DATA_DIR, 'unmatched.json');

// In-memory cache for fast lookups & serverless state
let cachedStudents: StudentRecord[] | null = null;
let cachedUnmatched: UnmatchedRecord[] | null = null;
let cachedIsPublished = true;

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

export function getAllStudents(): StudentRecord[] {
  loadData();
  return cachedStudents || [];
}

export function getUnmatchedRecords(): UnmatchedRecord[] {
  loadData();
  return cachedUnmatched || [];
}

export function isResultsPublished(): boolean {
  return cachedIsPublished;
}

export function setResultsPublished(published: boolean): void {
  cachedIsPublished = published;
}

export type LoginLookupResult =
  | { status: 'found'; student: StudentRecord }
  | { status: 'collision'; count: number; candidates: { id: string; year: string; name_en_masked: string }[] }
  | { status: 'not_found' };

/**
 * Look up student by login code: ips@12345
 */
export function lookupByLoginCode(code: string): LoginLookupResult {
  loadData();
  const normalized = code.trim().toLowerCase();
  
  // Extract the digits: either "ips@12345" or "12345"
  let digits = normalized;
  if (normalized.startsWith('ips@')) {
    digits = normalized.replace('ips@', '');
  }

  if (!/^\d{4,5}$/.test(digits)) {
    return { status: 'not_found' };
  }

  const all = cachedStudents || [];
  // Match by exact last 5 digits or full code
  const matches = all.filter((s) => {
    return s.last5 === digits || s.login_code.toLowerCase() === `ips@${digits}`;
  });

  if (matches.length === 0) {
    // If not found by 5 digits, check 4 digits
    if (digits.length === 4) {
      const match4 = all.filter((s) => s.last4 === digits);
      if (match4.length === 1) {
        return { status: 'found', student: match4[0] };
      } else if (match4.length > 1) {
        return {
          status: 'collision',
          count: match4.length,
          candidates: match4.map((m) => ({
            id: m.id,
            year: m.year,
            name_en_masked: maskName(m.name_en),
          })),
        };
      }
    }
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

  const all = cachedStudents || [];
  const candidates = all.filter(
    (s) => s.last5 === digits || s.login_code.toLowerCase() === `ips@${digits}` || s.last4 === digits
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
        // If year alone unambiguously distinguishes the duplicate, allow with year
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

export function updateStudent(id: string, updates: Partial<StudentRecord>): boolean {
  loadData();
  if (!cachedStudents) return false;
  const idx = cachedStudents.findIndex((s) => s.id === id);
  if (idx === -1) return false;

  cachedStudents[idx] = {
    ...cachedStudents[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(cachedStudents, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to persist student update:', err);
    return true; // Still updated in memory for the session
  }
}

export function getMatchingStats(): MatchingStats {
  loadData();
  const all = cachedStudents || [];
  const unmatched = cachedUnmatched || [];

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
    isPublished: cachedIsPublished,
    years,
  };
}

function maskName(name: string): string {
  const parts = name.split(' ');
  if (parts.length <= 1) return name;
  return parts[0] + ' ' + parts.slice(1).map((p) => p[0] + '***').join(' ');
}
