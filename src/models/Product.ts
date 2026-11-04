// API response types. MongoDB persistence is implemented in backend/.
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
