"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
    Award,
    Building2,
    Calendar,
    CheckCircle,
    Copy,
    Edit,
    FileText,
    GraduationCap,
    Info,
    ListTodo,
    Loader2,
    Play,
    Printer,
    Sparkles,
    TrendingUp,
    XCircle
} from "lucide-react";

import type { Job, ResumeChange, JobAnalysisResult } from "@/lib/jobs/types";
import type { UserProfileFormData } from "@/lib/profile/types";
import { analyzeJobMatch, generateCoverLetterAction, updateJobStatus, acceptAllChangesAction } from "@/lib/jobs/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { DiffView } from "./diff-view";

const STATUS_LABEL: Record<Job["status"], string> = {
    saved: "Saved",
    applied: "Applied",
    interview: "Interview",
    offer: "Offer",
    rejected: "Rejected",
};

interface JobDetailClientProps {
    job: Job;
    profile: UserProfileFormData;
    initialChanges: ResumeChange[];
    initialAnalysis: JobAnalysisResult | null;
    tailoredResumeId: string | null;
}

export function JobDetailClient({
    job,
    profile,
    initialChanges,
    initialAnalysis,
    tailoredResumeId
}: JobDetailClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Tab state
    const [activeTab, setActiveTab] = useState<"match" | "tailoring" | "cover-letter" | "tailored-resume">("match");

    // Dynamic states
    const [status, setStatus] = useState<Job["status"]>(job.status);
    const [coverLetter, setCoverLetter] = useState<string | null>(null);
    const [isGeneratingCoverLetter, startCoverLetterTransition] = useTransition();

    const handleAcceptAll = () => {
        if (!tailoredResumeId) return;
        startTransition(async () => {
            toast.info("Applying all suggestions to resume…");
            const res = await acceptAllChangesAction(tailoredResumeId);
            if (res.success) {
                toast.success("All suggestions accepted and applied!");
                router.refresh();
            } else {
                toast.error(res.error ?? "Failed to apply suggestions.");
            }
        });
    };

    const handleStatusUpdate = (newStatus: Job["status"]) => {
        startTransition(async () => {
            const res = await updateJobStatus(job.id, newStatus);
            if (res.success) {
                setStatus(newStatus);
                toast.success(`Status updated to ${STATUS_LABEL[newStatus]}`);
                router.refresh();
            } else {
                toast.error(res.error ?? "Failed to update status.");
            }
        });
    };

    const handleRunAnalysis = () => {
        startTransition(async () => {
            toast.info("Analyzing match with Gemini AI…");
            const res = await analyzeJobMatch(job.id, job.jdText);
            if (res.success) {
                toast.success(`Match analysis complete! Score: ${res.data.matchScore}%`);
                router.refresh();
            } else {
                toast.error(res.error ?? "Failed to run match analysis.");
            }
        });
    };

    const handleGenerateCoverLetter = () => {
        startCoverLetterTransition(async () => {
            toast.info("Generating personalized cover letter…");
            const res = await generateCoverLetterAction(job.id);
            if (res.success && res.coverLetter) {
                setCoverLetter(res.coverLetter);
                toast.success("Cover letter generated!");
                setActiveTab("cover-letter");
            } else {
                toast.error(res.error ?? "Failed to generate cover letter.");
            }
        });
    };

    const handleCopyCoverLetter = () => {
        if (!coverLetter) return;
        navigator.clipboard.writeText(coverLetter);
        toast.success("Cover letter copied to clipboard!");
    };

    const handlePrintResume = () => {
        window.print();
    };

    // Calculate applied tailored changes
    const applyTailoredChanges = (baseProfile: UserProfileFormData, changesList: ResumeChange[]): UserProfileFormData => {
        const tailored = JSON.parse(JSON.stringify(baseProfile)) as UserProfileFormData;
        
        changesList.forEach((c) => {
            if (c.status !== "accepted") return;
            
            if (c.section === "summary") {
                tailored.professionalSummary = c.suggested;
            } else if (c.section === "experience" && c.itemIndex !== null) {
                const exp = tailored.workExperiences[c.itemIndex];
                if (exp) {
                    exp.responsibilities = exp.responsibilities.map((bullet) => {
                        if (bullet.trim() === c.original.trim()) {
                            return c.suggested;
                        }
                        return bullet;
                    });
                }
            } else if (c.section === "project" && c.itemIndex !== null) {
                const proj = tailored.projects[c.itemIndex];
                if (proj) {
                    if (proj.description.trim() === c.original.trim()) {
                        proj.description = c.suggested;
                    }
                }
            }
        });
        
        return tailored;
    };

    const tailoredProfile = applyTailoredChanges(profile, initialChanges);

    // If analysis hasn't been run yet
    if (!initialAnalysis) {
        return (
            <div className="mx-auto max-w-3xl space-y-6">
                <Card className="border-border">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <Building2 className="h-3 w-3" />
                            <span>{job.company}</span>
                        </div>
                        <CardTitle className="text-xl font-bold">{job.roleTitle}</CardTitle>
                        <CardDescription>
                            Added on {format(new Date(job.createdAt), "MMMM d, yyyy")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="rounded-xl bg-muted/30 border border-border p-6 text-center space-y-4">
                            <Sparkles className="h-10 w-10 text-primary mx-auto animate-pulse" />
                            <h3 className="text-base font-semibold">Ready to Analyze</h3>
                            <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                Run Gemini AI match analysis to evaluate this job description against your resume, calculate match scores, missing skills, and suggest improvements.
                            </p>
                            <Button onClick={handleRunAnalysis} disabled={isPending} className="w-full sm:w-auto">
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing Match…
                                    </>
                                ) : (
                                    <>
                                        <Play className="mr-2 h-4 w-4" />
                                        Analyze Match
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Description</h4>
                            <div className="rounded-lg border border-border bg-card p-4 whitespace-pre-wrap text-xs text-foreground/80 max-h-96 overflow-y-auto font-sans">
                                {job.jdText}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const {
        matchScore,
        matchedSkills,
        missingSkills,
        skillsToLearn,
        strengths,
        weaknesses,
        atsScore,
        missingKeywords,
        suggestions,
        tailoredSummary,
        projectImprovements,
        experienceImprovements,
        educationRelevance,
        certifications,
        priorityActions
    } = initialAnalysis;

    return (
        <div className="space-y-6 pb-12">
            {/* Screen layout wrapper (hidden on print) */}
            <div className="print:hidden space-y-6">
                
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-center">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
                            <span className="font-semibold text-foreground">{job.company}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Analysis Date: {format(new Date(job.createdAt), "MMM d, yyyy")}
                            </span>
                        </div>
                        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">{job.roleTitle}</h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Status Select */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Status:</span>
                            <Badge 
                                className={
                                    status === "offer" ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" :
                                    status === "interview" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" :
                                    status === "rejected" ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20" :
                                    "bg-accent text-accent-foreground border border-border"
                                }
                                variant="outline"
                            >
                                {STATUS_LABEL[status]}
                            </Badge>
                            <NativeSelect
                                value={status}
                                onChange={(e) => handleStatusUpdate(e.target.value as Job["status"])}
                                size="sm"
                                className="h-7 w-28"
                                disabled={isPending}
                            >
                                <NativeSelectOption value="saved">Saved</NativeSelectOption>
                                <NativeSelectOption value="applied">Applied</NativeSelectOption>
                                <NativeSelectOption value="interview">Interview</NativeSelectOption>
                                <NativeSelectOption value="offer">Offer</NativeSelectOption>
                                <NativeSelectOption value="rejected">Rejected</NativeSelectOption>
                            </NativeSelect>
                        </div>

                        {/* Re-analyze Button */}
                        <Button variant="outline" size="sm" onClick={handleRunAnalysis} disabled={isPending} className="h-7 text-xs">
                            {isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                            Re-analyze
                        </Button>
                    </div>
                </div>

                {/* Dashboard Tabs Bar */}
                <div className="flex border-b border-border overflow-x-auto gap-2">
                    <button
                        onClick={() => setActiveTab("match")}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-all ${
                            activeTab === "match" 
                                ? "border-primary text-foreground font-semibold" 
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <TrendingUp className="h-4 w-4" />
                        Match Analysis
                    </button>
                    <button
                        onClick={() => setActiveTab("tailoring")}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-all ${
                            activeTab === "tailoring" 
                                ? "border-primary text-foreground font-semibold" 
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Edit className="h-4 w-4" />
                        Resume Tailoring
                    </button>
                    <button
                        onClick={() => setActiveTab("cover-letter")}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-all ${
                            activeTab === "cover-letter" 
                                ? "border-primary text-foreground font-semibold" 
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <FileText className="h-4 w-4" />
                        Cover Letter
                    </button>
                    <button
                        onClick={() => setActiveTab("tailored-resume")}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-all ${
                            activeTab === "tailored-resume" 
                                ? "border-primary text-foreground font-semibold" 
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Printer className="h-4 w-4" />
                        Tailored Resume
                    </button>
                </div>

                {/* Tabs Content */}
                <div className="space-y-6">

                    {/* TAB 1: Match Analysis */}
                    {activeTab === "match" && (
                        <div className="grid gap-6 md:grid-cols-3">
                            
                            {/* Score & Key Metrics Panel */}
                            <div className="space-y-6 md:col-span-1">
                                <Card className="border-border bg-gradient-to-br from-primary/5 via-card to-card">
                                    <CardHeader className="pb-3 text-center">
                                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Match Score</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center pb-6">
                                        <div className="relative flex items-center justify-center">
                                            {/* Circular Match score display */}
                                            <div className="h-28 w-28 rounded-full border-4 border-muted flex flex-col items-center justify-center bg-card shadow-xs">
                                                <span className="text-3xl font-black text-primary">{matchScore}%</span>
                                                <span className="text-[10px] text-muted-foreground font-semibold uppercase">Overall</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 w-full space-y-1 text-center">
                                            <Progress value={matchScore} className="h-2 bg-muted" />
                                            <span className="text-[10px] text-muted-foreground">
                                                Matching against your profile
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-border">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                            <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                            ATS Score
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-foreground">{atsScore}%</span>
                                            <Badge variant="secondary" className="text-[10px]">ATS Friendly</Badge>
                                        </div>
                                        <Progress value={atsScore} className="h-1.5 bg-muted mt-2" />
                                        <p className="text-[10px] text-muted-foreground mt-2">
                                            Reflects keyword saturation, structure, and formatting compatibility.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-border">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                            <ListTodo className="h-3.5 w-3.5 text-primary" />
                                            Quick Actions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 pb-4">
                                        <Button 
                                            onClick={handleGenerateCoverLetter} 
                                            disabled={isGeneratingCoverLetter}
                                            variant="outline" 
                                            className="w-full text-xs h-8"
                                        >
                                            {isGeneratingCoverLetter ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <FileText className="h-3.5 w-3.5 mr-2 text-primary" />}
                                            Generate Cover Letter
                                        </Button>
                                        <Button 
                                            onClick={() => setActiveTab("tailoring")} 
                                            className="w-full text-xs h-8"
                                        >
                                            <Edit className="h-3.5 w-3.5 mr-2" />
                                            Review Suggestions
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Skills, Strengths, Weaknesses */}
                            <div className="space-y-6 md:col-span-2">
                                
                                {/* Skills Breakdown */}
                                <Card className="border-border">
                                    <CardHeader>
                                        <CardTitle className="text-sm font-semibold flex items-center gap-1">
                                            Skills Evaluation
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Skills mapped from your profile compared to the job description requirements.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Matched Skills */}
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                                Matched Skills ({matchedSkills.length})
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {matchedSkills.map((skill) => (
                                                    <Badge key={skill} className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 hover:bg-green-500/20 text-xs px-2 py-0.5">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                                {matchedSkills.length === 0 && <span className="text-xs text-muted-foreground italic">None identified</span>}
                                            </div>
                                        </div>

                                        {/* Missing Skills */}
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                                <span className="h-2 w-2 rounded-full bg-red-500" />
                                                Missing Skills ({missingSkills.length})
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {missingSkills.map((skill) => (
                                                    <Badge key={skill} className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20 text-xs px-2 py-0.5">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                                {missingSkills.length === 0 && <span className="text-xs text-muted-foreground italic">None identified</span>}
                                            </div>
                                        </div>

                                        {/* Skills to Learn */}
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                                Recommended to Learn ({skillsToLearn.length})
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {skillsToLearn.map((skill) => (
                                                    <Badge key={skill} className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 text-xs px-2 py-0.5">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                                {skillsToLearn.length === 0 && <span className="text-xs text-muted-foreground italic">None identified</span>}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Strengths and Weaknesses */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Card className="border-border">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 flex items-center gap-1.5">
                                                <CheckCircle className="h-4 w-4" />
                                                Resume Strengths
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                                                {strengths.map((str, idx) => (
                                                    <li key={idx}>{str}</li>
                                                ))}
                                                {strengths.length === 0 && <span className="italic">None listed</span>}
                                            </ul>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
                                                <XCircle className="h-4 w-4" />
                                                Resume Weaknesses
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                                                {weaknesses.map((weak, idx) => (
                                                    <li key={idx}>{weak}</li>
                                                ))}
                                                {weaknesses.length === 0 && <span className="italic">None listed</span>}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Suggestions & Priority Actions */}
                                <Card className="border-border">
                                    <CardHeader>
                                        <CardTitle className="text-sm font-semibold">Priority Improvements & Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-medium text-foreground flex items-center gap-1">
                                                <Info className="h-3.5 w-3.5 text-primary" />
                                                Suggestions for Resume
                                            </h4>
                                            <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                                                {suggestions.map((sug, idx) => (
                                                    <li key={idx}>{sug}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="text-xs font-medium text-foreground flex items-center gap-1">
                                                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                                Priority Actions to Increase Interview Chances
                                            </h4>
                                            <ul className="list-decimal pl-4 space-y-1 text-xs text-muted-foreground">
                                                {priorityActions.map((act, idx) => (
                                                    <li key={idx} className="marker:text-primary font-medium text-foreground/90">{act}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Additional Metadata Details */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Card className="border-border">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                <GraduationCap className="h-4 w-4" />
                                                Education Relevance
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-xs text-muted-foreground">
                                            {educationRelevance || "No information returned."}
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                <Award className="h-4 w-4" />
                                                Certifications Alignment
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                                                {certifications.map((cert, idx) => (
                                                    <li key={idx}>{cert}</li>
                                                ))}
                                                {certifications.length === 0 && <span className="italic">No specific certifications requested.</span>}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: Resume Tailoring (Diff View) */}
                    {activeTab === "tailoring" && (
                        <div className="space-y-6">
                            <Card className="border-border">
                                <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                                            <Sparkles className="h-4 w-4 text-primary" />
                                            Tailored Recommendations
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Review details suggested by Gemini AI to align your experiences and summary with the job description.
                                        </CardDescription>
                                    </div>
                                    {initialChanges.some(c => c.status === "pending") && (
                                        <Button
                                            onClick={handleAcceptAll}
                                            disabled={isPending}
                                            size="sm"
                                            variant="outline"
                                            className="h-8 gap-1.5 text-xs border-primary/30 hover:bg-primary/5 hover:text-primary transition-all ml-auto"
                                        >
                                            <CheckCircle className="h-3.5 w-3.5" />
                                            Auto-Accept All
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <DiffView changes={initialChanges} tailoredResumeId={tailoredResumeId} />
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* TAB 3: Cover Letter */}
                    {activeTab === "cover-letter" && (
                        <Card className="border-border">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-sm font-semibold">Generated Cover Letter</CardTitle>
                                    <CardDescription className="text-xs">Tailored based on your profile and the requirements of the job.</CardDescription>
                                </div>
                                {coverLetter && (
                                    <Button onClick={handleCopyCoverLetter} variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                                        <Copy className="h-3 w-3" />
                                        Copy Letter
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {coverLetter ? (
                                    <div className="rounded-lg border border-border bg-muted/20 p-6 whitespace-pre-wrap text-xs/relaxed text-foreground font-sans max-h-[500px] overflow-y-auto shadow-inner">
                                        {coverLetter}
                                    </div>
                                ) : (
                                    <div className="rounded-xl bg-muted/30 border border-border p-8 text-center space-y-4">
                                        <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
                                        <h3 className="text-sm font-semibold">No Cover Letter Generated</h3>
                                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                            Generate a highly relevant cover letter targeting this job description and referencing your existing skills.
                                        </p>
                                        <Button onClick={handleGenerateCoverLetter} disabled={isGeneratingCoverLetter}>
                                            {isGeneratingCoverLetter ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                            Generate Cover Letter
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* TAB 4: Tailored Resume Print Preview */}
                    {activeTab === "tailored-resume" && (
                        <div className="space-y-4">
                            {initialChanges.some(c => c.status === "pending") && (
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                                    <div className="space-y-0.5">
                                        <h4 className="text-xs font-semibold text-foreground flex items-center gap-1">
                                            <Info className="h-3.5 w-3.5 text-amber-500" />
                                            Pending Tailoring Suggestions
                                        </h4>
                                        <p className="text-[10px] text-muted-foreground">
                                            There are {initialChanges.filter(c => c.status === "pending").length} suggestions that haven't been applied to this resume yet.
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={handleAcceptAll} 
                                        disabled={isPending}
                                        size="sm" 
                                        className="h-8 gap-1.5 bg-amber-500 hover:bg-amber-600 text-white border-0 text-xs"
                                    >
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Auto-Apply All Suggestions
                                    </Button>
                                </div>
                            )}
                            <div className="flex justify-between items-center rounded-xl bg-primary/5 border border-primary/20 p-4">
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1">
                                        <Printer className="h-3.5 w-3.5 text-primary" />
                                        Print Preview / Save PDF
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground">
                                        This view dynamically includes all of your **accepted suggestions** from the tailoring tab. Print this page or choose "Save as PDF" in your print options.
                                    </p>
                                </div>
                                <Button onClick={handlePrintResume} size="sm" className="h-8 gap-1.5">
                                    <Printer className="h-3.5 w-3.5" />
                                    Print / Save PDF
                                </Button>
                            </div>

                            {/* Resume Paper container */}
                            <div className="rounded-xl border border-border bg-white text-black p-8 font-sans max-w-[800px] mx-auto shadow-lg space-y-6">
                                {/* Header */}
                                <div className="text-center border-b pb-4 space-y-1">
                                    <h2 className="text-xl font-bold uppercase tracking-wide">{tailoredProfile.fullName}</h2>
                                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600">
                                        {tailoredProfile.email && <span>{tailoredProfile.email}</span>}
                                        {tailoredProfile.phone && <span>{tailoredProfile.phone}</span>}
                                        {tailoredProfile.location && <span>{tailoredProfile.location}</span>}
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                                        {tailoredProfile.linkedinUrl && <span>LinkedIn: {tailoredProfile.linkedinUrl}</span>}
                                        {tailoredProfile.githubUrl && <span>GitHub: {tailoredProfile.githubUrl}</span>}
                                        {tailoredProfile.portfolioUrl && <span>Portfolio: {tailoredProfile.portfolioUrl}</span>}
                                    </div>
                                </div>

                                {/* Summary */}
                                {tailoredProfile.professionalSummary && (
                                    <div className="space-y-1.5">
                                        <h3 className="text-sm font-bold uppercase border-b pb-0.5 tracking-wider">Professional Summary</h3>
                                        <p className="text-xs leading-relaxed text-slate-800">{tailoredProfile.professionalSummary}</p>
                                    </div>
                                )}

                                {/* Skills */}
                                {tailoredProfile.skills && tailoredProfile.skills.length > 0 && (
                                    <div className="space-y-1.5">
                                        <h3 className="text-sm font-bold uppercase border-b pb-0.5 tracking-wider">Skills</h3>
                                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-800">
                                            {tailoredProfile.skills.map((skill, idx) => (
                                                <span key={idx}>{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Experience */}
                                {tailoredProfile.workExperiences && tailoredProfile.workExperiences.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold uppercase border-b pb-0.5 tracking-wider">Professional Experience</h3>
                                        <div className="space-y-3">
                                            {tailoredProfile.workExperiences.map((exp, idx) => (
                                                <div key={idx} className="space-y-1">
                                                    <div className="flex justify-between text-xs font-semibold">
                                                        <span>{exp.title} - {exp.company}</span>
                                                        <span className="text-slate-500">{exp.startDate} - {exp.endDate || (exp.isCurrent ? "Present" : "")}</span>
                                                    </div>
                                                    {exp.location && <div className="text-[10px] text-slate-500">{exp.location}</div>}
                                                    <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-800 font-sans">
                                                        {exp.responsibilities.map((resp, bulletIdx) => (
                                                            <li key={bulletIdx}>{resp}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Projects */}
                                {tailoredProfile.projects && tailoredProfile.projects.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold uppercase border-b pb-0.5 tracking-wider">Projects</h3>
                                        <div className="space-y-2">
                                            {tailoredProfile.projects.map((proj, idx) => (
                                                <div key={idx} className="space-y-0.5">
                                                    <div className="flex justify-between text-xs font-semibold">
                                                        <span>{proj.name}</span>
                                                        {proj.url && <span className="text-slate-500 text-[10px]">{proj.url}</span>}
                                                    </div>
                                                    <p className="text-xs text-slate-800">{proj.description}</p>
                                                    {proj.technologies && proj.technologies.length > 0 && (
                                                        <div className="text-[10px] text-slate-500 font-medium">
                                                            Technologies: {proj.technologies.join(", ")}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Education */}
                                {tailoredProfile.education && tailoredProfile.education.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold uppercase border-b pb-0.5 tracking-wider">Education</h3>
                                        <div className="space-y-2">
                                            {tailoredProfile.education.map((edu, idx) => (
                                                <div key={idx} className="flex justify-between text-xs">
                                                    <div>
                                                        <span className="font-semibold">{edu.institution}</span>
                                                        <span className="text-slate-600 font-sans"> — {edu.degree} in {edu.fieldOfStudy}</span>
                                                    </div>
                                                    <div className="text-slate-500 text-right font-sans">
                                                        <div>{edu.startDate} - {edu.endDate}</div>
                                                        {edu.gpa && <div className="text-[10px]">GPA: {edu.gpa}</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Certifications */}
                                {tailoredProfile.certifications && tailoredProfile.certifications.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-bold uppercase border-b pb-0.5 tracking-wider">Certifications</h3>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                            {tailoredProfile.certifications.map((cert, idx) => (
                                                <div key={idx} className="flex justify-between">
                                                    <span>{cert.name} - {cert.issuer}</span>
                                                    <span className="text-slate-500">{cert.issuedOn}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* PRINT VIEW - Fully formatted printable document. (Only visible when printing) */}
            <div id="printable-resume" className="hidden print:block bg-white text-black p-4 font-serif text-[11px] leading-relaxed max-w-[8.5in] mx-auto">
                <style>{`
                    @media print {
                        body {
                            background: white !important;
                            color: black !important;
                        }
                        #printable-resume {
                            display: block !important;
                            width: 100% !important;
                            max-width: 100% !important;
                            padding: 0 !important;
                            margin: 0 !important;
                        }
                        /* Hide NextJS layout components */
                        header, footer, nav, aside, button, .print\\:hidden {
                            display: none !important;
                        }
                    }
                `}</style>
                {/* Header */}
                <div className="text-center border-b pb-3 space-y-0.5">
                    <h2 className="text-lg font-bold uppercase tracking-wide">{tailoredProfile.fullName}</h2>
                    <div className="flex justify-center gap-x-3 text-[10px] text-slate-800">
                        {tailoredProfile.email && <span>{tailoredProfile.email}</span>}
                        {tailoredProfile.phone && <span>{tailoredProfile.phone}</span>}
                        {tailoredProfile.location && <span>{tailoredProfile.location}</span>}
                    </div>
                    <div className="flex justify-center gap-x-3 text-[9px] text-slate-600">
                        {tailoredProfile.linkedinUrl && <span>LinkedIn: {tailoredProfile.linkedinUrl}</span>}
                        {tailoredProfile.githubUrl && <span>GitHub: {tailoredProfile.githubUrl}</span>}
                        {tailoredProfile.portfolioUrl && <span>Portfolio: {tailoredProfile.portfolioUrl}</span>}
                    </div>
                </div>

                {/* Summary */}
                {tailoredProfile.professionalSummary && (
                    <div className="space-y-1 mt-3">
                        <h3 className="text-[11px] font-bold uppercase border-b pb-0.5 tracking-wider">Professional Summary</h3>
                        <p className="text-[10px] text-slate-900">{tailoredProfile.professionalSummary}</p>
                    </div>
                )}

                {/* Skills */}
                {tailoredProfile.skills && tailoredProfile.skills.length > 0 && (
                    <div className="space-y-1 mt-3">
                        <h3 className="text-[11px] font-bold uppercase border-b pb-0.5 tracking-wider">Skills</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-slate-950">
                            {tailoredProfile.skills.map((skill, idx) => (
                                <span key={idx}>{skill}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Experience */}
                {tailoredProfile.workExperiences && tailoredProfile.workExperiences.length > 0 && (
                    <div className="space-y-2 mt-3">
                        <h3 className="text-[11px] font-bold uppercase border-b pb-0.5 tracking-wider">Professional Experience</h3>
                        <div className="space-y-2">
                            {tailoredProfile.workExperiences.map((exp, idx) => (
                                <div key={idx} className="space-y-0.5">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span>{exp.title} - {exp.company}</span>
                                        <span className="text-slate-600 font-normal">{exp.startDate} - {exp.endDate || (exp.isCurrent ? "Present" : "")}</span>
                                    </div>
                                    {exp.location && <div className="text-[9px] text-slate-500 italic">{exp.location}</div>}
                                    <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-900 font-serif">
                                        {exp.responsibilities.map((resp, bulletIdx) => (
                                            <li key={bulletIdx}>{resp}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {tailoredProfile.projects && tailoredProfile.projects.length > 0 && (
                    <div className="space-y-2 mt-3">
                        <h3 className="text-[11px] font-bold uppercase border-b pb-0.5 tracking-wider">Projects</h3>
                        <div className="space-y-1.5">
                            {tailoredProfile.projects.map((proj, idx) => (
                                <div key={idx} className="space-y-0.5">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span>{proj.name}</span>
                                        {proj.url && <span className="text-slate-600 font-normal text-[9px]">{proj.url}</span>}
                                    </div>
                                    <p className="text-[10px] text-slate-900">{proj.description}</p>
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <div className="text-[9px] text-slate-600 font-medium font-serif">
                                            Technologies: {proj.technologies.join(", ")}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education */}
                {tailoredProfile.education && tailoredProfile.education.length > 0 && (
                    <div className="space-y-2 mt-3">
                        <h3 className="text-[11px] font-bold uppercase border-b pb-0.5 tracking-wider">Education</h3>
                        <div className="space-y-1.5">
                            {tailoredProfile.education.map((edu, idx) => (
                                <div key={idx} className="flex justify-between text-[10px]">
                                    <div>
                                        <span className="font-bold">{edu.institution}</span>
                                        <span className="text-slate-800"> — {edu.degree} in {edu.fieldOfStudy}</span>
                                    </div>
                                    <div className="text-slate-600 text-right">
                                        <div>{edu.startDate} - {edu.endDate}</div>
                                        {edu.gpa && <div className="text-[9px]">GPA: {edu.gpa}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Certifications */}
                {tailoredProfile.certifications && tailoredProfile.certifications.length > 0 && (
                    <div className="space-y-1.5 mt-3">
                        <h3 className="text-[11px] font-bold uppercase border-b pb-0.5 tracking-wider">Certifications</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
                            {tailoredProfile.certifications.map((cert, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <span>{cert.name} - {cert.issuer}</span>
                                    <span className="text-slate-600">{cert.issuedOn}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
