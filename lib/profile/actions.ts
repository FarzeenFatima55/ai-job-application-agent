"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth/get-session-user";
import { MAX_RESUME_SIZE_BYTES } from "@/lib/database.types";
import { persistProfileData } from "@/lib/profile/persist-profile";
import { getResumeDownloadUrl } from "@/lib/profile/queries";
import {
  parsedResumeToFormData,
  type UserProfileFormData,
} from "@/lib/profile/types";
import {
  extractDocxText,
  getResumeMimeType,
  isAllowedResumeMimeType,
} from "@/lib/resume/extract-text";
import { parseResumeWithGemini } from "@/lib/resume/parse-resume";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function uploadAndParseResume(
  formData: FormData
): Promise<ActionResult> {
  const sessionUser = await getSessionUser();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { success: false, error: "Please select a resume file." };
  }

  const mimeType = getResumeMimeType(file);

  if (!isAllowedResumeMimeType(mimeType)) {
    return {
      success: false,
      error: "Only PDF and DOCX files are supported.",
    };
  }

  if (file.size > MAX_RESUME_SIZE_BYTES) {
    return {
      success: false,
      error: "File size must be 10 MB or less.",
    };
  }

  const supabase = await createClient();
  const resumeId = crypto.randomUUID();
  const storagePath = `${sessionUser.id}/${resumeId}/${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: insertError } = await supabase.from("resumes").insert({
    id: resumeId,
    user_id: sessionUser.id,
    file_name: file.name,
    storage_path: storagePath,
    mime_type: mimeType,
    file_size: file.size,
    parse_status: "processing",
  });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  const { error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    await supabase
      .from("resumes")
      .update({
        parse_status: "failed",
        error_message: uploadError.message,
      })
      .eq("id", resumeId);

    return { success: false, error: uploadError.message };
  }

  try {
    const docxText =
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ? await extractDocxText(buffer)
        : undefined;

    const parsed = await parseResumeWithGemini({
      mimeType,
      buffer,
      docxText,
    });

    const profileData = parsedResumeToFormData(
      parsed,
      sessionUser.email,
      sessionUser.fullName
    );

    await persistProfileData(supabase, sessionUser.id, profileData);

    const { error: updateError } = await supabase
      .from("resumes")
      .update({
        parse_status: "completed",
        parsed_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("id", resumeId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/resume");

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse resume.";

    await supabase
      .from("resumes")
      .update({
        parse_status: "failed",
        error_message: message,
      })
      .eq("id", resumeId);

    return { success: false, error: message };
  }
}

export async function saveProfile(
  profileJson: string
): Promise<ActionResult> {
  const sessionUser = await getSessionUser();

  let profile: UserProfileFormData;
  try {
    profile = JSON.parse(profileJson) as UserProfileFormData;
  } catch {
    return { success: false, error: "Invalid profile data." };
  }

  try {
    const supabase = await createClient();
    await persistProfileData(supabase, sessionUser.id, {
      ...profile,
      email: profile.email || sessionUser.email,
    });

    revalidatePath("/dashboard/profile");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save profile.",
    };
  }
}

export async function deleteResume(resumeId: string): Promise<ActionResult> {
  const sessionUser = await getSessionUser();
  const supabase = await createClient();

  const { data: resume, error: fetchError } = await supabase
    .from("resumes")
    .select("storage_path")
    .eq("id", resumeId)
    .eq("user_id", sessionUser.id)
    .maybeSingle();

  if (fetchError || !resume) {
    return { success: false, error: "Resume not found." };
  }

  await supabase.storage.from("resumes").remove([resume.storage_path]);

  const { error: deleteError } = await supabase
    .from("resumes")
    .delete()
    .eq("id", resumeId)
    .eq("user_id", sessionUser.id);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/resume");

  return { success: true };
}

export async function downloadResume(resumeId: string): Promise<ActionResult & { url?: string }> {
  const sessionUser = await getSessionUser();
  const url = await getResumeDownloadUrl(sessionUser.id, resumeId);

  if (!url) {
    return { success: false, error: "Could not generate download link." };
  }

  return { success: true, url };
}
