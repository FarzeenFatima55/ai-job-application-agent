export type JobStatus = "saved" | "applied" | "interview" | "offer" | "rejected";

export type Job = {
  id: string;
  userId: string;
  company: string;
  roleTitle: string;
  jdText: string;
  status: JobStatus;
  matchScore: number | null;
  matchedSkills: string[];
  missingSkills: string[];
  createdAt: string;
};

export type ResumeChangeSection = "summary" | "experience" | "project";

export type ResumeChange = {
  id: string; // stable id so UI can toggle without re-indexing
  section: ResumeChangeSection;
  itemIndex: number | null; // which experience/project entry, null for summary
  original: string;
  suggested: string;
  reason: string; // short explanation of why this change helps match the JD
  status: "pending" | "accepted" | "rejected";
};

export type JobAnalysisResult = {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  changes: ResumeChange[];
  // Extended analysis fields
  skillsToLearn: string[];
  strengths: string[];
  weaknesses: string[];
  atsScore: number;
  missingKeywords: string[];
  suggestions: string[];
  tailoredSummary: string;
  projectImprovements: string[];
  experienceImprovements: string[];
  educationRelevance: string;
  certifications: string[];
  priorityActions: string[];
};