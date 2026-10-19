import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getAllProducts } from "@/lib/data-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const conn = await connectToDatabase();

    if (!conn) {
      // Graceful fallback to static data when DB is not yet configured or connected
      const fallbackProducts = await getAllProducts();
      const filtered = category
        ? fallbackProducts.filter((p) => p.categorySlug === category)
        : fallbackProducts;
      return NextResponse.json({
        success: true,
        source: "fallback_static",
        count: filtered.length,
        data: filtered,
      });
    }

    const query = category ? { categorySlug: category } : {};
    const products = await Product.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      source: "mongodb",
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        {
          success: false,
          error: "Database is not connected. Please verify your MONGODB_URI in .env.local.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();

    if (!body.name || !body.slug || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (name, slug, price, category)" },
        { status: 400 }
      );
    }

    const newProduct = await Product.create(body);
    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
