import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { getDashboardUser } from "@/lib/dashboard/get-user";
import { getOnboardingStatus } from "@/lib/profile/queries";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getSessionUser();
  const user = await getDashboardUser();
  const { needsOnboarding } = await getOnboardingStatus(sessionUser.id);

  return (
    <DashboardShell user={user} needsOnboarding={needsOnboarding}>
      {children}
    </DashboardShell>
  );
}
