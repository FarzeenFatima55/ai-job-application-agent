import { ProfileForm } from "@/components/profile/profile-form";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { getUserProfile } from "@/lib/profile/queries";

export default async function ProfilePage() {
  const sessionUser = await getSessionUser();
  const profile = await getUserProfile(
    sessionUser.id,
    sessionUser.email,
    sessionUser.fullName
  );

  return <ProfileForm initialData={profile} />;
}
