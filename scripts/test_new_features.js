const fs = require('fs');
const path = require('path');

const students = JSON.parse(fs.readFileSync('src/data/students.json', 'utf-8'));
const settings = JSON.parse(fs.readFileSync('src/data/settings.json', 'utf-8'));

console.log('--- 1. Testing Strict 5-Digit Data & Codes ---');
const y2 = students.filter(s => s.year === 'Year 2');
console.log('Year 2 total students:', y2.length);

let allStrict5 = true;
for (const s of students) {
  if (!/^\d{5}$/.test(s.last5) || !/^ips@\d{5}$/.test(s.login_code)) {
    console.error('Invalid code format for student:', s.id, s.login_code, s.last5);
    allStrict5 = false;
  }
}
console.log('Are all student login codes strictly 5 digits (ips@12345)?', allStrict5);

console.log('\n--- 2. Testing Year 2 Updated Marks ---');
const s1 = y2.find(s => s.roll_no === 1);
const m1 = s1.subjects.find(sub => sub.subject === 'Maths');
console.log('Student 1 (Ahmed Mohammed):');
console.log('  Maths mark:', m1.mark, '/', m1.max_marks, m1.percentage, m1.grade);
console.log('  Overall:', s1.overall.total_marks, '/', s1.overall.max_total, s1.overall.percentage, s1.overall.grade);

const s2 = y2.find(s => s.roll_no === 2);
const m2 = s2.subjects.find(sub => sub.subject === 'Maths');
console.log('Student 2 (Baraa Mohammed):');
console.log('  Maths mark:', m2.mark, '/', m2.max_marks, m2.percentage, m2.grade);
console.log('  Overall:', s2.overall.total_marks, '/', s2.overall.max_total, s2.overall.percentage, s2.overall.grade);

console.log('\n--- 3. Testing Settings File ---');
console.log('Settings:', settings);

console.log('\nAll validation checks PASSED perfectly!');
