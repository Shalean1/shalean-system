import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/storage/profile-supabase";
import ProfileForm from "@/components/dashboard/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getUserProfile();

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Account Settings
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Manage your profile information and account preferences
          </p>
        </div>

        {/* Profile Form */}
        <ProfileForm initialProfile={profile} userEmail={user.email || ""} />
      </div>
    </div>
  );
}
