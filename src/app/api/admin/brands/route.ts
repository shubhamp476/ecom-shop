import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Brand, IBrand } from "@/models/Brand";
import { adminStore } from "@/lib/admin-store";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    let brands: IBrand[] = adminStore.brands;

    if (conn) {
      try {
        const dbBrands = await Brand.find({}).lean();
        if (dbBrands && dbBrands.length > 0) brands = dbBrands as any;
      } catch (e) {}
    }

    return NextResponse.json({ success: true, brands });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load brands" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ success: false, error: "Brand name is required" }, { status: 400 });
    }

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newBrand: IBrand = {
      name: body.name,
      slug,
      logo: body.logo || "/assets/69d13b078880cdeb9b2b2fc9_2.avif",
      description: body.description || "",
      website: body.website || "",
      countryOfOrigin: body.countryOfOrigin || "India",
      warrantyPolicy: body.warrantyPolicy || "1 Year Standard Warranty",
      supportEmail: body.supportEmail || "",
      supportPhone: body.supportPhone || "",
      status: body.status || "Active",
      featured: Boolean(body.featured),
      productCount: 0,
      createdAt: new Date(),
    };

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Brand.create(newBrand);
      } catch (e) {}
    }

    adminStore.brands.push(newBrand);

    adminStore.activityLogs.unshift({
      actor: "Super Admin",
      role: "Product Manager",
      action: "BRAND_CREATED",
      entity: "Brand",
      entityId: newBrand.slug,
      details: `Created new brand "${newBrand.name}".`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, brand: newBrand });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create brand" },
      { status: 500 }
    );
  }
}
