import { ResumeList } from "@/components/resume/resume-list";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { getUserResumes } from "@/lib/profile/queries";

export default async function ResumePage() {
  const sessionUser = await getSessionUser();
  const resumes = await getUserResumes(sessionUser.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Resume
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage your uploaded resumes.
        </p>
      </div>
      <ResumeList resumes={resumes} />
    </div>
  );
}
