import mongoose, { Schema, Model, models } from "mongoose";

export interface ISupplier {
  _id?: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  gstin?: string;
  address: string;
  city: string;
  state: string;
  brandsSupplied: string[];
  paymentTerms: string;
  status: "Active" | "Inactive";
  rating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true },
    companyName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    gstin: String,
    address: { type: String, default: "" },
    city: String,
    state: String,
    brandsSupplied: [{ type: String }],
    paymentTerms: { type: String, default: "Net 30" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    rating: { type: Number, default: 5 },
  },
  {
    timestamps: true,
  }
);

export const Supplier: Model<ISupplier> =
  models.Supplier || mongoose.model<ISupplier>("Supplier", SupplierSchema);
