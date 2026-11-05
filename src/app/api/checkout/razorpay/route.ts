import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", receipt, notes = {} } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid order amount" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // In paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100);

    // If real Razorpay keys are provided, create official Razorpay order
    if (keyId && keySecret && !keyId.includes("placeholder")) {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency,
        receipt: receipt || `order_rcpt_${Date.now()}`,
        notes,
      });

      return NextResponse.json({
        success: true,
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key: keyId,
        isMock: false,
      });
    }

    // Fallback: If credentials are not yet configured, provide seamless test mode order
    const mockOrderId = `order_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return NextResponse.json({
      success: true,
      orderId: mockOrderId,
      amount: amountInPaise,
      currency,
      key: keyId || "rzp_test_placeholder",
      isMock: true,
      message: "Razorpay test mode: Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local to use live Razorpay gateway.",
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to create Razorpay order",
      },
      { status: 500 }
    );
  }
}

