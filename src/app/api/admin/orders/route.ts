import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order, IOrder } from "@/models/Order";
import { adminStore } from "@/lib/admin-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const status = searchParams.get("status") || "";

    const conn = await connectToDatabase();
    let orders: IOrder[] = adminStore.orders;

    if (conn) {
      try {
        const dbOrders = await Order.find({}).sort({ createdAt: -1 }).lean();
        if (dbOrders && dbOrders.length > 0) orders = dbOrders as any;
      } catch (e) {}
    }

    let filtered = orders.filter((o) => {
      const matchSearch =
        !search ||
        o.orderNumber.toLowerCase().includes(search) ||
        o.customer.name.toLowerCase().includes(search) ||
        o.customer.email.toLowerCase().includes(search);
      const matchStatus = !status || o.fulfillmentStatus === status || o.paymentStatus === status;
      return matchSearch && matchStatus;
    });

    return NextResponse.json({ success: true, orders: filtered });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, fulfillmentStatus, paymentStatus, trackingNumber, shippingCarrier, adminNotes } = body;

    if (!orderNumber) {
      return NextResponse.json({ success: false, error: "Order number is required" }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Order.findOneAndUpdate(
          { orderNumber },
          {
            $set: {
              ...(fulfillmentStatus && { fulfillmentStatus }),
              ...(paymentStatus && { paymentStatus }),
              ...(trackingNumber && { trackingNumber }),
              ...(shippingCarrier && { shippingCarrier }),
              ...(adminNotes && { adminNotes }),
            },
          }
        );
      } catch (e) {}
    }

    const order = adminStore.orders.find((o) => o.orderNumber === orderNumber);
    if (order) {
      if (fulfillmentStatus) order.fulfillmentStatus = fulfillmentStatus;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (shippingCarrier) order.shippingCarrier = shippingCarrier;
      if (adminNotes) order.adminNotes = adminNotes;
    }

    adminStore.activityLogs.unshift({
      actor: "Order Supervisor",
      role: "Order Manager",
      action: "ORDER_UPDATED",
      entity: "Order",
      entityId: orderNumber,
      details: `Updated order #${orderNumber} fulfillment status to "${fulfillmentStatus || order?.fulfillmentStatus}".`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, message: "Order updated successfully!", order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
