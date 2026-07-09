import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
};

export async function getSessionUser(): Promise<SessionUser> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/sign-in");
  }

  const user = data.user;
  const email = user.email ?? "";
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : email.split("@")[0] ?? "User";

  return {
    id: user.id,
    email,
    fullName,
  };
}

export async function getOptionalSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return null;
  }

  const user = data.user;
  const email = user.email ?? "";
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : email.split("@")[0] ?? "User";

  return {
    id: user.id,
    email,
    fullName,
  };
}
