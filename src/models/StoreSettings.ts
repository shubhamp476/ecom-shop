import mongoose, { Schema, Model, models } from "mongoose";

export interface IStoreSettings {
  _id?: string;
  storeName: string;
  storeTagline: string;
  currency: "INR" | "USD" | "EUR";
  currencySymbol: string;
  defaultTaxRate: number; // default GST % (18)
  lowStockThreshold: number;
  freeShippingThreshold: number;
  defaultShippingCost: number;
  codEnabled: boolean;
  supportEmail: string;
  supportPhone: string;
  orderPrefix: string;
  maintenanceMode: boolean;
  updatedAt?: Date;
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    storeName: { type: String, default: "Givolt Electronics" },
    storeTagline: { type: String, default: "Smart Tech for Smarter Living" },
    currency: { type: String, enum: ["INR", "USD", "EUR"], default: "INR" },
    currencySymbol: { type: String, default: "₹" },
    defaultTaxRate: { type: Number, default: 18 },
    lowStockThreshold: { type: Number, default: 5 },
    freeShippingThreshold: { type: Number, default: 50 },
    defaultShippingCost: { type: Number, default: 0 },
    codEnabled: { type: Boolean, default: true },
    supportEmail: { type: String, default: "support@givolt.store" },
    supportPhone: { type: String, default: "+91 98765 43210" },
    orderPrefix: { type: String, default: "GV-" },
    maintenanceMode: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const StoreSettings: Model<IStoreSettings> =
  models.StoreSettings || mongoose.model<IStoreSettings>("StoreSettings", StoreSettingsSchema);
