"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createJob, analyzeJobMatch } from "@/lib/jobs/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

export function JobForm() {
    const router = useRouter();
    const [company, setCompany] = useState("");
    const [roleTitle, setRoleTitle] = useState("");
    const [jdText, setJdText] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleSubmit = () => {
        if (!company || !roleTitle || !jdText.trim()) {
            toast.error("Fill in company, role, and the job description.");
            return;
        }

        startTransition(async () => {
            const created = await createJob(company, roleTitle, jdText);
            if (!created.success) {
                toast.error(created.error);
                return;
            }

            toast.success("Job saved. Analyzing match…");
            const analysis = await analyzeJobMatch(created.jobId, jdText);
            if (!analysis.success) {
                toast.error(analysis.error);
                router.push(`/dashboard/jobs/${created.jobId}`);
                return;
            }

            toast.success(`Match score: ${analysis.data.matchScore}%`);
            router.push(`/dashboard/jobs/${created.jobId}`);
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add a job</CardTitle>
            </CardHeader>
            <CardContent>
                <FieldGroup>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="company">Company</FieldLabel>
                            <Input
                                id="company"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="e.g. Primora"
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="roleTitle">Role</FieldLabel>
                            <Input
                                id="roleTitle"
                                value={roleTitle}
                                onChange={(e) => setRoleTitle(e.target.value)}
                                placeholder="e.g. Junior Full Stack Developer"
                            />
                        </Field>
                    </div>
                    <Field>
                        <FieldLabel htmlFor="jdText">Job description</FieldLabel>
                        <Textarea
                            id="jdText"
                            rows={10}
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                            placeholder="Paste the full job posting here…"
                        />
                    </Field>
                </FieldGroup>

                <div className="mt-4 flex justify-end">
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? (
                            <>
                                <Spinner className="mr-2" />
                                Analyzing…
                            </>
                        ) : (
                            "Analyze match"
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}