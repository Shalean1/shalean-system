import { createClient } from "@/lib/supabase/server";

export interface Pageview {
  id: string;
  userId?: string;
  userEmail: string;
  pagePath: string;
  pageTitle?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
}

/**
 * Track a pageview
 */
export async function trackPageview(
  pagePath: string,
  pageTitle?: string,
  referrer?: string
): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const pageviewData: any = {
    user_email: user?.email || "anonymous",
    page_path: pagePath,
    page_title: pageTitle,
    referrer: referrer || null,
  };

  if (user) {
    pageviewData.user_id = user.id;
  }

  const { error } = await supabase
    .from("pageviews")
    .insert(pageviewData);

  if (error) {
    // Don't throw - pageview tracking shouldn't break the app
    console.error("Failed to track pageview:", error.message);
  }
}

/**
 * Get total pageviews for current user
 */
export async function getUserPageviewCount(): Promise<number> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return 0;
  }

  const { count, error } = await supabase
    .from("pageviews")
    .select("*", { count: "exact", head: true })
    .or(`user_id.eq.${user.id},user_email.eq.${user.email}`);

  if (error) {
    console.error("Failed to fetch pageview count:", error.message);
    return 0;
  }

  return count || 0;
}

/**
 * Get pageviews for current user
 */
export async function getUserPageviews(limit: number = 50): Promise<Pageview[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("pageviews")
    .select("*")
    .or(`user_id.eq.${user.id},user_email.eq.${user.email}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch pageviews:", error.message);
    return [];
  }

  return (data || []).map(mapDatabaseToPageview);
}

/**
 * Map database record to Pageview type
 */
function mapDatabaseToPageview(data: any): Pageview {
  return {
    id: data.id,
    userId: data.user_id,
    userEmail: data.user_email,
    pagePath: data.page_path,
    pageTitle: data.page_title,
    referrer: data.referrer,
    userAgent: data.user_agent,
    ipAddress: data.ip_address,
    createdAt: data.created_at,
  };
}










