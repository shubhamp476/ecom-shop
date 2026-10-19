import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ActivityLog } from "@/models/ActivityLog";
import { InventoryLog } from "@/models/InventoryLog";
import { adminStore } from "@/lib/admin-store";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    let activityLogs = adminStore.activityLogs;
    let inventoryLogs = adminStore.inventoryLogs;

    if (conn) {
      try {
        const dbActivity = await ActivityLog.find({}).sort({ timestamp: -1 }).limit(50).lean();
        if (dbActivity && dbActivity.length > 0) activityLogs = dbActivity as any;

        const dbInventory = await InventoryLog.find({}).sort({ timestamp: -1 }).limit(50).lean();
        if (dbInventory && dbInventory.length > 0) inventoryLogs = dbInventory as any;
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      activityLogs,
      inventoryLogs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load audit logs" },
      { status: 500 }
    );
  }
}
