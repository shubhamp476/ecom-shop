import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { Customer } from "@/models/Customer";
import { adminStore } from "@/lib/admin-store";

export async function GET() {
  try {
    const conn = await connectToDatabase();

    let products = adminStore.products;
    let orders = adminStore.orders;
    let customers = adminStore.customers;

    if (conn) {
      const dbProducts = await Product.find({}).lean();
      if (dbProducts && dbProducts.length > 0) products = dbProducts as any;

      const dbOrders = await Order.find({}).lean();
      if (dbOrders && dbOrders.length > 0) orders = dbOrders as any;

      const dbCustomers = await Customer.find({}).lean();
      if (dbCustomers && dbCustomers.length > 0) customers = dbCustomers as any;
    }

    // Compute KPIs
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.status === "Active").length;
    const draftProducts = products.filter((p) => p.status === "Draft").length;
    const outOfStockProducts = products.filter((p) => p.stock <= 0 || p.status === "Out of Stock").length;
    const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= (p.reorderLevel || 5)).length;

    const totalInventoryValue = products.reduce((acc, p) => acc + (p.price || 0) * (p.stock || 0), 0);
    const totalInventoryCost = products.reduce((acc, p) => acc + (p.costPrice || p.price * 0.7) * (p.stock || 0), 0);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.fulfillmentStatus === "Pending" || o.fulfillmentStatus === "Processing").length;
    const deliveredOrders = orders.filter((o) => o.fulfillmentStatus === "Delivered").length;

    const totalRevenue = orders.reduce((acc, o) => acc + (o.paymentStatus === "Paid" ? o.total : 0), 0);
    const grossProfit = totalRevenue - (totalRevenue * 0.68); // estimated COGS 68%
    const profitMargin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 32;

    const totalCustomers = customers.length;

    // Charts Data
    // 1. Sales Revenue Over Time (Months)
    const salesOverTime = [
      { month: "Jan", revenue: 4200, orders: 12 },
      { month: "Feb", revenue: 5800, orders: 18 },
      { month: "Mar", revenue: 7400, orders: 25 },
      { month: "Apr", revenue: 6900, orders: 22 },
      { month: "May", revenue: 8900, orders: 31 },
      { month: "Jun", revenue: 11200, orders: 39 },
      { month: "Jul", revenue: 13500, orders: 48 },
    ];

    // 2. Sales by Product Category
    const categoryCounts: Record<string, number> = {};
    products.forEach((p) => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + (p.stock || 1);
    });
    const categoryDistribution = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      value: count,
    }));

    // 3. Orders by Status
    const ordersByStatus = [
      { name: "Delivered", value: deliveredOrders || 1 },
      { name: "Processing", value: pendingOrders || 1 },
      { name: "Shipped", value: orders.filter((o) => o.fulfillmentStatus === "Shipped").length || 1 },
      { name: "Return Req.", value: orders.filter((o) => o.fulfillmentStatus === "Return Requested").length || 1 },
    ];

    // 4. Low stock items
    const lowStockItems = products
      .filter((p) => p.stock <= (p.reorderLevel || 5))
      .slice(0, 5)
      .map((p) => ({
        id: p._id || p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        stock: p.stock,
        reorderLevel: p.reorderLevel || 5,
        image: p.image,
      }));

    // 5. Recent Orders
    const recentOrders = orders.slice(0, 5).map((o) => ({
      id: o._id || o.orderNumber,
      orderNumber: o.orderNumber,
      customerName: o.customer.name,
      total: o.total,
      paymentStatus: o.paymentStatus,
      fulfillmentStatus: o.fulfillmentStatus,
      createdAt: o.createdAt,
      itemsCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
    }));

    // 6. Recent Activity
    const recentActivity = adminStore.activityLogs.slice(0, 6);

    return NextResponse.json({
      success: true,
      kpis: {
        totalProducts,
        activeProducts,
        draftProducts,
        outOfStockProducts,
        lowStockProducts,
        totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
        totalInventoryCost: Math.round(totalInventoryCost * 100) / 100,
        totalOrders,
        pendingOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        grossProfit: Math.round(grossProfit * 100) / 100,
        profitMargin,
        totalCustomers,
      },
      charts: {
        salesOverTime,
        categoryDistribution,
        ordersByStatus,
      },
      widgets: {
        lowStockItems,
        recentOrders,
        recentActivity,
      },
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load admin stats" },
      { status: 500 }
    );
  }
}
