import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Customer, ICustomer } from "@/models/Customer";
import { adminStore } from "@/lib/admin-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() || "";

    const conn = await connectToDatabase();
    let customers: ICustomer[] = adminStore.customers;

    if (conn) {
      try {
        const dbCust = await Customer.find({}).lean();
        if (dbCust && dbCust.length > 0) customers = dbCust as any;
      } catch (e) {}
    }

    const filtered = customers.filter(
      (c) =>
        !search ||
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.phone.includes(search) ||
        c.city.toLowerCase().includes(search)
    );

    return NextResponse.json({ success: true, customers: filtered });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, city, state, country, tier, notes } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "Name, email, and phone number are required" },
        { status: 400 }
      );
    }

    const newCustomer: ICustomer = {
      name,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      city: city || "Mumbai",
      state: state || "Maharashtra",
      country: country || "India",
      totalOrders: 0,
      totalSpent: 0,
      status: "Active",
      tier: tier || "Standard",
      notes: notes || "",
      createdAt: new Date(),
    };

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Customer.create(newCustomer);
      } catch (e) {}
    }

    adminStore.customers.unshift(newCustomer);

    adminStore.activityLogs.unshift({
      actor: "CRM Admin",
      role: "Super Admin",
      action: "CUSTOMER_CREATED",
      entity: "Customer",
      entityId: newCustomer.email,
      details: `Registered customer "${newCustomer.name}" (${newCustomer.email}) as ${newCustomer.tier} member.`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, customer: newCustomer });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create customer" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, tier, status, notes } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Customer email is required" }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Customer.findOneAndUpdate(
          { email: email.toLowerCase() },
          {
            $set: {
              ...(tier && { tier }),
              ...(status && { status }),
              ...(notes !== undefined && { notes }),
            },
          }
        );
      } catch (e) {}
    }

    const cust = adminStore.customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
    if (cust) {
      if (tier) cust.tier = tier;
      if (status) cust.status = status;
      if (notes !== undefined) cust.notes = notes;
    }

    adminStore.activityLogs.unshift({
      actor: "CRM Admin",
      role: "Super Admin",
      action: "CUSTOMER_UPDATED",
      entity: "Customer",
      entityId: email,
      details: `Updated customer account "${email}" tier/status to "${tier || cust?.tier}" / "${status || cust?.status}".`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, message: "Customer account updated.", customer: cust });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update customer" },
      { status: 500 }
    );
  }
}
