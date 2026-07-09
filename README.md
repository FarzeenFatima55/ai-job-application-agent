# 🤖 Rolefit AI — AI-Powered Job Application Agent

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge\&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge\&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge\&logo=supabase)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge\&logo=google)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge\&logo=tailwindcss)

### AI-powered resume analysis, ATS optimization, and intelligent job matching.

Rolefit AI helps job seekers analyze resumes, compare them against job descriptions, generate ATS-friendly resumes, create personalized cover letters, and track applications—all in one modern dashboard.

</div>

---

## ✨ Overview

Applying to dozens of jobs manually is time-consuming and often ineffective.

**Rolefit AI** simplifies the process by acting as an AI career assistant. Upload your resume, paste a job description, and receive instant AI-powered insights, including ATS compatibility, missing skills, resume improvements, and a tailored resume ready for applications.

---

## 🚀 Features

### 📄 AI Resume Parsing

* Upload PDF or DOCX resumes
* Automatic information extraction using Gemini AI
* Extracts:

  * Contact Information
  * Work Experience
  * Skills
  * Projects
  * Education
  * Certifications
  * Professional Summary
* Stores structured profile data in Supabase

---

### 🎯 ATS Job Match Analysis

Analyze any job description and receive:

* ATS Match Score
* Resume Compatibility Score
* Missing Keywords
* Matched Skills
* Skill Gap Analysis
* Candidate Strengths
* Improvement Suggestions
* Hiring Readiness Insights

---

### 📑 AI Resume Tailoring

Generate a resume specifically optimized for each job.

Features include:

* ATS-friendly formatting
* AI-generated experience improvements
* Keyword optimization
* Resume section enhancements
* One-click "Accept All Suggestions"
* Export as PDF

---

### ✍️ AI Cover Letter Generator

Automatically creates personalized cover letters based on:

* Resume
* Experience
* Skills
* Job Description

Each cover letter is unique and optimized for the target position.

---

### 💼 Job Management

Track every opportunity in one place.

* Save Jobs
* Edit Jobs
* Delete Jobs
* Search Jobs
* Filter Jobs
* Application Status Tracking

Supported statuses:

* Saved
* Applied
* Interview
* Offer
* Rejected

---

### 📊 Analytics Dashboard

Visualize your job search progress with:

* Application Funnel
* Match History
* Average ATS Score
* Most Requested Skills
* Missing Skills Overview
* Success Metrics
* Career Progress Analytics

---

## 🧠 AI Workflow

```text
Resume Upload
        │
        ▼
 Gemini Resume Parsing
        │
        ▼
Structured Profile (Supabase)
        │
        ▼
Paste Job Description
        │
        ▼
AI Match Analysis
        │
        ▼
ATS Score + Skill Gap + Suggestions
        │
        ▼
Tailored Resume
        │
        ▼
AI Cover Letter
        │
        ▼
Application Tracking
```

---

## 🛠 Tech Stack

### Frontend

* Next.js 16
* React
* TypeScript
* Tailwind CSS
* Lucide Icons
* Radix UI

### Backend

* Next.js Server Actions
* API Routes

### Database

* Supabase
* PostgreSQL
* Authentication
* Storage

### AI

* Google Gemini 3.1 Flash-Lite
* JSON Schema Extraction
* Resume Parsing
* ATS Matching

---

## 🗄 Database Structure

```text
profiles
├── resumes
├── profile_skills
├── work_experiences
├── education_entries
├── certifications
├── profile_links
├── projects

jobs

tailored_resumes
```

---

## 📂 Project Structure

```text
app/
│
├── dashboard/
│   ├── analytics/
│   ├── jobs/
│   ├── profile/
│   ├── resume/
│   └── layout.tsx
│
├── api/
│
components/
│
├── dashboard/
├── jobs/
├── onboarding/
├── resume/
└── ui/

lib/
utils/
types/
```

---

## ⚙️ Environment Variables

Create a `.env.local` file.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
```

---

## 🚀 Getting Started

Clone the repository:

```bash
git clone https://github.com/FarzeenFatima55/ai-job-application-agent.git
```

Move into the project:

```bash
cd ai-job-application-agent
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 📦 Production

Build the application:

```bash
npm run build
```

Start production:

```bash
npm start
```

Deploy on platforms such as **Vercel** after configuring the required environment variables.

---

## 🎯 Use Cases

* Job Seekers
* Students
* Fresh Graduates
* Career Coaches
* Recruiters
* Resume Review Services

---

## 🔮 Future Enhancements

* LinkedIn Job Import
* One-Click Job Applications
* AI Interview Preparation
* Salary Prediction
* Resume Version History
* Email Application Automation
* Multi-language Resume Support
* Recruiter Dashboard

---

## 👩‍💻 Author

**Farzeen Fatima**

Full Stack Developer | AI Enthusiast

GitHub: **FarzeenFatima55**

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

It helps others discover the project and supports future development.
