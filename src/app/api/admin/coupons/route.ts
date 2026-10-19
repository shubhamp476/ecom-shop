import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Coupon, ICoupon } from "@/models/Coupon";
import { adminStore } from "@/lib/admin-store";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    let coupons: ICoupon[] = adminStore.coupons;

    if (conn) {
      try {
        const dbCoupons = await Coupon.find({}).lean();
        if (dbCoupons && dbCoupons.length > 0) coupons = dbCoupons as any;
      } catch (e) {}
    }

    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load coupons" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.code || !body.discountValue) {
      return NextResponse.json({ success: false, error: "Code and discount value required" }, { status: 400 });
    }

    const newCoupon: ICoupon = {
      code: body.code.toUpperCase(),
      description: body.description || "",
      discountType: body.discountType || "percentage",
      discountValue: Number(body.discountValue),
      minOrderValue: Number(body.minOrderValue) || 0,
      maxDiscountAmount: body.maxDiscountAmount ? Number(body.maxDiscountAmount) : undefined,
      usageLimit: Number(body.usageLimit) || 500,
      usedCount: 0,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : new Date(Date.now() + 30 * 24 * 3600 * 1000),
      status: "Active",
      createdAt: new Date(),
    };

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Coupon.create(newCoupon);
      } catch (e) {}
    }

    adminStore.coupons.unshift(newCoupon);

    adminStore.activityLogs.unshift({
      actor: "Super Admin",
      role: "Pricing Manager",
      action: "COUPON_CREATED",
      entity: "Coupon",
      entityId: newCoupon.code,
      details: `Created promotional coupon code "${newCoupon.code}" (${newCoupon.discountValue}${newCoupon.discountType === "percentage" ? "%" : "₹"}).`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create coupon" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, status, discountValue, usageLimit } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: "Coupon code is required" }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Coupon.findOneAndUpdate(
          { code: code.toUpperCase() },
          {
            $set: {
              ...(status && { status }),
              ...(discountValue !== undefined && { discountValue: Number(discountValue) }),
              ...(usageLimit !== undefined && { usageLimit: Number(usageLimit) }),
            },
          }
        );
      } catch (e) {}
    }

    const coupon = adminStore.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (coupon) {
      if (status) coupon.status = status;
      if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
      if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);
    }

    adminStore.activityLogs.unshift({
      actor: "Pricing Manager",
      role: "Super Admin",
      action: "COUPON_UPDATED",
      entity: "Coupon",
      entityId: code.toUpperCase(),
      details: `Updated promotional coupon "${code.toUpperCase()}" status to "${status || coupon?.status}".`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, message: `Coupon ${code.toUpperCase()} updated.`, coupon });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update coupon" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ success: false, error: "Coupon code is required" }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Coupon.findOneAndDelete({ code: code.toUpperCase() });
      } catch (e) {}
    }

    adminStore.coupons = adminStore.coupons.filter(
      (c) => c.code.toUpperCase() !== code.toUpperCase()
    );

    adminStore.activityLogs.unshift({
      actor: "Pricing Manager",
      role: "Super Admin",
      action: "COUPON_DELETED",
      entity: "Coupon",
      entityId: code.toUpperCase(),
      details: `Deleted promotional coupon code "${code.toUpperCase()}".`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, message: `Coupon ${code.toUpperCase()} removed.` });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
