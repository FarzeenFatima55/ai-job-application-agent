import { createClient } from "@/lib/supabase/server";

import {
  emptyProfile,
  type OnboardingStatus,
  type ResumeRecord,
  type UserProfileFormData,
} from "./types";

export async function getOnboardingStatus(userId: string): Promise<OnboardingStatus> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("resumes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("parse_status", "completed");

  if (error) {
    console.error("getOnboardingStatus error:", error.message);
    return { needsOnboarding: true };
  }

  return { needsOnboarding: (count ?? 0) === 0 };
}

export async function getUserResumes(userId: string): Promise<ResumeRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resumes")
    .select(
      "id, file_name, file_size, mime_type, parse_status, parsed_at, error_message, created_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getUserResumes error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    fileName: row.file_name,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    parseStatus: row.parse_status,
    parsedAt: row.parsed_at,
    errorMessage: row.error_message,
    createdAt: row.created_at,
  }));
}

export async function getUserProfile(
  userId: string,
  fallbackEmail: string,
  fallbackName: string
): Promise<UserProfileFormData> {
  const supabase = await createClient();

  const [
    profileResult,
    skillsResult,
    workResult,
    educationResult,
    projectsResult,
    certificationsResult,
    linksResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("profile_skills")
      .select("name")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("work_experiences")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("education_entries")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("certifications")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("profile_links")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true }),
  ]);

  const base = emptyProfile(fallbackEmail, fallbackName);
  const profile = profileResult.data;

  if (!profile) {
    return base;
  }

  return {
    fullName: profile.full_name ?? base.fullName,
    email: profile.email ?? base.email,
    phone: profile.phone ?? "",
    location: profile.location ?? "",
    linkedinUrl: profile.linkedin_url ?? "",
    githubUrl: profile.github_url ?? "",
    portfolioUrl: profile.portfolio_url ?? "",
    professionalSummary: profile.professional_summary ?? "",
    skills: (skillsResult.data ?? []).map((s) => s.name),
    workExperiences: (workResult.data ?? []).map((item) => ({
      id: item.id,
      company: item.company,
      title: item.title,
      location: item.location ?? "",
      startDate: item.start_date ?? "",
      endDate: item.end_date ?? "",
      isCurrent: item.is_current,
      responsibilities: Array.isArray(item.responsibilities)
        ? (item.responsibilities as string[])
        : [],
    })),
    education: (educationResult.data ?? []).map((item) => ({
      id: item.id,
      institution: item.institution,
      degree: item.degree ?? "",
      fieldOfStudy: item.field_of_study ?? "",
      startDate: item.start_date ?? "",
      endDate: item.end_date ?? "",
      gpa: item.gpa ?? "",
    })),
    projects: (projectsResult.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      url: item.url ?? "",
      technologies: item.technologies ?? [],
    })),
    certifications: (certificationsResult.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      issuer: item.issuer ?? "",
      issuedOn: item.issued_on ?? "",
      url: item.url ?? "",
    })),
    links: (linksResult.data ?? []).map((item) => ({
      id: item.id,
      label: item.label,
      url: item.url,
    })),
  };
}

export async function getResumeDownloadUrl(
  userId: string,
  resumeId: string
): Promise<string | null> {
  const supabase = await createClient();
  const { data: resume, error } = await supabase
    .from("resumes")
    .select("storage_path")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !resume) {
    return null;
  }

  const { data: signed, error: signError } = await supabase.storage
    .from("resumes")
    .createSignedUrl(resume.storage_path, 60 * 60);

  if (signError || !signed) {
    return null;
  }

  return signed.signedUrl;
}
