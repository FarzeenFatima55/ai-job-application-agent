"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsCompact } from "@/hooks/use-is-compact";
import type { DashboardUser } from "@/lib/dashboard/get-user";

import { AppSidebar } from "./app-sidebar";

type DashboardShellProps = {
  user: DashboardUser;
  children: React.ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  const isCompact = useIsCompact();

  return (
    <SidebarProvider
      key={isCompact ? "compact" : "wide"}
      defaultOpen={!isCompact}
    >
      <TooltipProvider delay={0}>
        <AppSidebar user={user} credits={{ used: 3, total: 5 }} />
        <SidebarInset className="bg-background">
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 lg:px-6">
            <SidebarTrigger />
          </header>
          <div className="flex-1 p-6 lg:p-8">{children}</div>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  );
}
