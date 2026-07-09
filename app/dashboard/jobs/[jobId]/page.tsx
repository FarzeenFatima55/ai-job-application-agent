import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { getJobWithLatestResume } from "@/lib/jobs/queries";
import { getUserProfile } from "@/lib/profile/queries";
import { JobDetailClient } from "@/components/jobs/job-detail-client";

type Params = Promise<{ jobId: string }>;

export default async function JobDetailPage(props: { params: Params }) {
  const { jobId } = await props.params;
  const sessionUser = await getSessionUser();
  const { job, tailoredResumeId, changes, analysis } = await getJobWithLatestResume(jobId);

  if (!job) {
    notFound();
  }

  const profile = await getUserProfile(
    sessionUser.id,
    sessionUser.email,
    sessionUser.fullName
  );

  return (
    <JobDetailClient
      job={job}
      profile={profile}
      initialChanges={changes}
      initialAnalysis={analysis}
      tailoredResumeId={tailoredResumeId}
    />
  );
}
