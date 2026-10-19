import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { StoreSettings, IStoreSettings } from "@/models/StoreSettings";
import { adminStore } from "@/lib/admin-store";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    let settings: IStoreSettings = adminStore.settings;

    if (conn) {
      try {
        const dbSettings = await StoreSettings.findOne({}).lean();
        if (dbSettings) settings = dbSettings as any;
      } catch (e) {}
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await StoreSettings.findOneAndUpdate({}, { $set: body }, { upsert: true, new: true });
      } catch (e) {}
    }

    adminStore.settings = {
      ...adminStore.settings,
      ...body,
      updatedAt: new Date(),
    };

    adminStore.activityLogs.unshift({
      actor: "Super Admin",
      role: "Super Admin",
      action: "SETTINGS_UPDATED",
      entity: "StoreSettings",
      details: "Updated core store settings, taxes, and shipping thresholds.",
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Store settings updated successfully!",
      settings: adminStore.settings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
