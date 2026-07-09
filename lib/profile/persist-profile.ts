import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

import type { UserProfileFormData } from "./types";

type AppSupabase = SupabaseClient<Database>;

export async function persistProfileData(
  supabase: AppSupabase,
  userId: string,
  data: UserProfileFormData
) {
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: data.email || null,
      full_name: data.fullName || null,
      phone: data.phone || null,
      location: data.location || null,
      linkedin_url: data.linkedinUrl || null,
      github_url: data.githubUrl || null,
      portfolio_url: data.portfolioUrl || null,
      professional_summary: data.professionalSummary || null,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    throw new Error(profileError.message);
  }

  await Promise.all([
    supabase.from("profile_skills").delete().eq("user_id", userId),
    supabase.from("work_experiences").delete().eq("user_id", userId),
    supabase.from("education_entries").delete().eq("user_id", userId),
    supabase.from("projects").delete().eq("user_id", userId),
    supabase.from("certifications").delete().eq("user_id", userId),
    supabase.from("profile_links").delete().eq("user_id", userId),
  ]);

  if (data.skills.length > 0) {
    const { error } = await supabase.from("profile_skills").insert(
      data.skills
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name, index) => ({
          user_id: userId,
          name,
          sort_order: index,
        }))
    );
    if (error) throw new Error(error.message);
  }

  if (data.workExperiences.length > 0) {
    const { error } = await supabase.from("work_experiences").insert(
      data.workExperiences.map((item, index) => ({
        user_id: userId,
        company: item.company || "Unknown company",
        title: item.title || "Unknown title",
        location: item.location || null,
        start_date: item.startDate || null,
        end_date: item.endDate || null,
        is_current: item.isCurrent,
        responsibilities: item.responsibilities.filter(Boolean),
        sort_order: index,
      }))
    );
    if (error) throw new Error(error.message);
  }

  if (data.education.length > 0) {
    const { error } = await supabase.from("education_entries").insert(
      data.education.map((item, index) => ({
        user_id: userId,
        institution: item.institution || "Unknown institution",
        degree: item.degree || null,
        field_of_study: item.fieldOfStudy || null,
        start_date: item.startDate || null,
        end_date: item.endDate || null,
        gpa: item.gpa || null,
        sort_order: index,
      }))
    );
    if (error) throw new Error(error.message);
  }

  if (data.projects.length > 0) {
    const { error } = await supabase.from("projects").insert(
      data.projects.map((item, index) => ({
        user_id: userId,
        name: item.name || "Untitled project",
        description: item.description || null,
        url: item.url || null,
        technologies: item.technologies.filter(Boolean),
        sort_order: index,
      }))
    );
    if (error) throw new Error(error.message);
  }

  if (data.certifications.length > 0) {
    const { error } = await supabase.from("certifications").insert(
      data.certifications.map((item, index) => ({
        user_id: userId,
        name: item.name || "Certification",
        issuer: item.issuer || null,
        issued_on: item.issuedOn || null,
        url: item.url || null,
        sort_order: index,
      }))
    );
    if (error) throw new Error(error.message);
  }

  if (data.links.length > 0) {
    const { error } = await supabase.from("profile_links").insert(
      data.links
        .filter((item) => item.label.trim() && item.url.trim())
        .map((item, index) => ({
          user_id: userId,
          label: item.label,
          url: item.url,
          sort_order: index,
        }))
    );
    if (error) throw new Error(error.message);
  }
}
