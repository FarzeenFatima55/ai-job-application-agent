import { createClient } from "@/lib/supabase/server";
import type { Job, ResumeChange, JobAnalysisResult } from "./types";

export async function getUserJobs(userId: string): Promise<Job[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("getUserJobs error:", error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    company: row.company,
    roleTitle: row.role_title,
    jdText: row.jd_text,
    status: (row.status ?? "saved") as Job["status"],
    matchScore: row.match_score,
    matchedSkills: row.matched_skills ?? [],
    missingSkills: row.missing_skills ?? [],
    createdAt: row.created_at ?? new Date().toISOString(),
  }));
}

export type JobWithResume = {
  job: Job | null;
  tailoredResumeId: string | null;
  changes: ResumeChange[];
  analysis: JobAnalysisResult | null;
};

export async function getJobWithLatestResume(jobId: string): Promise<JobWithResume> {
  const supabase = await createClient();

  const { data: jobRow, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (jobError || !jobRow) {
    return { job: null, tailoredResumeId: null, changes: [], analysis: null };
  }

  const job: Job = {
    id: jobRow.id,
    userId: jobRow.user_id,
    company: jobRow.company,
    roleTitle: jobRow.role_title,
    jdText: jobRow.jd_text,
    status: (jobRow.status ?? "saved") as Job["status"],
    matchScore: jobRow.match_score,
    matchedSkills: jobRow.matched_skills ?? [],
    missingSkills: jobRow.missing_skills ?? [],
    createdAt: jobRow.created_at ?? new Date().toISOString(),
  };

  const { data: resumeRow } = await supabase
    .from("tailored_resumes")
    .select("id, changes")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const rawChanges = resumeRow?.changes;
  let changes: ResumeChange[] = [];
  let analysis: JobAnalysisResult | null = null;

  if (Array.isArray(rawChanges)) {
    changes = rawChanges as ResumeChange[];
  } else if (rawChanges && typeof rawChanges === "object") {
    const obj = rawChanges as any;
    changes = obj.changes ?? [];
    analysis = obj.analysis ?? null;
  }

  return {
    job,
    tailoredResumeId: resumeRow?.id ?? null,
    changes,
    analysis,
  };
}