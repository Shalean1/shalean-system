import { NextRequest, NextResponse } from "next/server";
import { generateMonthlyBookingsFromSchedules } from "@/app/actions/generate-monthly-bookings";

/**
 * API route to generate monthly bookings from recurring schedules
 * This can be called by a cron job or scheduled task
 * 
 * Optional: Protect with a secret token by checking Authorization header
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Verify authorization token
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await generateMonthlyBookingsFromSchedules();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        generated: result.generated,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          generated: result.generated,
          errors: result.errors,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating monthly bookings:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also allow GET for testing
export async function GET(request: NextRequest) {
  return POST(request);
}

