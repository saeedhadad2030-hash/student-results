const fs = require('fs');
const path = require('path');

const students = JSON.parse(fs.readFileSync('src/data/students.json', 'utf-8'));
const match = students.find(s => s.login_code === 'ips@01405');

console.log('Result for ips@01405:');
if (match) {
  console.log(`- Student: ${match.name_en} (${match.name_ar})`);
  console.log(`- Year: ${match.year}`);
  console.log(`- Subjects:`);
  match.subjects.forEach(sub => {
    console.log(`   * ${sub.subject}: ${sub.mark}/${sub.max_marks} (${sub.percentage}) - Grade: ${sub.grade}`);
  });
  console.log(`- Overall Total: ${match.overall.total_marks}/${match.overall.max_total} (${match.overall.percentage}) - Grade: ${match.overall.grade}`);
} else {
  console.log('Not found');
}

