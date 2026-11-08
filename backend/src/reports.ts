/** Database-derived reports; no fabricated chart series or estimated profit. */
import type { Db, Document } from "mongodb";
import { serialize } from "./db.js";

const round2 = (n: number) => Math.round(n * 100) / 100;

const CATEGORY_PIPELINE = [
  { $group: { _id: "$category", productCount: { $sum: 1 }, totalStock: { $sum: "$stock" },
    inventoryValue: { $sum: { $multiply: ["$price", "$stock"] } } } },
  { $sort: { _id: 1 } },
];
const BRAND_PIPELINE = [
  { $group: { _id: "$brand", productCount: { $sum: 1 }, minimumPrice: { $min: "$price" },
    maximumPrice: { $max: "$price" }, averagePrice: { $avg: "$price" } } },
  { $sort: { _id: 1 } },
];

export async function inventoryReport(db: Db) {
  return {
    categories: await db.collection("products").aggregate(CATEGORY_PIPELINE).toArray(),
    brands: await db.collection("products").aggregate(BRAND_PIPELINE).toArray(),
    lowStock: await db.collection("products").find({ stock: { $lte: 10 } }).sort({ stock: 1 }).toArray(),
  };
}

function orderDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export async function buildStats(db: Db) {
  const products = await db.collection("products").find().toArray();
  const orders = await db.collection("orders").find().sort({ createdAt: -1 }).toArray();
  const stock = (p: Document) => p.stock ?? 0;
  const low = products.filter((p) => stock(p) <= (p.reorderLevel ?? 5));
  const paid = (o: Document) => o.paymentStatus === "Paid";
  const revenue = orders.filter(paid).reduce((sum, o) => sum + (o.total ?? 0), 0);

  const byMonth = new Map<string, { month: string; revenue: number; orders: number }>();
  const statuses = new Map<string, number>();
  for (const order of orders) {
    const status = order.fulfillmentStatus ?? "Pending";
    statuses.set(status, (statuses.get(status) ?? 0) + 1);
    const date = orderDate(order.createdAt);
    if (!date) continue;
    const month = date.toISOString().slice(0, 7);
    const row = byMonth.get(month) ?? { month, revenue: 0, orders: 0 };
    row.orders += 1;
    if (paid(order)) row.revenue += order.total ?? 0;
    byMonth.set(month, row);
  }
  const report = await inventoryReport(db);

  return {
    kpis: {
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.status === "Active").length,
      draftProducts: products.filter((p) => p.status === "Draft").length,
      outOfStockProducts: products.filter((p) => stock(p) === 0).length,
      lowStockProducts: low.filter((p) => stock(p) > 0).length,
      totalInventoryValue: round2(products.reduce((s, p) => s + (p.price ?? 0) * stock(p), 0)),
      totalInventoryCost: round2(products.reduce((s, p) => s + (p.costPrice ?? 0) * stock(p), 0)),
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => ["Pending", "Processing"].includes(o.fulfillmentStatus)).length,
      totalRevenue: round2(revenue),
      grossProfit: null,
      profitMargin: null,
      totalCustomers: await db.collection("customers").countDocuments({}),
    },
    charts: {
      salesOverTime: [...byMonth.keys()].sort().map((k) => byMonth.get(k)),
      categoryDistribution: report.categories.map((r) => ({ name: r._id, value: r.totalStock })),
      ordersByStatus: [...statuses].map(([name, value]) => ({ name, value })),
    },
    widgets: {
      lowStockItems: low.slice(0, 5).map((p) => ({ ...p, id: String(p._id) })),
      recentOrders: orders.slice(0, 5).map((o) => ({
        id: String(o._id), orderNumber: o.orderNumber, customerName: o.customer?.name,
        total: o.total, paymentStatus: o.paymentStatus, fulfillmentStatus: o.fulfillmentStatus,
        createdAt: o.createdAt,
        itemsCount: (o.items ?? []).reduce((s: number, i: Document) => s + (i.quantity ?? 0), 0),
      })),
      recentActivity: await db.collection("activitylogs").find().sort({ timestamp: -1 }).limit(6).toArray(),
    },
    notes: ["Profit is unavailable until order-time cost snapshots are recorded."],
  };
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let text = String(serialize(value));
  // Protect spreadsheet users from executable formulas in user-entered text.
  if (typeof value === "string" && /^[=+\-@]/.test(text.trimStart())) text = "'" + text;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export const toCsv = (columns: string[], rows: unknown[][]) =>
  [columns, ...rows].map((row) => row.map(csvCell).join(",")).join("\n") + "\n";

export type ExportKind = "products" | "orders" | "inventory";

export async function exportCsv(db: Db, kind: ExportKind) {
  if (kind === "orders") {
    const orders = await db.collection("orders").find().toArray();
    return toCsv(
      ["OrderNumber", "CustomerName", "Email", "Phone", "Total (INR)", "PaymentStatus", "FulfillmentStatus", "Date"],
      orders.map((o) => [o.orderNumber, o.customer?.name, o.customer?.email, o.customer?.phone ?? "", o.total,
        o.paymentStatus, o.fulfillmentStatus, o.createdAt]),
    );
  }
  const products = await db.collection("products").find().toArray();
  if (kind === "inventory") {
    return toCsv(
      ["SKU", "ProductName", "Category", "StockOnHand", "ReservedStock", "AvailableStock", "ReorderLevel", "Warehouse"],
      products.map((p) => [p.sku, p.name, p.category, p.stock, p.reservedStock ?? 0, p.availableStock ?? p.stock,
        p.reorderLevel ?? 5, p.warehouseLocation ?? ""]),
    );
  }
  return toCsv(
    ["SKU", "Name", "Category", "Brand", "Price (INR)", "MRP (INR)", "CostPrice (INR)", "Stock", "Status", "Barcode"],
    products.map((p) => [p.sku, p.name, p.category, p.brand ?? "", p.price, p.mrp ?? p.price, p.costPrice ?? 0,
      p.stock, p.status, p.barcode ?? ""]),
  );
}
