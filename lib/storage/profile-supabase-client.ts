"use client";

import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "./profile-supabase";

/**
 * Get user profile from Supabase (client-side)
 * Use this in client components
 */
export async function getUserProfileClient(): Promise<UserProfile | null> {
  const supabase = createClient();
  
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
