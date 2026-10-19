import mongoose, { Schema, Model, models } from "mongoose";

export interface IActivityLog {
  _id?: string;
  actor: string;
  role: string;
  action: string; // e.g. "PRODUCT_CREATED", "PRICE_UPDATED", "STOCK_ADJUSTED", "ORDER_STATUS_CHANGED"
  entity: string; // e.g. "Product", "Order", "Category"
  entityId?: string;
  details: string;
  ipAddress?: string;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    actor: { type: String, required: true },
    role: { type: String, default: "Super Admin" },
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    entityId: String,
    details: { type: String, required: true },
    ipAddress: { type: String, default: "127.0.0.1" },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const ActivityLog: Model<IActivityLog> =
  models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
