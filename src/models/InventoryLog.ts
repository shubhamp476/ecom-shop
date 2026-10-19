import mongoose, { Schema, Model, models } from "mongoose";

export interface IInventoryLog {
  _id?: string;
  productId: string;
  productName: string;
  sku: string;
  type: "stock_in" | "stock_out" | "adjustment" | "order" | "return";
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: string;
  actor: string;
  timestamp: Date;
}

const InventoryLogSchema = new Schema<IInventoryLog>(
  {
    productId: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    type: {
      type: String,
      enum: ["stock_in", "stock_out", "adjustment", "order", "return"],
      required: true,
    },
    quantityChange: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: { type: String, required: true },
    actor: { type: String, default: "Super Admin" },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const InventoryLog: Model<IInventoryLog> =
  models.InventoryLog || mongoose.model<IInventoryLog>("InventoryLog", InventoryLogSchema);
