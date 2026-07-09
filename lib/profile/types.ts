export type WorkExperienceForm = {
  id?: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: string[];
};

export type EducationForm = {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa: string;
};

export type ProjectForm = {
  id?: string;
  name: string;
  description: string;
  url: string;
  technologies: string[];
};

export type CertificationForm = {
  id?: string;
  name: string;
  issuer: string;
  issuedOn: string;
  url: string;
};

export type ProfileLinkForm = {
  id?: string;
  label: string;
  url: string;
};

export type UserProfileFormData = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  professionalSummary: string;
  skills: string[];
  workExperiences: WorkExperienceForm[];
  education: EducationForm[];
  projects: ProjectForm[];
  certifications: CertificationForm[];
  links: ProfileLinkForm[];
};

export type ParsedResume = {
  profile: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl: string;
    githubUrl: string;
    portfolioUrl: string;
  };
  professionalSummary: string;
  skills: string[];
  workExperience: Array<{
    company: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    responsibilities: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    gpa: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    url: string;
    technologies: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issuedOn: string;
    url: string;
  }>;
  links: Array<{
    label: string;
    url: string;
  }>;
};

export type ResumeRecord = {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  parseStatus: string;
  parsedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
};

export type OnboardingStatus = {
  needsOnboarding: boolean;
};

export function emptyProfile(email = "", fullName = ""): UserProfileFormData {
  return {
    fullName,
    email,
    phone: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    professionalSummary: "",
    skills: [],
    workExperiences: [],
    education: [],
    projects: [],
    certifications: [],
    links: [],
  };
}

export function parsedResumeToFormData(
  parsed: ParsedResume,
  fallbackEmail: string,
  fallbackName: string
): UserProfileFormData {
  return {
    fullName: parsed.profile.fullName || fallbackName,
    email: parsed.profile.email || fallbackEmail,
    phone: parsed.profile.phone || "",
    location: parsed.profile.location || "",
    linkedinUrl: parsed.profile.linkedinUrl || "",
    githubUrl: parsed.profile.githubUrl || "",
    portfolioUrl: parsed.profile.portfolioUrl || "",
    professionalSummary: parsed.professionalSummary || "",
    skills: parsed.skills ?? [],
    workExperiences: (parsed.workExperience ?? []).map((item) => ({
      company: item.company || "",
      title: item.title || "",
      location: item.location || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      isCurrent: item.isCurrent ?? false,
      responsibilities: item.responsibilities ?? [],
    })),
    education: (parsed.education ?? []).map((item) => ({
      institution: item.institution || "",
      degree: item.degree || "",
      fieldOfStudy: item.fieldOfStudy || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      gpa: item.gpa || "",
    })),
    projects: (parsed.projects ?? []).map((item) => ({
      name: item.name || "",
      description: item.description || "",
      url: item.url || "",
      technologies: item.technologies ?? [],
    })),
    certifications: (parsed.certifications ?? []).map((item) => ({
      name: item.name || "",
      issuer: item.issuer || "",
      issuedOn: item.issuedOn || "",
      url: item.url || "",
    })),
    links: (parsed.links ?? []).map((item) => ({
      label: item.label || "",
      url: item.url || "",
    })),
  };
}
