import mongoose, { Schema, Model, models } from "mongoose";

export interface IBrand {
  _id?: string;
  name: string;
  slug: string;
  logo: string;
  banner?: string;
  description: string;
  website?: string;
  countryOfOrigin?: string;
  warrantyPolicy?: string;
  supportEmail?: string;
  supportPhone?: string;
  status: "Active" | "Inactive";
  featured?: boolean;
  productCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    logo: { type: String, required: true },
    banner: String,
    description: { type: String, default: "" },
    website: String,
    countryOfOrigin: String,
    warrantyPolicy: String,
    supportEmail: String,
    supportPhone: String,
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    featured: { type: Boolean, default: false },
    productCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Brand: Model<IBrand> =
  models.Brand || mongoose.model<IBrand>("Brand", BrandSchema);
