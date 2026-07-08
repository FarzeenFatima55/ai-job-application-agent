import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getDashboardUser } from "@/lib/dashboard/get-user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getDashboardUser();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
