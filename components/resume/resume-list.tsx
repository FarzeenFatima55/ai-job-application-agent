"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  Trash2, 
  Download, 
  FileText, 
  UploadCloud, 
  AlertTriangle,
  Loader2,
  CheckCircle,
  FileUp
} from "lucide-react";

import { deleteResume, downloadResume, uploadAndParseResume } from "@/lib/profile/actions";
import type { ResumeRecord } from "@/lib/profile/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type ResumeListProps = {
  resumes: ResumeRecord[];
};

export function ResumeList({ resumes }: ResumeListProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  // Upload states
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "processing" | "error" | "done">("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Delete modal state
  const [resumeToDelete, setResumeToDelete] = useState<ResumeRecord | null>(null);

  const isBusy = isPending || uploadState === "uploading" || uploadState === "processing";

  // Drag and Drop handlers
  const handleFileChange = useCallback((file: File | null) => {
    if (!file) return;

    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".pdf") && !lower.endsWith(".docx")) {
      setErrorMessage("Only PDF and DOCX files are supported.");
      setUploadState("error");
      toast.error("Only PDF and DOCX files are supported.");
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    setUploadState("idle");
  }, []);

  const handleUploadSubmit = () => {
    if (!selectedFile || isBusy) return;

    startTransition(async () => {
      setUploadState("uploading");
      setErrorMessage(null);

      const formData = new FormData();
      formData.append("file", selectedFile);

      setUploadState("processing");
      toast.info("Uploading and parsing resume with Gemini AI...");

      const result = await uploadAndParseResume(formData);

      if (!result.success) {
        setUploadState("error");
        const msg = result.error ?? "Upload failed. Please try again.";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      setUploadState("done");
      toast.success("Resume uploaded and parsed successfully! Profile updated.");
      setSelectedFile(null);
      router.refresh();
    });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFileChange(file);
  };

  // Action handlers
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
      anchor.rel = "noopener noreferrer";
      anchor.click();
    });
  };

  const handleDeleteSubmit = () => {
    if (!resumeToDelete) return;

    startTransition(async () => {
      const result = await deleteResume(resumeToDelete.id);
      if (result.success) {
        toast.success("Resume deleted successfully.");
        setResumeToDelete(null);
        router.refresh();
      } else {
        toast.error(result.error ?? "Delete failed.");
      }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Drag & Drop Upload Zone (Always Visible) */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <FileUp className="h-4 w-4 text-primary" />
            Upload New Resume
          </CardTitle>
          <CardDescription className="text-xs">
            Drag & drop your resume file or browse. Gemini AI will analyze it to update your onboarding profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => !isBusy && fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                fileInputRef.current?.click();
              }
            }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-primary bg-primary/5 scale-[0.99]"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            } ${isBusy && "pointer-events-none opacity-60"}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:text-primary">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-[10px] text-muted-foreground">
                Supports PDF or DOCX format (Max 10 MB)
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs" disabled={isBusy}>
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Selected File Details */}
          {selectedFile && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">{selectedFile.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatFileSize(selectedFile.size)} · ready to upload
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={handleUploadSubmit} 
                  disabled={isBusy}
                  className="h-8 text-xs"
                >
                  {isBusy ? (
                    <>
                      <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                      {uploadState === "processing" ? "Parsing…" : "Uploading…"}
                    </>
                  ) : (
                    "Upload Resume"
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setSelectedFile(null)} 
                  disabled={isBusy}
                  className="h-8 text-xs text-muted-foreground"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Uploaded Resumes Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          Uploaded Resumes ({resumes.length})
        </h3>
        
        {resumes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center bg-card/30">
            <p className="text-xs text-muted-foreground">
              No resumes uploaded yet. Use the upload area above to parse and add your resume.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-semibold text-foreground">{resume.fileName}</h4>
                      {resume.parseStatus === "completed" && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 text-[10px] py-0 px-1.5">Parsed</Badge>
                      )}
                      {(resume.parseStatus === "processing" || resume.parseStatus === "pending") && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 flex items-center gap-1">
                          <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />
                          Processing
                        </Badge>
                      )}
                      {resume.parseStatus === "failed" && (
                        <Badge variant="destructive" className="text-[10px] py-0 px-1.5">Failed</Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {formatFileSize(resume.fileSize)} · Uploaded{" "}
                      {format(new Date(resume.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 sm:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    disabled={isPending}
                    onClick={() => handleDownload(resume.id, resume.fileName)}
                  >
                    {isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => setResumeToDelete(resume)}
                    disabled={isPending}
                    title="Delete Resume"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!resumeToDelete} onOpenChange={(open) => !open && setResumeToDelete(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-center">Delete Resume?</DialogTitle>
            <DialogDescription className="text-center text-xs">
              Are you sure you want to permanently delete the resume <strong>{resumeToDelete?.fileName}</strong>? The file will be removed from storage, but your parsed profile data will remain unchanged.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-center flex-row gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setResumeToDelete(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDeleteSubmit} disabled={isPending}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
