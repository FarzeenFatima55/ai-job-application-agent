import {
  Briefcase01Icon,
  File01Icon,
  Settings01Icon,
  TaskDone01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";

export type NavItem = {
  title: string;
  href: string;
  icon: typeof Briefcase01Icon;
};

export const dashboardHomePath = "/dashboard/jobs";

export const mainNav: NavItem[] = [
  {
    title: "Jobs",
    href: "/dashboard/jobs",
    icon: Briefcase01Icon,
  },
  {
    title: "Resume",
    href: "/dashboard/resume",
    icon: File01Icon,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: UserCircleIcon,
  },
  {
    title: "Application Status",
    href: "/dashboard/application-status",
    icon: TaskDone01Icon,
  },
];

export const settingsNav: NavItem = {
  title: "Profile Settings",
  href: "/dashboard/settings",
  icon: Settings01Icon,
};
