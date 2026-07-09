"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileUploadIcon,
  Pdf01Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";

import { uploadAndParseResume } from "@/lib/profile/actions";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type UploadState = "idle" | "uploading" | "processing" | "error" | "done";

const ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function OnboardingDialog({ open }: { open: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isBusy =
    isPending || uploadState === "uploading" || uploadState === "processing";

  const handleFile = useCallback((file: File | null) => {
    if (!file) return;

    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".pdf") && !lower.endsWith(".docx")) {
      setErrorMessage("Only PDF and DOCX files are supported.");
      setUploadState("error");
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    setUploadState("idle");
  }, []);

  const handleUpload = () => {
    if (!selectedFile || isBusy) return;

    startTransition(async () => {
      setUploadState("uploading");
      setErrorMessage(null);

      const formData = new FormData();
      formData.append("file", selectedFile);

      setUploadState("processing");

      const result = await uploadAndParseResume(formData);

      if (!result.success) {
        setUploadState("error");
        setErrorMessage(result.error ?? "Upload failed. Please try again.");
        return;
      }

      setUploadState("done");
      router.refresh();
    });
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    handleFile(file);
  };

  return (
    <Dialog open={open} onOpenChange={() => undefined} disablePointerDismissal>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Upload your resume to get started</DialogTitle>
          <DialogDescription>
            We&apos;ll analyze your resume and automatically fill in your profile
            so you can start applying to jobs right away.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                inputRef.current?.click();
              }
            }}
            onClick={() => !isBusy && inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/40",
              isBusy && "pointer-events-none opacity-60"
            )}
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <HugeiconsIcon
                icon={FileUploadIcon}
                strokeWidth={2}
                className="size-6 text-muted-foreground"
              />
            </div>
            <div>
              <p className="text-sm font-medium">
                Drag and drop your resume here
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF or DOCX, up to 10 MB
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" disabled={isBusy}>
              Browse files
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(event) =>
                handleFile(event.target.files?.[0] ?? null)
              }
            />
          </div>

          {selectedFile && (
            <Attachment
              state={
                uploadState === "idle"
                  ? "idle"
                  : uploadState === "error"
                    ? "error"
                    : uploadState === "done"
                      ? "done"
                      : uploadState
              }
              className="w-full"
            >
              <AttachmentMedia>
                <HugeiconsIcon icon={Pdf01Icon} strokeWidth={2} />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{selectedFile.name}</AttachmentTitle>
                <AttachmentDescription>
                  {uploadState === "uploading" && "Uploading…"}
                  {uploadState === "processing" && "Analyzing your resume…"}
                  {uploadState === "idle" &&
                    `${(selectedFile.size / 1024).toFixed(0)} KB — ready to upload`}
                  {uploadState === "done" && "Profile updated successfully"}
                  {uploadState === "error" &&
                    (errorMessage ?? "Something went wrong")}
                </AttachmentDescription>
              </AttachmentContent>
            </Attachment>
          )}

          {errorMessage && uploadState === "error" && !selectedFile && (
            <p className="text-xs text-destructive">{errorMessage}</p>
          )}

          <Button
            type="button"
            className="w-full"
            disabled={!selectedFile || isBusy || uploadState === "done"}
            onClick={handleUpload}
          >
            {isBusy ? (
              <>
                <Spinner className="mr-2" />
                {uploadState === "processing"
                  ? "Analyzing resume…"
                  : "Uploading…"}
              </>
            ) : (
              <>
                <HugeiconsIcon
                  icon={Upload01Icon}
                  strokeWidth={2}
                  className="mr-2 size-4"
                />
                Upload and continue
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
