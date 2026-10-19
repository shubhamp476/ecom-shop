import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { PRODUCTS, CATEGORIES } from "@/data/products";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not connect to MongoDB. Check MONGODB_URI in your .env.local file.",
        },
        { status: 500 }
      );
    }

    // Seed Categories
    let categoryCount = 0;
    for (const cat of CATEGORIES) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        { $set: cat },
        { upsert: true, new: true }
      );
      categoryCount++;
    }

    // Seed Products
    let productCount = 0;
    for (const prod of PRODUCTS) {
      await Product.findOneAndUpdate(
        { slug: prod.slug },
        { $set: prod },
        { upsert: true, new: true }
      );
      productCount++;
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      categoriesSeeded: categoryCount,
      productsSeeded: productCount,
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to seed database",
      },
      { status: 500 }
    );
  }
}
