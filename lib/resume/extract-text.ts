import mammoth from "mammoth";

import { RESUME_MIME_TYPES } from "@/lib/database.types";

export async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

export function isAllowedResumeMimeType(mimeType: string): boolean {
  return (
    mimeType === RESUME_MIME_TYPES.pdf || mimeType === RESUME_MIME_TYPES.docx
  );
}

export function getResumeMimeType(file: File): string {
  if (file.type) {
    return file.type;
  }

  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf")) {
    return RESUME_MIME_TYPES.pdf;
  }
  if (lower.endsWith(".docx")) {
    return RESUME_MIME_TYPES.docx;
  }

  return file.type;
}
