import { redirect } from "next/navigation";
import { getCurrentCleaner } from "@/lib/storage/cleaner-auth-supabase";
import ShareProfileClient from "@/components/cleaner/ShareProfileClient";

export default async function ShareProfilePage() {
  const cleaner = await getCurrentCleaner();

  if (!cleaner) {
    redirect("/cleaner/login");
  }

  // Generate the profile link
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bokkiecleaning.co.za";
  const profileLink = `${baseUrl}/cleaners/${cleaner.cleanerId}`;

  return <ShareProfileClient cleaner={cleaner} profileLink={profileLink} />;
}
