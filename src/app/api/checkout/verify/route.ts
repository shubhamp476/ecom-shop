import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { success: false, error: "Missing required Razorpay payment parameters" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Test / simulated order bypass
    if (razorpay_order_id.startsWith("order_sim_") || !keySecret) {
      return NextResponse.json({
        success: true,
        verified: true,
        simulated: true,
        message: "Payment successfully verified in simulation mode.",
      });
    }

    // Live verification
    if (!razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing razorpay_signature for live verification" },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { success: false, error: "Payment verification failed. Invalid signature." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Payment successfully verified.",
    });
  } catch (error: any) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}

