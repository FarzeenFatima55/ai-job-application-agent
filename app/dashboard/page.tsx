import { redirect } from "next/navigation";

import { dashboardHomePath } from "@/lib/dashboard/navigation";

export default function DashboardPage() {
  redirect(dashboardHomePath);
}
