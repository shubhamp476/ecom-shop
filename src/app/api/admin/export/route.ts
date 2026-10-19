import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/admin-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "products";

    if (type === "orders") {
      const headers = ["OrderNumber", "CustomerName", "Email", "Phone", "Total (INR)", "PaymentStatus", "FulfillmentStatus", "Date"];
      const rows = adminStore.orders.map((o) => [
        o.orderNumber,
        `"${o.customer.name}"`,
        o.customer.email,
        o.customer.phone,
        o.total,
        o.paymentStatus,
        o.fulfillmentStatus,
        new Date(o.createdAt || Date.now()).toISOString(),
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="orders_export_${Date.now()}.csv"`,
        },
      });
    }

    if (type === "inventory") {
      const headers = ["SKU", "ProductName", "Category", "StockOnHand", "ReservedStock", "AvailableStock", "ReorderLevel", "Warehouse"];
      const rows = adminStore.products.map((p) => [
        p.sku,
        `"${p.name.replace(/"/g, '""')}"`,
        p.category,
        p.stock,
        p.reservedStock || 0,
        p.availableStock || p.stock,
        p.reorderLevel || 5,
        `"${p.warehouseLocation || "Central"}"`,
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="inventory_export_${Date.now()}.csv"`,
        },
      });
    }

    // Default: products
    const headers = ["SKU", "Name", "Category", "Brand", "Price (INR)", "MRP (INR)", "CostPrice (INR)", "Stock", "Status", "Barcode"];
    const rows = adminStore.products.map((p) => [
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.brand,
      p.price,
      p.mrp,
      p.costPrice || 0,
      p.stock,
      p.status,
      p.barcode || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="products_export_${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to export CSV" },
      { status: 500 }
    );
  }
}
