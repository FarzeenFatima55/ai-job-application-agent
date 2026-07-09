"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { updateChangeStatus } from "@/lib/jobs/actions";
import { Button } from "@/components/ui/button";
import type { ResumeChange } from "@/lib/jobs/types";

const SECTION_LABEL: Record<ResumeChange["section"], string> = {
    summary: "Summary",
    experience: "Experience",
    project: "Project",
};

function ChangeCard({
    change,
    tailoredResumeId,
}: {
    change: ResumeChange;
    tailoredResumeId: string;
}) {
    const [status, setStatus] = useState(change.status);
    const [isPending, startTransition] = useTransition();

    const handleDecision = (decision: "accepted" | "rejected") => {
        startTransition(async () => {
            const result = await updateChangeStatus(tailoredResumeId, change.id, decision);
            if (result.success) {
                setStatus(decision);
            } else {
                toast.error(result.error);
            }
        });
    };

    return (
        <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {SECTION_LABEL[change.section]}
                    {change.itemIndex !== null ? ` #${change.itemIndex + 1}` : ""}
                </span>
                {status !== "pending" && (
                    <span
                        className={
                            status === "accepted"
                                ? "text-xs font-medium text-primary"
                                : "text-xs font-medium text-muted-foreground line-through"
                        }
                    >
                        {status === "accepted" ? "Accepted" : "Rejected"}
                    </span>
                )}
            </div>

            <div className="space-y-2">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                        Original
                    </p>
                    <p className="text-sm text-muted-foreground line-through decoration-muted-foreground/40">
                        {change.original}
                    </p>
                </div>
                <div
                    className="rounded-lg border p-3"
                    style={{
                        borderColor: "color-mix(in srgb, var(--primary) 40%, var(--border))",
                        background: "color-mix(in srgb, var(--primary) 6%, transparent)",
                    }}
                >
                    <p className="mb-1 text-[10px] uppercase tracking-wide text-primary">Suggested</p>
                    <p className="text-sm text-foreground">{change.suggested}</p>
                </div>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">{change.reason}</p>

            {status === "pending" && (
                <div className="mt-3 flex gap-2">
                    <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleDecision("accepted")}
                        className="gap-1"
                    >
                        <Check className="h-3.5 w-3.5" />
                        Accept
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => handleDecision("rejected")}
                        className="gap-1"
                    >
                        <X className="h-3.5 w-3.5" />
                        Reject
                    </Button>
                </div>
            )}
        </div>
    );
}

export function DiffView({
    changes,
    tailoredResumeId,
}: {
    changes: ResumeChange[];
    tailoredResumeId: string | null;
}) {
    if (!tailoredResumeId || changes.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No tailored suggestions yet. Analyze this job to generate resume changes.
            </p>
        );
    }

    const acceptedCount = changes.filter((c) => c.status === "accepted").length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">
                    Suggested changes ({changes.length})
                </h3>
                <span className="text-xs text-muted-foreground">{acceptedCount} accepted</span>
            </div>
            <div className="space-y-3">
                {changes.map((change) => (
                    <ChangeCard key={change.id} change={change} tailoredResumeId={tailoredResumeId} />
                ))}
            </div>
        </div>
    );
}