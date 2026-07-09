"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
    Search, 
    Trash2, 
    Edit, 
    ExternalLink, 
    Calendar, 
    AlertTriangle,
    SlidersHorizontal,
    Briefcase
} from "lucide-react";

import type { Job, JobStatus } from "@/lib/jobs/types";
import { deleteJob, updateJob, updateJobStatus } from "@/lib/jobs/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

const STATUS_LABEL: Record<JobStatus, string> = {
    saved: "Saved",
    applied: "Applied",
    interview: "Interview",
    offer: "Offer",
    rejected: "Rejected",
};

const STATUS_VARIANTS: Record<JobStatus, string> = {
    saved: "secondary",
    applied: "outline",
    interview: "info",
    offer: "success",
    rejected: "destructive",
};

export function JobsList({ jobs }: { jobs: Job[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Filters and Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [scoreFilter, setScoreFilter] = useState<string>("all");

    // Modal/Dialog states
    const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
    const [jobToEdit, setJobToEdit] = useState<Job | null>(null);

    // Edit Form state
    const [editCompany, setEditCompany] = useState("");
    const [editRole, setEditRole] = useState("");
    const [editJd, setEditJd] = useState("");

    const openEditModal = (job: Job) => {
        setJobToEdit(job);
        setEditCompany(job.company);
        setEditRole(job.roleTitle);
        setEditJd(job.jdText);
    };

    const handleEditSubmit = () => {
        if (!jobToEdit) return;
        if (!editCompany || !editRole || !editJd.trim()) {
            toast.error("Company, role, and description are required.");
            return;
        }

        startTransition(async () => {
            const res = await updateJob(jobToEdit.id, editCompany, editRole, editJd);
            if (res.success) {
                toast.success("Job updated successfully. AI analysis has been reset.");
                setJobToEdit(null);
                router.refresh();
            } else {
                toast.error(res.error ?? "Failed to update job.");
            }
        });
    };

    const handleDeleteSubmit = () => {
        if (!jobToDelete) return;

        startTransition(async () => {
            const res = await deleteJob(jobToDelete.id);
            if (res.success) {
                toast.success("Job deleted successfully.");
                setJobToDelete(null);
                router.refresh();
            } else {
                toast.error(res.error ?? "Failed to delete job.");
            }
        });
    };

    const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
        startTransition(async () => {
            const res = await updateJobStatus(jobId, newStatus);
            if (res.success) {
                toast.success(`Status updated to ${STATUS_LABEL[newStatus]}`);
                router.refresh();
            } else {
                toast.error(res.error ?? "Failed to update status.");
            }
        });
    };

    // Apply filtering logic
    const filteredJobs = jobs.filter((job) => {
        const matchesSearch = 
            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.roleTitle.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "all" || job.status === statusFilter;

        let matchesScore = true;
        if (scoreFilter !== "all" && job.matchScore !== null) {
            const score = job.matchScore;
            if (scoreFilter === "high") matchesScore = score >= 80;
            else if (scoreFilter === "mid") matchesScore = score >= 50 && score < 80;
            else if (scoreFilter === "low") matchesScore = score < 50;
        } else if (scoreFilter !== "all" && job.matchScore === null) {
            matchesScore = false;
        }

        return matchesSearch && matchesStatus && matchesScore;
    });

    return (
        <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/50 p-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search company or role..."
                        className="pl-9"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                        <NativeSelect
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <NativeSelectOption value="all">All Statuses</NativeSelectOption>
                            <NativeSelectOption value="saved">Saved</NativeSelectOption>
                            <NativeSelectOption value="applied">Applied</NativeSelectOption>
                            <NativeSelectOption value="interview">Interview</NativeSelectOption>
                            <NativeSelectOption value="offer">Offer</NativeSelectOption>
                            <NativeSelectOption value="rejected">Rejected</NativeSelectOption>
                        </NativeSelect>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                        <NativeSelect
                            value={scoreFilter}
                            onChange={(e) => setScoreFilter(e.target.value)}
                        >
                            <NativeSelectOption value="all">All Match Scores</NativeSelectOption>
                            <NativeSelectOption value="high">High Match (≥ 80%)</NativeSelectOption>
                            <NativeSelectOption value="mid">Mid Match (50% - 79%)</NativeSelectOption>
                            <NativeSelectOption value="low">Low Match (&lt; 50%)</NativeSelectOption>
                        </NativeSelect>
                    </div>
                </div>
            </div>

            {filteredJobs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        {jobs.length === 0 
                            ? "No jobs added yet. Paste a job description above to get started." 
                            : "No jobs match your search/filter criteria."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {filteredJobs.map((job) => (
                        <div
                            key={job.id}
                            className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-xs sm:flex-row sm:items-center"
                        >
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-sm font-semibold text-foreground">{job.roleTitle}</h3>
                                    <Badge 
                                        variant="outline"
                                        className={
                                            job.status === "offer" ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400" :
                                            job.status === "interview" ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                                            job.status === "rejected" ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400" :
                                            "border-border bg-accent text-accent-foreground"
                                        }
                                    >
                                        {STATUS_LABEL[job.status]}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">{job.company}</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Added {format(new Date(job.createdAt), "MMM d, yyyy")}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-3 sm:mt-0 sm:border-0 sm:pt-0">
                                <div className="flex items-center gap-3">
                                    {job.matchScore !== null ? (
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-bold text-primary">
                                                {job.matchScore}% Match
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground italic">
                                            Not analyzed
                                        </span>
                                    )}

                                    {/* Status dropdown directly on card for convenience */}
                                    <NativeSelect
                                        value={job.status}
                                        onChange={(e) => handleStatusChange(job.id, e.target.value as JobStatus)}
                                        size="sm"
                                        className="h-6"
                                    >
                                        <NativeSelectOption value="saved">Saved</NativeSelectOption>
                                        <NativeSelectOption value="applied">Applied</NativeSelectOption>
                                        <NativeSelectOption value="interview">Interview</NativeSelectOption>
                                        <NativeSelectOption value="offer">Offer</NativeSelectOption>
                                        <NativeSelectOption value="rejected">Rejected</NativeSelectOption>
                                    </NativeSelect>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => openEditModal(job)}
                                        title="Edit Job"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => setJobToDelete(job)}
                                        className="text-destructive hover:bg-destructive/10"
                                        title="Delete Job"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>

                                    <Link href={`/dashboard/jobs/${job.id}`} passHref>
                                        <Button size="sm" variant="outline" className="h-8 gap-1.5 ml-1 text-xs">
                                            {job.matchScore !== null ? "View Analysis" : "Analyze Match"}
                                            <ExternalLink className="h-3 w-3" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Job Modal */}
            <Dialog open={!!jobToEdit} onOpenChange={(open) => !open && setJobToEdit(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Job Details</DialogTitle>
                        <DialogDescription>
                            Update the job information. If you update the description, any existing AI analysis will be reset.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="py-2">
                        <Field>
                            <FieldLabel htmlFor="edit-company">Company</FieldLabel>
                            <Input
                                id="edit-company"
                                value={editCompany}
                                onChange={(e) => setEditCompany(e.target.value)}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="edit-role">Role Title</FieldLabel>
                            <Input
                                id="edit-role"
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value)}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="edit-jd">Job Description</FieldLabel>
                            <Textarea
                                id="edit-jd"
                                rows={8}
                                value={editJd}
                                onChange={(e) => setEditJd(e.target.value)}
                            />
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setJobToEdit(null)} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditSubmit} disabled={isPending}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
                <DialogContent className="sm:max-w-xs">
                    <DialogHeader>
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <DialogTitle className="text-center">Delete Job?</DialogTitle>
                        <DialogDescription className="text-center">
                            Are you sure you want to permanently delete the job <strong>{jobToDelete?.roleTitle}</strong> at <strong>{jobToDelete?.company}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="sm:justify-center flex-row gap-2 mt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setJobToDelete(null)} disabled={isPending}>
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