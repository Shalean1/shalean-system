import { NextRequest, NextResponse } from "next/server";
import { trackPageview } from "@/lib/storage/pageviews-supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pagePath, pageTitle, referrer } = body;

    if (!pagePath) {
      return NextResponse.json(
        { error: "pagePath is required" },
        { status: 400 }
      );
    }

    await trackPageview(pagePath, pageTitle, referrer);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking pageview:", error);
    return NextResponse.json(
      { error: "Failed to track pageview" },
      { status: 500 }
    );
  }
}




















