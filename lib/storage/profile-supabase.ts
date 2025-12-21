import { createClient } from "@/lib/supabase/server";

export interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  phone: string | null;
  email: string;
  isAdmin: boolean;
}

/**
 * Get user profile from Supabase
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Try to get profile from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    firstName: profile?.first_name || null,
    lastName: profile?.last_name || null,
    fullName: profile?.full_name || user.user_metadata?.full_name || null,
    phone: profile?.phone || null,
    email: profile?.email || user.email || "",
    isAdmin: profile?.is_admin || false,
  };
}

/**
 * Get user's display name (first name, full name, or email)
 */
export async function getUserDisplayName(): Promise<string> {
  const profile = await getUserProfile();
  
  if (profile?.firstName) {
    return profile.firstName;
  }
  
  if (profile?.fullName) {
    return profile.fullName;
  }
  
  if (profile?.email) {
    return profile.email.split("@")[0];
  }
  
  return "there";
}

/**
 * Check if the current user has admin role
 */
export async function isUserAdmin(): Promise<boolean> {
  const profile = await getUserProfile();
  return profile?.isAdmin || false;
}
