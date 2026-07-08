"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Progress,
} from "@/components/ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { mainNav, settingsNav, dashboardHomePath } from "@/lib/dashboard/navigation";
import type { DashboardUser } from "@/lib/dashboard/get-user";
import { cn } from "@/lib/utils";

type CreditsInfo = {
  used: number;
  total: number;
};

type AppSidebarProps = {
  user: DashboardUser;
  credits: CreditsInfo;
};

export function AppSidebar({ user, credits }: AppSidebarProps) {
  const pathname = usePathname();
  const creditsPercent = Math.round((credits.used / credits.total) * 100);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href={dashboardHomePath} />}
              tooltip="Rolefit AI"
              className="hover:bg-transparent active:bg-transparent"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                RF
              </span>
              <span className="truncate font-semibold">Rolefit AI</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "transition-colors",
                        isActive
                          ? "border-l-2 border-primary bg-accent font-medium text-accent-foreground hover:bg-accent"
                          : "border-l-2 border-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup className="group-data-[collapsible=icon]:px-0">
          <SidebarGroupContent>
            <div className="space-y-3 rounded-lg border border-border bg-card p-3 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Billing / Credits
                </span>
                <Badge
                  variant="outline"
                  className="border-border bg-accent text-[0.625rem] text-accent-foreground"
                >
                  Pro — Coming Soon
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-foreground">
                  {credits.used}/{credits.total} free applications used
                </p>
                <Progress value={creditsPercent} className="gap-0" />
              </div>
            </div>

            <SidebarSeparator className="my-2 group-data-[collapsible=icon]:hidden" />

            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  render={<Link href={settingsNav.href} />}
                  isActive={pathname === settingsNav.href}
                  tooltip={settingsNav.title}
                  className={cn(
                    "transition-colors",
                    pathname === settingsNav.href
                      ? "border-l-2 border-primary bg-accent font-medium text-accent-foreground hover:bg-accent"
                      : "border-l-2 border-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Avatar size="sm" className="size-7">
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                    ) : null}
                    <AvatarFallback className="bg-accent text-[0.625rem] font-medium text-accent-foreground">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-xs font-medium">
                      {user.fullName}
                    </span>
                    <span className="truncate text-[0.625rem] text-muted-foreground">
                      Profile Settings
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
