# IPS Student Examination Results Portal

A secure, high-performance web portal built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS** for querying, displaying, and managing official student midterm examination results for International Public Schools across four academic years (**Year 1**, **Year 2**, **Year 3**, and **Year 4**).

The project is pre-configured, tested, and 100% ready for one-click deployment on **Vercel**.

---

## 🚀 Key Highlights & Architectural Features

1. **Strict Privacy & Sensitive Data Protection**:
   - Original student files and raw National IDs (الأرقام القومية) are **never placed in public directories** or client bundles.
   - All student lookup and result fetching happens on the server via secure Next.js Serverless API endpoints.
   - National IDs are cryptographically hashed using SHA-256 and stored on the server only. The client bundle receives only student English names, academic year, subject marks, and overall evaluations.

2. **Smart Login System with Collision Disambiguation**:
   - Access code format: `ips@12345` (where `12345` represents the last 5 digits of the student's National ID).
   - Case-insensitive, automatically handles spaces and plain 5-digit inputs.
   - **Duplicate Code Protection**: The portal detects when a 5-digit code or last 4 digits are shared by multiple students across cohorts. If a duplicate is detected, the portal prevents displaying another student's report and activates an **interactive secondary verification** (Academic Year + Date of Birth).

3. **Exact School Report Replication**:
   - Displays all subjects per year with exact marks, maximum marks, percentages, grade badges (A*, A, B, C, D, E, F), and animated progress bars.
   - Distinct **Overall Performance** card at the bottom displaying composite total marks, maximum total, percentage, and grade.
   - Proper handling of absent students and missing records:
     - No `#VALUE!` strings are ever displayed.
     - Absent marks are displayed as `Absent` without converting to zero or fabricating scores.
     - Official report totals and grades are preserved.

4. **Academic Years Configuration**:
   - **Year 1**: English (30), Maths (50), Science (25), Arabic (15) → Max Total: **120**
   - **Year 2**: English (35), Maths (35), Science (35), Arabic (15) → Max Total: **120**
   - **Year 3**: English (50), Maths (50), Science (50), Arabic (15) → Max Total: **165**
   - **Year 4**: English (50), Maths (50), Science (50), Second L (50), Social (15), Arabic (15) → Max Total: **230**

5. **Official Grading Scale**:
   - **A\***: 95% – 100%
   - **A**: 85% – 94%
   - **B**: 75% – 84%
   - **C**: 65% – 74%
   - **D**: 55% – 64%
   - **E**: 40% – 54%
   - **F**: Below 40%

6. **Secured Administrative Dashboard (`/admin`)**:
   - Protected by separate admin login with session JWT and rate-limiting.
   - Real-time KPIs: Total Students, Matched, Unmatched, Duplicate Codes, Absent Students.
   - Live Student Marks Editor: Edit any subject mark, maximum mark, or overall grade.
   - Results Publishing Switch: Easily switch between Draft Mode (hidden from students) and Published Mode.
   - Full Matching Audit Report and Duplicate Codes management table.

---

## 🛠️ Local Development & Quick Start

### 1. Prerequisites
- Node.js `v18+` or `v20+` or `v24+`
- npm or pnpm or yarn

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Default credentials in `.env.local`:
- `JWT_SECRET`: `ips-school-results-super-secure-key-2025-international-portal`
- `ADMIN_USERNAME`: `admin`
- `ADMIN_PASSWORD`: `Admin@IPS2025#Results`

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## ☁️ How to Deploy to Vercel

### Method 1: Deploy via GitHub (Recommended)
1. Initialize git and push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - IPS Student Results Portal"
   git branch -M main
   git remote add origin https://github.com/<your-username>/ips-results-portal.git
   git push -u origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
3. Import your GitHub repository.
4. In the **Environment Variables** section on Vercel, add:
   - `JWT_SECRET`: A long random string (e.g. `your-production-secret-key-32-chars-min`)
   - `ADMIN_USERNAME`: `admin`
   - `ADMIN_PASSWORD`: `YourStrongAdminPassword123!`
5. Click **Deploy**. Vercel will build and deploy the application in under 1 minute with a public HTTPS URL!

### Method 2: Deploy via Vercel CLI
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Run deployment:
   ```bash
   vercel
   ```
3. Set your environment variables in the project settings and run:
   ```bash
   vercel --prod
   ```

---

## 👥 Student Login Demonstration Examples

You can test with any of the following verified students:

| Student Name | Year | Login Code | Notes |
|---|---|---|---|
| **Ahmed Mohamed Al-Sayed** | Year 1 | `ips@04511` | Normal single match |
| **Baraa Mohammed Rizq** | Year 2 | `ips@00534` | Normal single match |
| **Anas Ibrahim Fathi** | Year 3 | `ips@00191` | Top Achiever (100% A*) |
| **Yahya Muhammad Khattab** | Year 4 | `ips@01576` | Year 4 with Second L & Social |
| **Alia Ahmed Sami** | Year 1 | `ips@01046` | Shows Absent handling in subjects |
| **Khadija Khalid Al-Saeed** | Year 1 | `ips@00307` | Overall Absent student |
| **Bilal Masad Sami** | Year 1 | `ips@00057` | **Duplicate Code Example**: Shared with Year 3 (Prompts for Year / Birth Date: `2020-07-05`) |
| **Talia Khalid Saad** | Year 1 | `ips@00485` | **Duplicate Code Example**: Shared with Year 1 Dana Mahmoud (Prompts for Birth Date: `2020-02-26`) |

---

## 🔒 Security Best Practices Implemented

- **No URL Manipulation**: Results cannot be viewed by changing IDs in the URL (e.g. `/results?id=123` is impossible). All authorization is strictly handled by encrypted HttpOnly cookies verified on the backend.
- **Brute Force Protection**: IP-based rate limiter throttles excessive failed login attempts (maximum 5 attempts per minute).
- **Zero Sensitive Data Leakage**: National IDs, Arabic matching notes, and administrative fields are kept private on the server and never sent to student browser sessions.
- **Full Print Optimization**: Clean print stylesheet (`@media print`) enables parents to print official, watermark-ready transcripts directly from their browser.
