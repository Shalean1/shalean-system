import { NextRequest, NextResponse } from "next/server";
import { verifyEFTPaymentAction } from "@/app/actions/credits";

/**
 * Admin API to verify/reject EFT payments
 * POST /api/admin/eft/verify
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, approved, rejectionReason } = body;

    if (!submissionId || typeof approved !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Missing required fields: submissionId, approved" },
        { status: 400 }
      );
    }

    // TODO: Add admin role check here
    // For now, this is a placeholder - you'll need to implement admin authentication
    // Example:
    // const supabase = await createClient();
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user || !isAdmin(user.id)) {
    //   return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    // }

    const result = await verifyEFTPaymentAction(
      submissionId,
      approved,
      rejectionReason
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error verifying EFT payment:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Get pending EFT submissions (admin)
 * GET /api/admin/eft/pending
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin role check here
    const { getPendingEFTSubmissions } = await import("@/lib/storage/eft-supabase");

    const submissions = await getPendingEFTSubmissions();

    return NextResponse.json({
      success: true,
      submissions,
    });
  } catch (error) {
    console.error("Error fetching pending EFT submissions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}









