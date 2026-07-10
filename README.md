# 🤖 Rolefit AI — Premium SaaS Job Application Agent

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-10D084?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Gemini%20AI-SDK-4285F4?style=for-the-badge&logo=google-gemini)](https://deepmind.google/technologies/gemini/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**Rolefit AI** is a premium, production-ready Next.js SaaS platform. It acts as an autonomous AI job matching agent and career coach. By parsing candidate resumes and comparing them to job descriptions, it calculates ATS match ratings, suggests context-aware resume optimizations, generates personalized cover letters, tracks application pipelines, and compiles aggregates for career strategy planning.

[Features](#-features) • [Tech Stack](#%EF%B8%8F-tech-stack) • [Database Schema](#-database-schema) • [Architecture](#-architecture) • [AI Core Integrations](#-ai-core-integrations) • [Setup Guide](#%EF%B8%8F-setup-guide)

</div>

---

## 🌟 Features

### 📄 AI Resume Parsing & Profile Onboarding
* **Drag-and-Drop Uploader**: Drag and drop PDF or DOCX resumes onto the dashboard.
* **Semantic Analysis**: Extracts summaries, contact links, work experiences, skills, projects, and certifications using **Gemini 3.1 Flash-Lite**.
* **Profile Persistence**: Saves and updates profile records in Supabase relational tables.

### 📊 Premium LinkedIn-Style Match Dashboard
* **Dynamic Match Score**: Visually maps profile criteria against target job descriptions.
* **ATS Compatibility Score**: Computes compatibility ratings based on keywords.
* **Color-Coded Skill Evaluation**:
  * <kbd>Matched Skills</kbd> (Green)
  * <kbd>Missing Skills</kbd> (Red)
  * <kbd>Recommended to Learn</kbd> (Yellow)
* **Insights Panel**: Lists strengths, weaknesses, missing keywords, and priority action lists.

### 📝 Auto-Tailored ATS Resume & Cover Letters
* **Side-by-Side Diffing**: Review original vs. AI-suggested experience bullet improvements.
* **Batch Auto-Tailoring**: One-click **Auto-Accept All Suggestions** instantly updates resume blocks.
* **Personalized Cover Letters**: Generates word-count-bounded cover letters mapping candidate history to job specs.
* **Browser print to PDF**: Prints or saves optimized, header-free resume sheets directly as PDF (`window.print()`).

### 💼 Job Pipeline & Application Status
* **Search & Filters**: Search jobs by role or company, and filter by status and match score.
* **Status Updates**: Update application states (Saved, Applied, Interviewing, Offered, Rejected) on the fly.
* **Job Modifications**: Edit descriptions or delete jobs with safety confirmation modals.

### 📈 Career View Analytics
* **Funnel Progress Bars**: Renders full job hunting funnel progress visualizers.
* **Skill GAP Aggregation**: Counts top requested missing/matched skills across all analyzed jobs.
* **Match History Logs**: Provides a list of recent matches with quick navigation keys.

---

## 🖥️ Tech Stack

* **Core**: Next.js 16 (App Router), React, TypeScript.
* **Styling**: Tailwind CSS (Curated SaaS palettes, custom progress bars).
* **Database & Storage**: Supabase (PostgreSQL, Supabase Auth, Supabase Storage buckets).
* **AI Engine**: Google Generative AI (`@google/generative-ai` SDK).
* **Design Elements**: Lucide React, Radix UI/Base UI headless primitives.

---

## 🗄️ Database Schema (Supabase)

Rolefit AI operates on a highly optimized PostgreSQL relational model:

* **`public.profiles`**: Stores candidate names, location, contacts, and summaries.
* **`public.resumes`**: Files database metadata (name, sizes, storage paths, status checks).
* **`public.profile_skills`**: Stores user skills.
* **`public.work_experiences`**: Stores experiences and responsibilities.
* **`public.education_entries`**: Relates institutions, degrees, field of study, and GPAs.
* **`public.projects`**: Relates project descriptions and technologies.
* **`public.certifications`**: Stores certifications and issuers.
* **`public.profile_links`**: Stores personal links (GitHub, LinkedIn).
* **`public.jobs`**: Track target job metadata, descriptions, status, and scores.
* **`public.tailored_resumes`**: Stores dynamic suggestions and aggregate matching details.

---

## 📁 Architecture

```
├── app/
│   ├── dashboard/
│   │   ├── analytics/           # Analytics aggregates view
│   │   ├── jobs/                # Jobs listing and Dynamic Job Detail Dashboard
│   │   │   ├── [jobId]/         # Dynamic detailed job matching routes
│   │   │   └── page.tsx         # Jobs main list view
│   │   ├── profile/             # Profile details and form inputs
│   │   ├── resume/              # Resume upload page
│   │   └── layout.tsx           # Dashboard layout shell with dynamic sidebar
├── components/
│   ├── dashboard/               # Shell component and App Sidebar navigation links
│   ├── jobs/                    # JobsList, JobForm, JobDetailClient components
│   ├── onboarding/              # OnboardingDialog popup trigger
│   ├── resume/                  # ResumeList (Upload manager, actions, and dialogs)
│   └── ui/                      # Common design elements (badges, buttons, progress, dialogs)
```

---

## 🧠 AI Core Integrations

### Resume Parser
Uses **Gemini 3.1 Flash-Lite** to read raw buffers and extract details into structured JSON matching a strict OpenAPI schema definition.

```typescript
// Parse resumes
const parsed = await parseResumeWithGemini({ mimeType, buffer, docxText });
```

### Match Report
Compares profile experience, projects, skills, education, and certs against the job description text, generating optimized suggestions and role-fit metadata.

```typescript
// Auto-match evaluation
const result = await model.generateContent([{ text: userPrompt }]);
```

---

## ⚙️ Setup Guide

### 1. Clone & Install
```bash
git clone https://github.com/FarzeenFatima55/ai-job-application-agent.git
cd ai-job-application-agent
npm install
```

### 2. Configure Environment variables
Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Run Locally
```bash
npm run dev
```
Open `http://localhost:3000` to start using Rolefit AI.

---

## 📦 Production Build
Verify compilation:
```bash
npm run build
```
Deploy to Vercel or similar platforms. Make sure to define the exact environment keys (`GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) in your deployment dashboard settings.
