import mongoose, { Schema, Model, models } from "mongoose";

export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  parentId?: string | null;
  count?: string;
  image: string;
  bannerImage?: string;
  description: string;
  sortOrder: number;
  status: "Active" | "Inactive";
  specTemplate?: string[]; // e.g. ["Display", "Processor", "Battery", "RAM"]
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    parentId: { type: String, default: null },
    count: { type: String, default: "0 items" },
    image: { type: String, required: true },
    bannerImage: String,
    description: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    specTemplate: [{ type: String }],
    metaTitle: String,
    metaDescription: String,
  },
  {
    timestamps: true,
  }
);

export const Category: Model<ICategory> =
  models.Category || mongoose.model<ICategory>("Category", CategorySchema);
