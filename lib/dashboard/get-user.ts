import { createClient } from "@/lib/supabase/server";

export type DashboardUser = {
  email: string;
  fullName: string;
  avatarUrl: string | null;
  initials: string;
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export async function getDashboardUser(): Promise<DashboardUser> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const email =
    typeof claims?.email === "string" ? claims.email : "Signed-in user";

  const fullName =
    typeof claims?.user_metadata === "object" &&
    claims.user_metadata !== null &&
    "full_name" in claims.user_metadata &&
    typeof claims.user_metadata.full_name === "string"
      ? claims.user_metadata.full_name
      : email.split("@")[0];

  const avatarUrl =
    typeof claims?.user_metadata === "object" &&
    claims.user_metadata !== null &&
    "avatar_url" in claims.user_metadata &&
    typeof claims.user_metadata.avatar_url === "string"
      ? claims.user_metadata.avatar_url
      : null;

  return {
    email,
    fullName,
    avatarUrl,
    initials: getInitials(fullName) || email[0]?.toUpperCase() || "U",
  };
}
