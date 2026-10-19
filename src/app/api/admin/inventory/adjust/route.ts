import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { InventoryLog } from "@/models/InventoryLog";
import { adminStore } from "@/lib/admin-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, type, quantityChange, reason, actor = "Super Admin" } = body;

    if (!productId || quantityChange === undefined || !reason) {
      return NextResponse.json(
        { success: false, error: "Product ID, quantity change, and reason are required" },
        { status: 400 }
      );
    }

    const conn = await connectToDatabase();
    let product = adminStore.products.find(
      (p) => p.id === productId || p._id === productId || p.sku === productId
    );

    if (conn) {
      try {
        const dbProd = await Product.findOne({
          $or: [{ _id: productId }, { id: productId }, { sku: productId }],
        });
        if (dbProd) product = dbProd as any;
      } catch (e) {}
    }

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const previousStock = product.stock || 0;
    const change = Number(quantityChange);
    const newStock = Math.max(0, previousStock + change);

    // Update in DB
    if (conn) {
      try {
        await Product.findOneAndUpdate(
          { $or: [{ _id: productId }, { id: productId }, { sku: productId }] },
          {
            $set: {
              stock: newStock,
              availableStock: Math.max(0, newStock - (product.reservedStock || 0)),
              inStock: newStock > 0,
              status: newStock === 0 ? "Out of Stock" : product.status === "Out of Stock" ? "Active" : product.status,
            },
          }
        );

        await InventoryLog.create({
          productId: product._id?.toString() || product.id,
          productName: product.name,
          sku: product.sku,
          type: type || (change >= 0 ? "stock_in" : "stock_out"),
          quantityChange: change,
          previousStock,
          newStock,
          reason,
          actor,
          timestamp: new Date(),
        });
      } catch (e) {}
    }

    // Update in-memory
    product.stock = newStock;
    product.availableStock = Math.max(0, newStock - (product.reservedStock || 0));
    product.inStock = newStock > 0;
    if (newStock === 0) product.status = "Out of Stock";
    else if (product.status === "Out of Stock") product.status = "Active";

    adminStore.inventoryLogs.unshift({
      productId: product._id?.toString() || product.id || productId,
      productName: product.name,
      sku: product.sku,
      type: type || (change >= 0 ? "stock_in" : "stock_out"),
      quantityChange: change,
      previousStock,
      newStock,
      reason,
      actor,
      timestamp: new Date(),
    });

    adminStore.activityLogs.unshift({
      actor,
      role: "Inventory Manager",
      action: "STOCK_ADJUSTED",
      entity: "Inventory",
      entityId: product.sku,
      details: `Adjusted stock for ${product.name} (${product.sku}) by ${change > 0 ? "+" : ""}${change} units. Reason: ${reason}`,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Stock for ${product.name} updated from ${previousStock} to ${newStock}.`,
      previousStock,
      newStock,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to adjust stock" },
      { status: 500 }
    );
  }
}
