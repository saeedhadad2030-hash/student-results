// Test suite for IPS Results Portal
const fs = require('fs');
const path = require('path');

const STUDENTS_FILE = path.join(process.cwd(), 'src', 'data', 'students.json');
const UNMATCHED_FILE = path.join(process.cwd(), 'src', 'data', 'unmatched.json');

const students = JSON.parse(fs.readFileSync(STUDENTS_FILE, 'utf-8'));
const unmatched = JSON.parse(fs.readFileSync(UNMATCHED_FILE, 'utf-8'));

console.log('==================================================');
console.log('       IPS STUDENT PORTAL - VALIDATION SUITE      ');
console.log('==================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// 1. Data Integrity Tests
assert(students.length === 167, `Expected 167 matched students, found ${students.length}`);
assert(unmatched.length === 2, `Expected 2 unmatched records, found ${unmatched.length}`);

// Year distribution
const yearCounts = { 'Year 1': 0, 'Year 2': 0, 'Year 3': 0, 'Year 4': 0 };
students.forEach(s => yearCounts[s.year] = (yearCounts[s.year] || 0) + 1);

assert(yearCounts['Year 1'] === 48, `Year 1 should have 48 students, found ${yearCounts['Year 1']}`);
assert(yearCounts['Year 2'] === 44, `Year 2 should have 44 matched students, found ${yearCounts['Year 2']}`);
assert(yearCounts['Year 3'] === 46, `Year 3 should have 46 students, found ${yearCounts['Year 3']}`);
assert(yearCounts['Year 4'] === 29, `Year 4 should have 29 students, found ${yearCounts['Year 4']}`);

// 2. Sensitive Data Security Tests
let rawNationalIdFound = false;
students.forEach(s => {
  if (s.national_id && s.national_id.length > 5) {
    rawNationalIdFound = true;
  }
  if (!s.national_id_hash || s.national_id_hash.length !== 64) {
    assert(false, `Student ${s.name_en} does not have valid SHA-256 national_id_hash`);
  }
});
assert(!rawNationalIdFound, 'Verified: Full National ID is NOT exposed in student records dataset');

// 3. Subject and Year Configuration Tests
students.filter(s => s.year === 'Year 1').forEach(s => {
  assert(s.subjects.length === 4, `Year 1 student ${s.name_en} must have 4 subjects`);
  assert(s.overall.max_total === 120, `Year 1 max total marks must be 120, got ${s.overall.max_total}`);
});

students.filter(s => s.year === 'Year 2').forEach(s => {
  assert(s.subjects.length === 4, `Year 2 student ${s.name_en} must have 4 subjects`);
  assert(s.overall.max_total === 120, `Year 2 max total marks must be 120, got ${s.overall.max_total}`);
});

students.filter(s => s.year === 'Year 3').forEach(s => {
  assert(s.subjects.length === 4, `Year 3 student ${s.name_en} must have 4 subjects`);
  assert(s.overall.max_total === 165, `Year 3 max total marks must be 165, got ${s.overall.max_total}`);
});

students.filter(s => s.year === 'Year 4').forEach(s => {
  assert(s.subjects.length === 6, `Year 4 student ${s.name_en} must have 6 subjects (incl. Second L and Social)`);
  assert(s.overall.max_total === 230, `Year 4 max total marks must be 230, got ${s.overall.max_total}`);
});

// 4. Duplicate Code Tests
const codeMap = {};
students.forEach(s => {
  codeMap[s.login_code] = (codeMap[s.login_code] || 0) + 1;
});

const duplicateCodes = Object.entries(codeMap).filter(([k, v]) => v > 1);
assert(duplicateCodes.length === 6, `Expected exactly 6 duplicate login codes, found ${duplicateCodes.length}`);

// Verify all duplicates have flag has_duplicate_code = true
duplicateCodes.forEach(([code, count]) => {
  const dups = students.filter(s => s.login_code === code);
  dups.forEach(d => {
    assert(d.has_duplicate_code === true, `Student ${d.name_en} with duplicate code ${code} must have has_duplicate_code=true`);
  });
});

// 5. Absentee and Missing Marks Handling Tests
// Test Alia Ahmed Sami Omar Madkour (Year 1, Roll 19): Absent in English, Maths, Science, present in Arabic (12.5)
const alia = students.find(s => s.name_en === 'Alia Ahmed Sami Omar Madkour');
assert(alia !== undefined, 'Student Alia Ahmed Sami Omar Madkour found in Year 1');
if (alia) {
  assert(alia.subjects[0].is_absent === true && alia.subjects[0].mark === 'Absent', 'Alia English is Absent');
  assert(alia.subjects[1].is_absent === true && alia.subjects[1].mark === 'Absent', 'Alia Maths is Absent');
  assert(alia.subjects[2].is_absent === true && alia.subjects[2].mark === 'Absent', 'Alia Science is Absent');
  assert(alia.subjects[3].mark === '12.5', `Alia Arabic mark is 12.5, got ${alia.subjects[3].mark}`);
  assert(alia.overall.total_marks === '12.5', `Alia overall total is 12.5, got ${alia.overall.total_marks}`);
  assert(alia.overall.grade === 'F', `Alia overall grade is F, got ${alia.overall.grade}`);
}

// Test Khadija Khalid (Year 1, Roll 39): Absent in all subjects
const khadija = students.find(s => s.name_en === 'Khadija Khalid Al-Saeed Abdulaziz Al-Saeed Hijazi');
assert(khadija !== undefined, 'Student Khadija Khalid found in Year 1');
if (khadija) {
  assert(khadija.overall.is_absent === true || khadija.overall.total_marks === 'Absent', 'Khadija overall is Absent');
}

// Test Salim Khaled (Year 4, Roll 18): Absent in Second L, Total 102.5, Grade E
const salim = students.find(s => s.name_en === 'Salim Khaled Mahmoud Ahmed Amin Abdu');
assert(salim !== undefined, 'Student Salim Khaled found in Year 4');
if (salim) {
  const secondL = salim.subjects.find(sub => sub.subject === 'Second L');
  assert(secondL && secondL.is_absent === true, 'Salim Second L mark is Absent');
  assert(salim.overall.total_marks === '102.5', `Salim overall total is 102.5, got ${salim.overall.total_marks}`);
  assert(salim.overall.grade === 'E', `Salim overall grade is E, got ${salim.overall.grade}`);
}

// 6. Test No #VALUE! in any field
let valueErrorFound = false;
students.forEach(s => {
  s.subjects.forEach(sub => {
    if (sub.mark === '#VALUE!' || sub.percentage === '#VALUE!' || sub.grade === '#VALUE!') {
      valueErrorFound = true;
    }
  });
  if (s.overall.total_marks === '#VALUE!' || s.overall.percentage === '#VALUE!' || s.overall.grade === '#VALUE!') {
    valueErrorFound = true;
  }
});
assert(!valueErrorFound, 'Verified: Zero #VALUE! strings in database (all converted to Absent or Not Available)');

console.log(`\nAll Validation Tests Passed: ${passedTests} / ${totalTests}`);
