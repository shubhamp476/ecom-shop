import mongoose, { Schema, Model, models } from "mongoose";

export interface IProductVariant {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  attributes: Record<string, string>; // e.g. { Color: "Titanium Gray", Storage: "256GB", RAM: "12GB" }
  mrp: number;
  price: number;
  costPrice?: number;
  stock: number;
  reservedStock?: number;
  image?: string;
  status: "Active" | "Inactive" | "Out of Stock";
}

export interface ISpecItem {
  group?: string;
  label: string;
  value: string;
  unit?: string;
}

export interface IProduct {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description: string;
  brand: string;
  brandSlug: string;
  category: string;
  categorySlug: string;
  subcategory?: string;
  productType?: string;
  manufacturer?: string;
  modelNumber?: string;
  partNumber?: string;
  sku: string;
  barcode?: string;
  countryOfOrigin?: string;
  warrantyDuration?: string;
  warrantyTerms?: string;
  boxContents?: string[];
  condition: "New" | "Refurbished" | "Used";
  status: "Draft" | "Active" | "Inactive" | "Archived" | "Out of Stock";
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;

  // Media
  image: string;
  gallery: string[];

  // Pricing & Taxes
  mrp: number;
  price: number; // Selling price
  costPrice?: number;
  discountAmount?: number;
  discountPercentage?: number;
  taxRate?: number; // GST % (e.g., 18)
  hsnCode?: string;
  currency: string;

  // Inventory
  stock: number;
  reservedStock: number;
  availableStock: number;
  reorderLevel?: number;
  restockQuantity?: number;
  warehouseLocation?: string;

  // Shipping & Dimensions
  weight?: number; // in kg
  packageWeight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  shippingClass?: string;
  isFragile?: boolean;
  codEligible?: boolean;
  freeShipping?: boolean;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;

  // Dynamic Specs & Variants
  specs: ISpecItem[];
  variants: IProductVariant[];

  // Ratings
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  tag?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>({
  id: { type: String, required: true },
  sku: { type: String, required: true },
  barcode: String,
  name: { type: String, required: true },
  attributes: { type: Map, of: String },
  mrp: { type: Number, required: true },
  price: { type: Number, required: true },
  costPrice: Number,
  stock: { type: Number, default: 0 },
  reservedStock: { type: Number, default: 0 },
  image: String,
  status: { type: String, enum: ["Active", "Inactive", "Out of Stock"], default: "Active" },
});

const SpecItemSchema = new Schema<ISpecItem>({
  group: String,
  label: { type: String, required: true },
  value: { type: String, required: true },
  unit: String,
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: String,
    description: { type: String, default: "" },
    brand: { type: String, default: "Givolt", index: true },
    brandSlug: { type: String, default: "givolt", index: true },
    category: { type: String, required: true, index: true },
    categorySlug: { type: String, required: true, index: true },
    subcategory: String,
    productType: String,
    manufacturer: String,
    modelNumber: String,
    partNumber: String,
    sku: { type: String, required: true, unique: true, index: true },
    barcode: String,
    countryOfOrigin: { type: String, default: "India" },
    warrantyDuration: { type: String, default: "1 Year" },
    warrantyTerms: String,
    boxContents: [{ type: String }],
    condition: { type: String, enum: ["New", "Refurbished", "Used"], default: "New" },
    status: {
      type: String,
      enum: ["Draft", "Active", "Inactive", "Archived", "Out of Stock"],
      default: "Active",
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
    newArrival: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },

    image: { type: String, required: true },
    gallery: [{ type: String }],

    mrp: { type: Number, required: true },
    price: { type: Number, required: true },
    costPrice: Number,
    discountAmount: Number,
    discountPercentage: Number,
    taxRate: { type: Number, default: 18 },
    hsnCode: String,
    currency: { type: String, default: "INR" },

    stock: { type: Number, default: 10 },
    reservedStock: { type: Number, default: 0 },
    availableStock: { type: Number, default: 10 },
    reorderLevel: { type: Number, default: 5 },
    restockQuantity: { type: Number, default: 20 },
    warehouseLocation: { type: String, default: "Central Hub" },

    weight: Number,
    packageWeight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    shippingClass: { type: String, default: "Standard Electronics" },
    isFragile: { type: Boolean, default: false },
    codEligible: { type: Boolean, default: true },
    freeShipping: { type: Boolean, default: true },

    metaTitle: String,
    metaDescription: String,
    keywords: [{ type: String }],
    canonicalUrl: String,

    specs: [SpecItemSchema],
    variants: [ProductVariantSchema],

    rating: { type: Number, default: 5 },
    reviewsCount: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    tag: String,
  },
  {
    timestamps: true,
  }
);

export const Product: Model<IProduct> =
  models.Product || mongoose.model<IProduct>("Product", ProductSchema);
