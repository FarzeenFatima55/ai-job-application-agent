"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Cancel01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import {
  User,
  FileText,
  Sparkles,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
} from "lucide-react";

import { saveProfile } from "@/lib/profile/actions";
import type { UserProfileFormData } from "@/lib/profile/types";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProfileFormProps = {
  initialData: UserProfileFormData;
};

const TABS = [
  { id: "personal", label: "Personal", icon: User },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "skills", label: "Skills", icon: Sparkles },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "certifications", label: "Certifications", icon: Award },
] as const;

function computeCompletion(profile: UserProfileFormData) {
  const personalFields = [
    profile.fullName,
    profile.phone,
    profile.location,
    profile.linkedinUrl,
    profile.githubUrl,
    profile.portfolioUrl,
  ];
  const personal = Math.round(
    (personalFields.filter(Boolean).length / personalFields.length) * 100
  );
  const summary = profile.professionalSummary?.trim() ? 100 : 0;
  const skills = Math.min(100, profile.skills.filter(Boolean).length * 20);
  const experience = profile.workExperiences.length
    ? Math.round(
      (profile.workExperiences.filter(
        (e) => e.company && e.title && e.startDate
      ).length /
        profile.workExperiences.length) *
      100
    )
    : 0;
  const education = profile.education.length
    ? Math.round(
      (profile.education.filter((e) => e.institution && e.degree).length /
        profile.education.length) *
      100
    )
    : 0;
  const projects = profile.projects.length
    ? Math.round(
      (profile.projects.filter((p) => p.name && p.description).length /
        profile.projects.length) *
      100
    )
    : 0;
  const certifications = profile.certifications.length
    ? Math.round(
      (profile.certifications.filter((c) => c.name && c.issuer).length /
        profile.certifications.length) *
      100
    )
    : 0;

  const sections = { personal, summary, skills, experience, education, projects, certifications };
  const overall = Math.round(
    Object.values(sections).reduce((a, b) => a + b, 0) / Object.keys(sections).length
  );

  return { sections, overall };
}

function ProgressRing({ value }: { value: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.6s ease",
            filter: "drop-shadow(0 0 6px color-mix(in srgb, var(--primary) 55%, transparent))",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-semibold text-foreground">{value}%</span>
        <span className="text-[11px] text-muted-foreground">Complete</span>
      </div>
    </div>
  );
}

function SectionBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-foreground/90">{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            background: "var(--primary)",
            boxShadow: "0 0 8px color-mix(in srgb, var(--primary) 60%, transparent)",
          }}
        />
      </div>
    </div>
  );
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [profile, setProfile] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<string>("personal");

  const { sections, overall } = useMemo(() => computeCompletion(profile), [profile]);

  const updateField = <K extends keyof UserProfileFormData>(
    key: K,
    value: UserProfileFormData[K]
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveProfile(JSON.stringify(profile));
      if (result.success) {
        toast.success("Profile saved successfully.");
      } else {
        toast.error(result.error ?? "Failed to save profile.");
      }
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and edit the information extracted from your resume.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Completion sidebar card */}
        <div className="h-fit rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-foreground">Profile completeness</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {overall >= 90
              ? "Almost there — fill in a few more details to stand out."
              : "Keep going — the more you add, the stronger your profile."}
          </p>

          <div className="my-6 flex justify-center">
            <ProgressRing value={overall} />
          </div>

          {overall >= 70 && (
            <div className="mb-6 flex items-center justify-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--primary)_18%,transparent)] px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Strong profile
            </div>
          )}

          <div className="space-y-4">
            <SectionBar label="Personal info" value={sections.personal} />
            <SectionBar label="Summary" value={sections.summary} />
            <SectionBar label="Skills" value={sections.skills} />
            <SectionBar label="Experience" value={sections.experience} />
            <SectionBar label="Education" value={sections.education} />
            <SectionBar label="Projects" value={sections.projects} />
            <SectionBar label="Certifications" value={sections.certifications} />
          </div>
        </div>

        {/* Main tabbed panel */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 flex w-full flex-wrap justify-start gap-1 bg-transparent p-0">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_10px_color-mix(in_srgb,var(--primary)_50%,transparent)]"
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="personal">
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                    <Input
                      id="fullName"
                      value={profile.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" value={profile.email} readOnly disabled />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="phone">Phone</FieldLabel>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="location">Location</FieldLabel>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => updateField("location", e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="linkedin">LinkedIn URL</FieldLabel>
                    <Input
                      id="linkedin"
                      value={profile.linkedinUrl}
                      onChange={(e) => updateField("linkedinUrl", e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="github">GitHub URL</FieldLabel>
                    <Input
                      id="github"
                      value={profile.githubUrl}
                      onChange={(e) => updateField("githubUrl", e.target.value)}
                    />
                  </Field>
                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor="portfolio">Portfolio URL</FieldLabel>
                    <Input
                      id="portfolio"
                      value={profile.portfolioUrl}
                      onChange={(e) => updateField("portfolioUrl", e.target.value)}
                    />
                  </Field>
                </div>
              </FieldGroup>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} disabled={isPending}>
                  {isPending ? (
                    <>
                      <Spinner className="mr-2" />
                      Saving…
                    </>
                  ) : (
                    "Save personal info"
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="summary">
              <Field>
                <FieldLabel htmlFor="summary">Professional summary</FieldLabel>
                <Textarea
                  id="summary"
                  rows={6}
                  value={profile.professionalSummary}
                  onChange={(e) => updateField("professionalSummary", e.target.value)}
                  placeholder="Brief summary of your experience and goals…"
                />
              </Field>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} disabled={isPending}>
                  {isPending ? <Spinner className="mr-2" /> : null}
                  Save summary
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="skills">
              <div className="mb-4 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateField("skills", [...profile.skills, ""])}
                >
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
                  Add skill
                </Button>
              </div>
              <FieldGroup>
                {profile.skills.length === 0 && (
                  <p className="text-sm text-muted-foreground">No skills added yet.</p>
                )}
                {profile.skills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={skill}
                      placeholder="e.g. TypeScript"
                      onChange={(e) => {
                        const next = [...profile.skills];
                        next[index] = e.target.value;
                        updateField("skills", next);
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        updateField("skills", profile.skills.filter((_, i) => i !== index))
                      }
                    >
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                    </Button>
                  </div>
                ))}
              </FieldGroup>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} disabled={isPending}>
                  {isPending ? <Spinner className="mr-2" /> : null}
                  Save skills
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="experience">
              <div className="mb-4 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateField("workExperiences", [
                      ...profile.workExperiences,
                      {
                        company: "",
                        title: "",
                        location: "",
                        startDate: "",
                        endDate: "",
                        isCurrent: false,
                        responsibilities: [""],
                      },
                    ])
                  }
                >
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
                  Add experience
                </Button>
              </div>
              <div className="space-y-6">
                {profile.workExperiences.length === 0 && (
                  <p className="text-sm text-muted-foreground">No work experience added yet.</p>
                )}
                {profile.workExperiences.map((exp, expIndex) => (
                  <FieldSet key={expIndex} className="rounded-lg border border-border p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <FieldLegend>Experience {expIndex + 1}</FieldLegend>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          updateField(
                            "workExperiences",
                            profile.workExperiences.filter((_, i) => i !== expIndex)
                          )
                        }
                      >
                        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                      </Button>
                    </div>
                    <FieldGroup>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                          <FieldLabel>Company</FieldLabel>
                          <Input
                            value={exp.company}
                            onChange={(e) => {
                              const next = [...profile.workExperiences];
                              next[expIndex] = { ...exp, company: e.target.value };
                              updateField("workExperiences", next);
                            }}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Job title</FieldLabel>
                          <Input
                            value={exp.title}
                            onChange={(e) => {
                              const next = [...profile.workExperiences];
                              next[expIndex] = { ...exp, title: e.target.value };
                              updateField("workExperiences", next);
                            }}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Location</FieldLabel>
                          <Input
                            value={exp.location}
                            onChange={(e) => {
                              const next = [...profile.workExperiences];
                              next[expIndex] = { ...exp, location: e.target.value };
                              updateField("workExperiences", next);
                            }}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Start date</FieldLabel>
                          <Input
                            value={exp.startDate}
                            placeholder="Jan 2020"
                            onChange={(e) => {
                              const next = [...profile.workExperiences];
                              next[expIndex] = { ...exp, startDate: e.target.value };
                              updateField("workExperiences", next);
                            }}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>End date</FieldLabel>
                          <Input
                            value={exp.endDate}
                            placeholder="Present"
                            disabled={exp.isCurrent}
                            onChange={(e) => {
                              const next = [...profile.workExperiences];
                              next[expIndex] = { ...exp, endDate: e.target.value };
                              updateField("workExperiences", next);
                            }}
                          />
                        </Field>
                        <Field orientation="horizontal">
                          <input
                            type="checkbox"
                            checked={exp.isCurrent}
                            onChange={(e) => {
                              const next = [...profile.workExperiences];
                              next[expIndex] = {
                                ...exp,
                                isCurrent: e.target.checked,
                                endDate: e.target.checked ? "" : exp.endDate,
                              };
                              updateField("workExperiences", next);
                            }}
                          />
                          <FieldLabel>Currently working here</FieldLabel>
                        </Field>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <FieldLabel>Responsibilities</FieldLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const next = [...profile.workExperiences];
                              next[expIndex] = {
                                ...exp,
                                responsibilities: [...exp.responsibilities, ""],
                              };
                              updateField("workExperiences", next);
                            }}
                          >
                            Add bullet
                          </Button>
                        </div>
                        {exp.responsibilities.map((bullet, bulletIndex) => (
                          <div key={bulletIndex} className="flex gap-2">
                            <Input
                              value={bullet}
                              placeholder="Describe an achievement or responsibility"
                              onChange={(e) => {
                                const next = [...profile.workExperiences];
                                const responsibilities = [...exp.responsibilities];
                                responsibilities[bulletIndex] = e.target.value;
                                next[expIndex] = { ...exp, responsibilities };
                                updateField("workExperiences", next);
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => {
                                const next = [...profile.workExperiences];
                                next[expIndex] = {
                                  ...exp,
                                  responsibilities: exp.responsibilities.filter(
                                    (_, i) => i !== bulletIndex
                                  ),
                                };
                                updateField("workExperiences", next);
                              }}
                            >
                              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </FieldGroup>
                  </FieldSet>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} disabled={isPending}>
                  {isPending ? <Spinner className="mr-2" /> : null}
                  Save experience
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="education">
              <div className="mb-4 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateField("education", [
                      ...profile.education,
                      {
                        institution: "",
                        degree: "",
                        fieldOfStudy: "",
                        startDate: "",
                        endDate: "",
                        gpa: "",
                      },
                    ])
                  }
                >
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
                  Add education
                </Button>
              </div>
              <div className="space-y-6">
                {profile.education.length === 0 && (
                  <p className="text-sm text-muted-foreground">No education entries yet.</p>
                )}
                {profile.education.map((edu, eduIndex) => (
                  <FieldSet key={eduIndex} className="rounded-lg border border-border p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <FieldLegend>Education {eduIndex + 1}</FieldLegend>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          updateField(
                            "education",
                            profile.education.filter((_, i) => i !== eduIndex)
                          )
                        }
                      >
                        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                      </Button>
                    </div>
                    <FieldGroup>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field className="sm:col-span-2">
                          <FieldLabel>Institution</FieldLabel>
                          <Input
                            value={edu.institution}
                            onChange={(e) => {
                              const next = [...profile.education];
                              next[eduIndex] = { ...edu, institution: e.target.value };
                              updateField("education", next);
                            }}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Degree</FieldLabel>
                          <Input
                            value={edu.degree}
                            onChange={(e) => {
                              const next = [...profile.education];
                              next[eduIndex] = { ...edu, degree: e.target.value };
                              updateField("education", next);
                            }}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Field of study</FieldLabel>
                          <Input
                            value={edu.fieldOfStudy}
                            onChange={(e) => {
                              const next = [...profile.education];
                              next[eduIndex] = { ...edu, fieldOfStudy: e.target.value };
                              updateField("education", next);
                            }}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Start date</FieldLabel>
                          <Input
                            value={edu.startDate}
                            onChange={(e) => {
                              const next = [...profile.education];
                              next[eduIndex] = { ...edu, startDate: e.target.value };
                              updateField("education", next);
                            }}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>End date</FieldLabel>
                          <Input
                            value={edu.endDate}
                            onChange={(e) => {
                              const next = [...profile.education];
                              next[eduIndex] = { ...edu, endDate: e.target.value };
                              updateField("education", next);
                            }}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>GPA</FieldLabel>
                          <Input
                            value={edu.gpa}
                            onChange={(e) => {
                              const next = [...profile.education];
                              next[eduIndex] = { ...edu, gpa: e.target.value };
                              updateField("education", next);
                            }}
                          />
                        </Field>
                      </div>
                    </FieldGroup>
                  </FieldSet>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} disabled={isPending}>
                  {isPending ? <Spinner className="mr-2" /> : null}
                  Save education
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="projects">
              <div className="mb-4 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateField("projects", [
                      ...profile.projects,
                      { name: "", description: "", url: "", technologies: [] },
                    ])
                  }
                >
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
                  Add project
                </Button>
              </div>
              <div className="space-y-6">
                {profile.projects.map((project, projectIndex) => (
                  <FieldSet key={projectIndex} className="rounded-lg border border-border p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <FieldLegend>Project {projectIndex + 1}</FieldLegend>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          updateField(
                            "projects",
                            profile.projects.filter((_, i) => i !== projectIndex)
                          )
                        }
                      >
                        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                      </Button>
                    </div>
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Name</FieldLabel>
                        <Input
                          value={project.name}
                          onChange={(e) => {
                            const next = [...profile.projects];
                            next[projectIndex] = { ...project, name: e.target.value };
                            updateField("projects", next);
                          }}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Description</FieldLabel>
                        <Textarea
                          rows={3}
                          value={project.description}
                          onChange={(e) => {
                            const next = [...profile.projects];
                            next[projectIndex] = { ...project, description: e.target.value };
                            updateField("projects", next);
                          }}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>URL</FieldLabel>
                        <Input
                          value={project.url}
                          onChange={(e) => {
                            const next = [...profile.projects];
                            next[projectIndex] = { ...project, url: e.target.value };
                            updateField("projects", next);
                          }}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Technologies (comma-separated)</FieldLabel>
                        <Input
                          value={project.technologies.join(", ")}
                          onChange={(e) => {
                            const next = [...profile.projects];
                            next[projectIndex] = {
                              ...project,
                              technologies: e.target.value
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean),
                            };
                            updateField("projects", next);
                          }}
                        />
                      </Field>
                    </FieldGroup>
                  </FieldSet>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} disabled={isPending}>
                  {isPending ? <Spinner className="mr-2" /> : null}
                  Save projects
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="certifications">
              <div className="mb-4 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateField("certifications", [
                      ...profile.certifications,
                      { name: "", issuer: "", issuedOn: "", url: "" },
                    ])
                  }
                >
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
                  Add certification
                </Button>
              </div>
              <div className="space-y-6">
                {profile.certifications.map((cert, certIndex) => (
                  <FieldSet key={certIndex} className="rounded-lg border border-border p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <FieldLegend>Certification {certIndex + 1}</FieldLegend>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          updateField(
                            "certifications",
                            profile.certifications.filter((_, i) => i !== certIndex)
                          )
                        }
                      >
                        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                      </Button>
                    </div>
                    <FieldGroup>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                          <FieldLabel>Name</FieldLabel>
                          <Input
                            value={cert.name}
                            onChange={(e) => {
                              const next = [...profile.certifications];
                              next[certIndex] = { ...cert, name: e.target.value };
                              updateField("certifications", next);
                            }}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Issuer</FieldLabel>
                          <Input
                            value={cert.issuer}
                            onChange={(e) => {
                              const next = [...profile.certifications];
                              next[certIndex] = { ...cert, issuer: e.target.value };
                              updateField("certifications", next);
                            }}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Date</FieldLabel>
                          <Input
                            value={cert.issuedOn}
                            onChange={(e) => {
                              const next = [...profile.certifications];
                              next[certIndex] = { ...cert, issuedOn: e.target.value };
                              updateField("certifications", next);
                            }}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>URL</FieldLabel>
                          <Input
                            value={cert.url}
                            onChange={(e) => {
                              const next = [...profile.certifications];
                              next[certIndex] = { ...cert, url: e.target.value };
                              updateField("certifications", next);
                            }}
                          />
                        </Field>
                      </div>
                    </FieldGroup>
                  </FieldSet>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} disabled={isPending}>
                  {isPending ? <Spinner className="mr-2" /> : null}
                  Save certifications
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}