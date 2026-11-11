export type Grade = 'A*' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'Absent' | 'N/A';

export interface SubjectResult {
  subject: string;
  max_marks: number;
  mark: string | number | null; // e.g. 29 or "Absent"
  percentage: string | null;     // e.g. "97%"
  grade: Grade | string | null;  // e.g. "A*"
  is_absent: boolean;
}

export interface OverallResult {
  total_marks: string | number | null; // e.g. 119 or "Absent" or "Not Available"
  max_total: number;                   // e.g. 120, 165, 230
  percentage: string | null;           // e.g. "99%"
  grade: Grade | string | null;        // e.g. "A*"
  is_absent: boolean;
  is_error: boolean;
}

export interface StudentRecord {
  id: string;                          // e.g. "Year1_1"
  roll_no: number;
  year: 'Year 1' | 'Year 2' | 'Year 3' | 'Year 4';
  name_en: string;                     // Displayed to students
  name_ar: string;                     // Kept in DB for administrative matching
  gender: 'ذكر' | 'أنثى' | 'Male' | 'Female';
  national_id_hash: string;            // Hashed or masked for high privacy
  last5: string;                       // Last 5 digits (code: ips@12345)
  last4: string;                       // Last 4 digits
  birth_date: string;                  // YYYY-MM-DD
  login_code: string;                  // ips@12345
  status: 'enrolled' | 'transferred' | 'withdrawn' | string;
  has_duplicate_code: boolean;
  duplicate_count?: number;
  collision_ids?: string[];
  subjects: SubjectResult[];
  overall: OverallResult;
  is_published: boolean;
  updated_at?: string;
}

export interface StudentSession {
  studentId: string;
  year: string;
  name_en: string;
  exp: number;
}

export interface AdminSession {
  role: 'admin';
  username: string;
  exp: number;
}

export interface UnmatchedRecord {
  type: 'excel_only' | 'pdf_only';
  year: string;
  roll_no?: number;
  excel_id?: number;
  name_en?: string;
  name_ar?: string;
  national_id?: string;
  status?: string;
  subjects?: SubjectResult[];
  overall?: OverallResult;
}

export interface MatchingStats {
  totalStudents: number;
  totalResults: number;
  matchedCount: number;
  unmatchedCount: number;
  duplicateCodeCount: number;
  absentCount: number;
  isPublished: boolean;
  years: {
    [key: string]: {
      total: number;
      matched: number;
      absent: number;
    };
  };
}

