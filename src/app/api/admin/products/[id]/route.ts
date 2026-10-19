import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product, IProduct } from "@/models/Product";
import { adminStore } from "@/lib/admin-store";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const conn = await connectToDatabase();

    if (conn) {
      try {
        const dbProduct = await Product.findOne({
          $or: [{ _id: id }, { id: id }, { slug: id }, { sku: id }],
        }).lean();
        if (dbProduct) {
          return NextResponse.json({ success: true, product: dbProduct });
        }
      } catch (e) {
        // Fall back to in-memory store
      }
    }

    const product = adminStore.products.find(
      (p) => p.id === id || p._id === id || p.slug === id || p.sku === id
    );

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get product" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const body = await request.json();

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Product.findOneAndUpdate(
          { $or: [{ _id: id }, { id: id }, { slug: id }, { sku: id }] },
          { $set: body },
          { new: true }
        );
      } catch (e) {
        // Fall back
      }
    }

    const index = adminStore.products.findIndex(
      (p) => p.id === id || p._id === id || p.slug === id || p.sku === id
    );

    if (index !== -1) {
      adminStore.products[index] = {
        ...adminStore.products[index],
        ...body,
        updatedAt: new Date(),
      };
    }

    // Log update
    adminStore.activityLogs.unshift({
      actor: "Super Admin",
      role: "Product Manager",
      action: "PRODUCT_UPDATED",
      entity: "Product",
      entityId: id,
      details: `Updated details for product "${body.name || id}".`,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully!",
      product: index !== -1 ? adminStore.products[index] : body,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const body = await request.json();

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Product.findOneAndUpdate(
          { $or: [{ _id: id }, { id: id }, { slug: id }, { sku: id }] },
          { $set: body }
        );
      } catch (e) {}
    }

    const index = adminStore.products.findIndex(
      (p) => p.id === id || p._id === id || p.slug === id || p.sku === id
    );

    if (index !== -1) {
      adminStore.products[index] = {
        ...adminStore.products[index],
        ...body,
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully!",
      product: index !== -1 ? adminStore.products[index] : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to patch product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Product.findOneAndDelete({
          $or: [{ _id: id }, { id: id }, { slug: id }, { sku: id }],
        });
      } catch (e) {}
    }

    const index = adminStore.products.findIndex(
      (p) => p.id === id || p._id === id || p.slug === id || p.sku === id
    );

    let deletedName = id;
    if (index !== -1) {
      deletedName = adminStore.products[index].name;
      adminStore.products.splice(index, 1);
    }

    adminStore.activityLogs.unshift({
      actor: "Super Admin",
      role: "Super Admin",
      action: "PRODUCT_DELETED",
      entity: "Product",
      entityId: id,
      details: `Deleted product "${deletedName}".`,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Product "${deletedName}" deleted successfully!`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
