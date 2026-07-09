import {
  GoogleGenerativeAI,
  SchemaType,
  type ResponseSchema,
} from "@google/generative-ai";

import { RESUME_MIME_TYPES } from "@/lib/constants";

import type { ParsedResume } from "../profile/types";

const resumeResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    profile: {
      type: SchemaType.OBJECT,
      properties: {
        fullName: { type: SchemaType.STRING },
        email: { type: SchemaType.STRING },
        phone: { type: SchemaType.STRING },
        location: { type: SchemaType.STRING },
        linkedinUrl: { type: SchemaType.STRING },
        githubUrl: { type: SchemaType.STRING },
        portfolioUrl: { type: SchemaType.STRING },
      },
      required: [
        "fullName",
        "email",
        "phone",
        "location",
        "linkedinUrl",
        "githubUrl",
        "portfolioUrl",
      ],
    },
    professionalSummary: { type: SchemaType.STRING },
    skills: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    workExperience: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          company: { type: SchemaType.STRING },
          title: { type: SchemaType.STRING },
          location: { type: SchemaType.STRING },
          startDate: { type: SchemaType.STRING },
          endDate: { type: SchemaType.STRING },
          isCurrent: { type: SchemaType.BOOLEAN },
          responsibilities: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: [
          "company",
          "title",
          "location",
          "startDate",
          "endDate",
          "isCurrent",
          "responsibilities",
        ],
      },
    },
    education: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          institution: { type: SchemaType.STRING },
          degree: { type: SchemaType.STRING },
          fieldOfStudy: { type: SchemaType.STRING },
          startDate: { type: SchemaType.STRING },
          endDate: { type: SchemaType.STRING },
          gpa: { type: SchemaType.STRING },
        },
        required: [
          "institution",
          "degree",
          "fieldOfStudy",
          "startDate",
          "endDate",
          "gpa",
        ],
      },
    },
    projects: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          url: { type: SchemaType.STRING },
          technologies: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: ["name", "description", "url", "technologies"],
      },
    },
    certifications: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          issuer: { type: SchemaType.STRING },
          issuedOn: { type: SchemaType.STRING },
          url: { type: SchemaType.STRING },
        },
        required: ["name", "issuer", "issuedOn", "url"],
      },
    },
    links: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          label: { type: SchemaType.STRING },
          url: { type: SchemaType.STRING },
        },
        required: ["label", "url"],
      },
    },
  },
  required: [
    "profile",
    "professionalSummary",
    "skills",
    "workExperience",
    "education",
    "projects",
    "certifications",
    "links",
  ],
};

const SYSTEM_PROMPT = `You are a resume parsing assistant. Extract structured information from the provided resume.
Return accurate data only — do not invent details. Use empty strings for missing scalar fields and empty arrays for missing lists.
For dates, preserve the original format from the resume (e.g. "Jan 2020", "2020-01", "Present").
For isCurrent on work experience, set true when the role is ongoing or end date is Present/Current.
Extract all bullet points under each job as responsibilities.
Include technical skills, soft skills, tools, and languages in skills.
Extract projects, certifications, and links (LinkedIn, GitHub, portfolio, etc.) when present.`;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenerativeAI(apiKey);
}

function normalizeParsedResume(raw: ParsedResume): ParsedResume {
  const cap = <T,>(items: T[], max = 50) => items.slice(0, max);

  return {
    profile: {
      fullName: raw.profile?.fullName?.trim() ?? "",
      email: raw.profile?.email?.trim() ?? "",
      phone: raw.profile?.phone?.trim() ?? "",
      location: raw.profile?.location?.trim() ?? "",
      linkedinUrl: raw.profile?.linkedinUrl?.trim() ?? "",
      githubUrl: raw.profile?.githubUrl?.trim() ?? "",
      portfolioUrl: raw.profile?.portfolioUrl?.trim() ?? "",
    },
    professionalSummary: raw.professionalSummary?.trim() ?? "",
    skills: cap(
      (raw.skills ?? []).map((s) => s.trim()).filter(Boolean),
      100
    ),
    workExperience: cap(raw.workExperience ?? [], 30).map((item) => ({
      company: item.company?.trim() ?? "",
      title: item.title?.trim() ?? "",
      location: item.location?.trim() ?? "",
      startDate: item.startDate?.trim() ?? "",
      endDate: item.endDate?.trim() ?? "",
      isCurrent: Boolean(item.isCurrent),
      responsibilities: cap(
        (item.responsibilities ?? []).map((r) => r.trim()).filter(Boolean),
        20
      ),
    })),
    education: cap(raw.education ?? [], 20).map((item) => ({
      institution: item.institution?.trim() ?? "",
      degree: item.degree?.trim() ?? "",
      fieldOfStudy: item.fieldOfStudy?.trim() ?? "",
      startDate: item.startDate?.trim() ?? "",
      endDate: item.endDate?.trim() ?? "",
      gpa: item.gpa?.trim() ?? "",
    })),
    projects: cap(raw.projects ?? [], 30).map((item) => ({
      name: item.name?.trim() ?? "",
      description: item.description?.trim() ?? "",
      url: item.url?.trim() ?? "",
      technologies: cap(
        (item.technologies ?? []).map((t) => t.trim()).filter(Boolean),
        20
      ),
    })),
    certifications: cap(raw.certifications ?? [], 30).map((item) => ({
      name: item.name?.trim() ?? "",
      issuer: item.issuer?.trim() ?? "",
      issuedOn: item.issuedOn?.trim() ?? "",
      url: item.url?.trim() ?? "",
    })),
    links: cap(raw.links ?? [], 20).map((item) => ({
      label: item.label?.trim() ?? "",
      url: item.url?.trim() ?? "",
    })),
  };
}

export async function parseResumeWithGemini(options: {
  mimeType: string;
  buffer: Buffer;
  docxText?: string;
}): Promise<ParsedResume> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: resumeResponseSchema,
      temperature: 0.1,
    },
  });

  let result;

  if (options.mimeType === RESUME_MIME_TYPES.pdf) {
    result = await model.generateContent([
      {
        inlineData: {
          mimeType: RESUME_MIME_TYPES.pdf,
          data: options.buffer.toString("base64"),
        },
      },
      { text: "Extract all resume information from this PDF." },
    ]);
  } else {
    const text = options.docxText?.trim();
    if (!text) {
      throw new Error("Could not extract text from the DOCX file.");
    }
    result = await model.generateContent([
      {
        text: `Extract all resume information from the following resume text:\n\n${text}`,
      },
    ]);
  }

  const responseText = result.response.text();
  if (!responseText) {
    throw new Error("Gemini returned an empty response.");
  }

  let parsed: ParsedResume;
  try {
    parsed = JSON.parse(responseText) as ParsedResume;
  } catch {
    throw new Error("Failed to parse Gemini response as JSON.");
  }

  return normalizeParsedResume(parsed);
}
