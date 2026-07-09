import { getSessionUser } from "@/lib/auth/get-session-user";
import { getUserJobs } from "@/lib/jobs/queries";
import { JobForm } from "@/components/jobs/job-form";
import { JobsList } from "@/components/jobs/jobs-list";

export default async function JobsPage() {
  const sessionUser = await getSessionUser();
  const jobs = await getUserJobs(sessionUser.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Jobs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste a job posting to see your match score and get a tailored resume.
        </p>
      </div>

      <JobForm />

      <div>
        <h2 className="mb-3 text-sm font-medium text-foreground">Your jobs</h2>
        <JobsList jobs={jobs} />
      </div>
    </div>
  );
}