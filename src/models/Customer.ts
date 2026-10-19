import mongoose, { Schema, Model, models } from "mongoose";

export interface ICustomer {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  totalOrders: number;
  totalSpent: number;
  status: "Active" | "Inactive" | "Blocked";
  tier: "Standard" | "Silver" | "Gold" | "VIP";
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true },
    city: { type: String, default: "Mumbai" },
    state: { type: String, default: "Maharashtra" },
    country: { type: String, default: "India" },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Inactive", "Blocked"], default: "Active" },
    tier: { type: String, enum: ["Standard", "Silver", "Gold", "VIP"], default: "Standard" },
    notes: String,
  },
  {
    timestamps: true,
  }
);

export const Customer: Model<ICustomer> =
  models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);
