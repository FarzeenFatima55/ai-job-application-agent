"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  Download01Icon,
  File01Icon,
  Pdf01Icon,
} from "@hugeicons/core-free-icons";

import { deleteResume, downloadResume } from "@/lib/profile/actions";
import type { ResumeRecord } from "@/lib/profile/types";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function attachmentState(
  status: string
): "idle" | "uploading" | "processing" | "error" | "done" {
  switch (status) {
    case "processing":
    case "pending":
      return "processing";
    case "failed":
      return "error";
    case "completed":
      return "done";
    default:
      return "idle";
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge variant="secondary">Parsed</Badge>;
    case "processing":
    case "pending":
      return <Badge variant="outline">Processing</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

type ResumeListProps = {
  resumes: ResumeRecord[];
};

export function ResumeList({ resumes }: ResumeListProps) {
  const [isPending, startTransition] = useTransition();

  const handleDownload = (resumeId: string, fileName: string) => {
    startTransition(async () => {
      const result = await downloadResume(resumeId);
      if (!result.success || !result.url) {
        toast.error(result.error ?? "Download failed.");
        return;
      }

      const anchor = document.createElement("a");
      anchor.href = result.url;
      anchor.download = fileName;
      anchor.target = "_blank";
      anchor.rel="noopener noreferrer";
      anchor.click();
    });
  };

  const handleDelete = (resumeId: string) => {
    startTransition(async () => {
      const result = await deleteResume(resumeId);
      if (result.success) {
        toast.success("Resume deleted.");
      } else {
        toast.error(result.error ?? "Delete failed.");
      }
    });
  };

  if (resumes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No resumes yet</CardTitle>
          <CardDescription>
            Upload a resume from the onboarding dialog to see it listed here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {resumes.map((resume) => (
        <Attachment
          key={resume.id}
          state={attachmentState(resume.parseStatus)}
          className="w-full max-w-none"
        >
          <AttachmentMedia>
            <HugeiconsIcon
              icon={
                resume.mimeType === "application/pdf" ? Pdf01Icon : File01Icon
              }
              strokeWidth={2}
            />
          </AttachmentMedia>
          <AttachmentContent>
            <div className="flex flex-wrap items-center gap-2">
              <AttachmentTitle>{resume.fileName}</AttachmentTitle>
              {statusBadge(resume.parseStatus)}
            </div>
            <AttachmentDescription>
              {formatFileSize(resume.fileSize)} · Uploaded{" "}
              {format(new Date(resume.createdAt), "MMM d, yyyy")}
              {resume.errorMessage && resume.parseStatus === "failed"
                ? ` · ${resume.errorMessage}`
                : null}
            </AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction
              aria-label="Download resume"
              disabled={isPending}
              onClick={() => handleDownload(resume.id, resume.fileName)}
            >
              {isPending ? (
                <Spinner />
              ) : (
                <HugeiconsIcon icon={Download01Icon} strokeWidth={2} />
              )}
            </AttachmentAction>
            <AttachmentAction
              aria-label="Delete resume"
              disabled={isPending}
              onClick={() => handleDelete(resume.id)}
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      ))}
    </div>
  );
}
