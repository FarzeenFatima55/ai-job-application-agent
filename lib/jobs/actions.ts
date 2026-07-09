"use server";

import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { getUserProfile } from "@/lib/profile/queries";
import type { JobAnalysisResult, ResumeChange } from "./types";

function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured.");
    }
    return new GoogleGenerativeAI(apiKey);
}

const jobAnalysisSchema: ResponseSchema = {
    type: SchemaType.OBJECT,
    properties: {
        matchScore: { type: SchemaType.NUMBER },
        matchedSkills: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
        },
        missingSkills: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
        },
        skillsToLearn: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
        },
        strengths: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
        },
        weaknesses: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
        },
        atsScore: { type: SchemaType.NUMBER },
        missingKeywords: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
        },
        suggestions: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
        },
        tailoredSummary: { type: SchemaType.STRING },
        projectImprovements: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
        },
        experienceImprovements: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
        },
        educationRelevance: { type: SchemaType.STRING },
        certifications: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
        },
        priorityActions: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
        },
        changes: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    section: { type: SchemaType.STRING },
                    itemIndex: { type: SchemaType.NUMBER, nullable: true },
                    original: { type: SchemaType.STRING },
                    suggested: { type: SchemaType.STRING },
                    reason: { type: SchemaType.STRING },
                },
                required: ["section", "original", "suggested", "reason"],
            },
        },
    },
    required: [
        "matchScore",
        "matchedSkills",
        "missingSkills",
        "skillsToLearn",
        "strengths",
        "weaknesses",
        "atsScore",
        "missingKeywords",
        "suggestions",
        "tailoredSummary",
        "projectImprovements",
        "experienceImprovements",
        "educationRelevance",
        "certifications",
        "priorityActions",
        "changes"
    ],
};

const SYSTEM_PROMPT = `You are a resume-tailoring and job matching analysis assistant. You compare a candidate's existing resume data against a job description, suggest modifications, and provide comprehensive evaluation details.

STRICT RULES:
- Never invent skills, tools, companies, titles, or achievements that are not already present in the candidate's data.
- You may only rephrase, reorder, re-emphasize, or reprioritize existing content so it better matches the job description's language and priorities.
- If the candidate is missing a skill the JD wants, list it in missingSkills/skillsToLearn — do NOT fabricate it into a bullet.
- Every suggested change must be traceable to something the candidate actually wrote.
- Output ONLY valid JSON matching the schema below. No markdown, no preamble, no explanation outside the JSON.

Schema:
{
  "matchScore": number (0-100),
  "matchedSkills": string[],
  "missingSkills": string[],
  "skillsToLearn": string[],
  "strengths": string[],
  "weaknesses": string[],
  "atsScore": number (0-100),
  "missingKeywords": string[],
  "suggestions": string[],
  "tailoredSummary": string,
  "projectImprovements": string[],
  "experienceImprovements": string[],
  "educationRelevance": string,
  "certifications": string[],
  "priorityActions": string[],
  "changes": [
    {
      "section": "summary" | "experience" | "project",
      "itemIndex": number | null,
      "original": string,
      "suggested": string,
      "reason": string (one short sentence)
    }
  ]
}`;

export async function analyzeJobMatch(
    jobId: string,
    jdText: string
): Promise<{ success: true; data: JobAnalysisResult } | { success: false; error: string }> {
    try {
        const sessionUser = await getSessionUser();
        const profile = await getUserProfile(
            sessionUser.id,
            sessionUser.email,
            sessionUser.fullName
        );

        const userPrompt = `CANDIDATE RESUME DATA:
${JSON.stringify(profile, null, 2)}

JOB DESCRIPTION:
${jdText}

Compare the two and return the JSON as specified.`;

        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-flash-lite",
            systemInstruction: SYSTEM_PROMPT,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: jobAnalysisSchema,
                temperature: 0.1,
            },
        });

        const aiResult = await model.generateContent([{ text: userPrompt }]);
        const responseText = aiResult.response.text();

        if (!responseText) {
            return { success: false, error: "No response from AI." };
        }

        let parsed: JobAnalysisResult;
        try {
            parsed = JSON.parse(responseText);
        } catch {
            return { success: false, error: "Failed to parse AI response as JSON." };
        }

        const changes: ResumeChange[] = parsed.changes.map((c, i) => ({
            ...c,
            id: `${jobId}-${i}`,
            status: "pending",
        }));

        const result: JobAnalysisResult = {
            matchScore: parsed.matchScore,
            matchedSkills: parsed.matchedSkills,
            missingSkills: parsed.missingSkills,
            skillsToLearn: parsed.skillsToLearn ?? [],
            strengths: parsed.strengths ?? [],
            weaknesses: parsed.weaknesses ?? [],
            atsScore: parsed.atsScore ?? 0,
            missingKeywords: parsed.missingKeywords ?? [],
            suggestions: parsed.suggestions ?? [],
            tailoredSummary: parsed.tailoredSummary ?? "",
            projectImprovements: parsed.projectImprovements ?? [],
            experienceImprovements: parsed.experienceImprovements ?? [],
            educationRelevance: parsed.educationRelevance ?? "",
            certifications: parsed.certifications ?? [],
            priorityActions: parsed.priorityActions ?? [],
            changes,
        };

        // Persist to Supabase
        const supabase = await createClient();
        await supabase
            .from("jobs")
            .update({
                match_score: result.matchScore,
                matched_skills: result.matchedSkills,
                missing_skills: result.missingSkills,
                updated_at: new Date().toISOString(),
            } as any)
            .eq("id", jobId);

        await supabase.from("tailored_resumes").insert({
            job_id: jobId,
            user_id: sessionUser.id,
            changes: {
                changes: result.changes,
                analysis: {
                    matchScore: result.matchScore,
                    matchedSkills: result.matchedSkills,
                    missingSkills: result.missingSkills,
                    skillsToLearn: result.skillsToLearn,
                    strengths: result.strengths,
                    weaknesses: result.weaknesses,
                    atsScore: result.atsScore,
                    missingKeywords: result.missingKeywords,
                    suggestions: result.suggestions,
                    tailoredSummary: result.tailoredSummary,
                    projectImprovements: result.projectImprovements,
                    experienceImprovements: result.experienceImprovements,
                    educationRelevance: result.educationRelevance,
                    certifications: result.certifications,
                    priorityActions: result.priorityActions,
                }
            } as any,
        });

        return { success: true, data: result };
    } catch (err) {
        console.error("analyzeJobMatch error:", err);
        return { success: false, error: "Failed to analyze job match. Please try again." };
    }
}

export async function createJob(company: string, roleTitle: string, jdText: string) {
    const sessionUser = await getSessionUser();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("jobs")
        .insert({
            user_id: sessionUser.id,
            company,
            role_title: roleTitle,
            jd_text: jdText,
            status: "saved",
        })
        .select()
        .single();

    if (error) {
        return { success: false as const, error: error.message };
    }
    return { success: true as const, jobId: data.id as string };
}

export async function updateChangeStatus(
    tailoredResumeId: string,
    changeId: string,
    status: "accepted" | "rejected"
) {
    const supabase = await createClient();

    const { data: row, error: fetchError } = await supabase
        .from("tailored_resumes")
        .select("changes")
        .eq("id", tailoredResumeId)
        .single();

    if (fetchError || !row) {
        return { success: false as const, error: "Could not find that resume version." };
    }

    let updatedChangesJson: any;
    if (Array.isArray(row.changes)) {
        const changes = (row.changes as ResumeChange[]).map((c) =>
            c.id === changeId ? { ...c, status } : c
        );
        updatedChangesJson = changes;
    } else {
        const obj = row.changes as any;
        const changes = (obj.changes as ResumeChange[]).map((c) =>
            c.id === changeId ? { ...c, status } : c
        );
        updatedChangesJson = {
            ...obj,
            changes
        };
    }

    const { error: updateError } = await supabase
        .from("tailored_resumes")
        .update({ changes: updatedChangesJson })
        .eq("id", tailoredResumeId);

    if (updateError) {
        return { success: false as const, error: updateError.message };
    }
    return { success: true as const };
}

export async function deleteJob(jobId: string) {
    try {
        const supabase = await createClient();
        const { error } = await supabase.from("jobs").delete().eq("id", jobId);
        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error("deleteJob error:", err);
        return { success: false, error: "Failed to delete job." };
    }
}

export async function updateJob(jobId: string, company: string, roleTitle: string, jdText: string) {
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from("jobs")
            .update({
                company,
                role_title: roleTitle,
                jd_text: jdText,
                match_score: null,
                matched_skills: null,
                missing_skills: null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", jobId);

        if (error) throw error;

        // Also delete previous tailored resumes for this job since JD changed
        await supabase.from("tailored_resumes").delete().eq("job_id", jobId);

        return { success: true };
    } catch (err) {
        console.error("updateJob error:", err);
        return { success: false, error: "Failed to update job details." };
    }
}

export async function generateCoverLetterAction(jobId: string) {
    try {
        const sessionUser = await getSessionUser();
        const profile = await getUserProfile(
            sessionUser.id,
            sessionUser.email,
            sessionUser.fullName
        );
        const supabase = await createClient();
        const { data: job, error: jobError } = await supabase
            .from("jobs")
            .select("*")
            .eq("id", jobId)
            .single();

        if (jobError || !job) {
            return { success: false, error: "Job not found." };
        }

        const userPrompt = `CANDIDATE PROFILE DATA:
${JSON.stringify(profile, null, 2)}

JOB DETAILS:
Company: ${job.company}
Role: ${job.role_title}
Job Description:
${job.jd_text}

Write a professional, tailored cover letter for this role.
Do not invent candidate achievements or background. Focus on highlighting existing skills and experience and mapping them to the job requirements.
Keep it strictly under 400 words. Format it clean and professional. Do not use markdown syntax, write it as a clean text document.`;

        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-flash-lite",
            systemInstruction: "You are a professional career coach and resume writer. You help candidates write high-conversion cover letters.",
            generationConfig: {
                temperature: 0.7,
            },
        });

        const result = await model.generateContent([{ text: userPrompt }]);
        const responseText = result.response.text();

        if (!responseText) {
            return { success: false, error: "Failed to generate cover letter." };
        }

        return { success: true, coverLetter: responseText.trim() };
    } catch (err) {
        console.error("generateCoverLetterAction error:", err);
        return { success: false, error: "Failed to generate cover letter. Please try again." };
    }
}

export async function updateJobStatus(jobId: string, status: string) {
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from("jobs")
            .update({ status })
            .eq("id", jobId);

        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error("updateJobStatus error:", err);
        return { success: false, error: "Failed to update job status." };
    }
}

export async function acceptAllChangesAction(tailoredResumeId: string) {
    try {
        const supabase = await createClient();
        const { data: row, error: fetchError } = await supabase
            .from("tailored_resumes")
            .select("changes")
            .eq("id", tailoredResumeId)
            .single();

        if (fetchError || !row) {
            return { success: false, error: "Could not find that resume version." };
        }

        let updatedChangesJson: any;
        if (Array.isArray(row.changes)) {
            const changes = (row.changes as ResumeChange[]).map((c) => ({
                ...c,
                status: "accepted" as const
            }));
            updatedChangesJson = changes;
        } else {
            const obj = row.changes as any;
            const changes = (obj.changes as ResumeChange[]).map((c) => ({
                ...c,
                status: "accepted" as const
            }));
            updatedChangesJson = {
                ...obj,
                changes
            };
        }

        const { error: updateError } = await supabase
            .from("tailored_resumes")
            .update({ changes: updatedChangesJson })
            .eq("id", tailoredResumeId);

        if (updateError) throw updateError;
        return { success: true };
    } catch (err) {
        console.error("acceptAllChangesAction error:", err);
        return { success: false, error: "Failed to accept all changes." };
    }
}