import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Supplier, ISupplier } from "@/models/Supplier";
import { adminStore } from "@/lib/admin-store";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    let suppliers: ISupplier[] = adminStore.suppliers;

    if (conn) {
      try {
        const dbSupp = await Supplier.find({}).lean();
        if (dbSupp && dbSupp.length > 0) suppliers = dbSupp as any;
      } catch (e) {}
    }

    return NextResponse.json({ success: true, suppliers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load suppliers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.companyName) {
      return NextResponse.json({ success: false, error: "Supplier name and company required" }, { status: 400 });
    }

    const newSupplier: ISupplier = {
      name: body.name,
      companyName: body.companyName,
      email: body.email || "",
      phone: body.phone || "",
      gstin: body.gstin || "",
      address: body.address || "",
      city: body.city || "",
      state: body.state || "",
      brandsSupplied: body.brandsSupplied || [],
      paymentTerms: body.paymentTerms || "Net 30",
      status: "Active",
      rating: 5,
      createdAt: new Date(),
    };

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Supplier.create(newSupplier);
      } catch (e) {}
    }

    adminStore.suppliers.push(newSupplier);

    adminStore.activityLogs.unshift({
      actor: "Super Admin",
      role: "Inventory Manager",
      action: "SUPPLIER_CREATED",
      entity: "Supplier",
      entityId: newSupplier.companyName,
      details: `Added new supplier "${newSupplier.companyName}".`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, supplier: newSupplier });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add supplier" },
      { status: 500 }
    );
  }
}
