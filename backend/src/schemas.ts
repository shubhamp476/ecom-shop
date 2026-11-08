/** Zod validation preserving the existing UI's field names, defaults and status values. */
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { ValidationError } from "./errors.js";

// Lenient scalar parsing (numeric strings, "true"/"false") so CSV rows and form posts validate.
const toNumber = (v: unknown) => {
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return v;
};
const toBoolean = (v: unknown) => {
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "1", "yes", "on", "y", "t"].includes(s)) return true;
    if (["false", "0", "no", "off", "n", "f"].includes(s)) return false;
  }
  if (v === 0 || v === 1) return Boolean(v);
  return v;
};
const toDate = (v: unknown) => {
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return v;
};

const str = () => z.string().trim();
const Text = str().min(1, "String should have at least 1 character").max(500);
const Money = z.preprocess(toNumber, z.number().min(0));
const Count = z.preprocess(toNumber, z.number().int().min(0));
const bool = () => z.preprocess(toBoolean, z.boolean());
const date = () => z.preprocess(toDate, z.date());
const list = () => z.array(str()).default(() => []);

export function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Parse with a schema and translate Zod issues to the API's error shape. */
export function parse<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input ?? {});
  if (result.success) return result.data;
  throw new ValidationError(result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
}

const Spec = z.object({ label: Text, value: Text, group: str().default(""), unit: str().default("") });

const Variant = z.object({
  id: Text, sku: Text, name: Text,
  attributes: z.record(z.string(), str()).default(() => ({})),
  mrp: Money, price: Money,
  costPrice: Money.default(0), stock: Count.default(0), reservedStock: Count.default(0),
  image: str().default(""), barcode: str().default(""),
  status: z.enum(["Active", "Inactive", "Out of Stock"]).default("Active"),
});

const ProductSchema = z.object({
  name: Text,
  category: Text,
  price: z.preprocess(toNumber, z.number().gt(0)),
  slug: str().default(""),
  sku: str().default(""),
  categorySlug: str().default(""),
  brand: str().default("Givolt"),
  brandSlug: str().default(""),
  description: str().default(""),
  shortDescription: str().default(""),
  subcategory: str().default(""),
  productType: str().default(""),
  manufacturer: str().default(""),
  modelNumber: str().default(""),
  partNumber: str().default(""),
  barcode: str().default(""),
  countryOfOrigin: str().default("India"),
  warrantyDuration: str().default(""),
  warrantyTerms: str().default(""),
  boxContents: list(),
  condition: z.enum(["New", "Refurbished", "Used"]).default("New"),
  status: z.enum(["Draft", "Active", "Inactive", "Archived", "Out of Stock"]).default("Active"),
  featured: bool().default(false),
  newArrival: bool().default(false),
  bestSeller: bool().default(false),
  image: str().default("/assets/69d4a654a45341b80906ff1c_1.avif"),
  gallery: list(),
  mrp: Money.default(0),
  costPrice: Money.default(0),
  taxRate: z.preprocess(toNumber, z.number().min(0).max(100)).default(18),
  hsnCode: str().default(""),
  currency: z.enum(["INR", "USD", "EUR"]).default("INR"),
  stock: Count.default(0),
  reservedStock: Count.default(0),
  reorderLevel: Count.default(5),
  restockQuantity: Count.default(0),
  warehouseLocation: str().default(""),
  weight: Money.default(0),
  packageWeight: Money.default(0),
  dimensions: z.record(z.string(), Money).default(() => ({})),
  shippingClass: str().default("Standard Electronics"),
  isFragile: bool().default(false),
  codEligible: bool().default(true),
  freeShipping: bool().default(false),
  metaTitle: str().default(""),
  metaDescription: str().default(""),
  keywords: list(),
  canonicalUrl: str().default(""),
  specs: z.array(Spec).default(() => []),
  variants: z.array(Variant).default(() => []),
  rating: z.preprocess(toNumber, z.number().min(0).max(5)).default(0),
  reviewsCount: Count.default(0),
  tag: str().default(""),
});
export type Product = z.output<typeof ProductSchema>;

export function parseProduct(input: unknown): Product {
  const p = parse(ProductSchema, input);
  p.slug = p.slug || slugify(p.name);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) {
    throw ValidationError.single("Slug must contain lowercase letters, digits and single hyphens", "slug");
  }
  p.sku = p.sku || "GV-" + randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
  p.categorySlug = p.categorySlug || slugify(p.category);
  p.brandSlug = p.brandSlug || slugify(p.brand);
  p.mrp = p.mrp || p.price;
  if (p.mrp < p.price) throw ValidationError.single("MRP cannot be lower than selling price", "mrp");
  if (p.reservedStock > p.stock) throw ValidationError.single("Reserved stock cannot exceed stock", "reservedStock");
  if (p.gallery.length === 0) p.gallery = [p.image];
  return p;
}

/** Stored product document, including derived pricing and availability fields. */
export function productDocument(p: Product) {
  return {
    ...p,
    availableStock: p.stock - p.reservedStock,
    inStock: p.stock > p.reservedStock,
    discountAmount: Math.round((p.mrp - p.price) * 100) / 100,
    discountPercentage: Math.round(((p.mrp - p.price) / p.mrp) * 100),
    originalPrice: p.mrp,
  };
}

const CategorySchema = z.object({
  name: Text,
  slug: str().default(""),
  parentId: str().nullable().default(null),
  image: str().default("/assets/69d13b078880cdeb9b2b2fc9_2.avif"),
  bannerImage: str().default(""),
  count: str().default("0 items"),
  description: str().default(""),
  sortOrder: z.preprocess(toNumber, z.number().int()).default(0),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  specTemplate: list(),
  metaTitle: str().default(""),
  metaDescription: str().default(""),
});

export function parseCategory(input: unknown) {
  const c = parse(CategorySchema, input);
  c.slug = c.slug || slugify(c.name);
  if (!c.slug) throw ValidationError.single("A category slug is required", "slug");
  return c;
}

const BrandSchema = z.object({
  name: Text,
  slug: str().default(""),
  logo: str().default("/assets/69d13b078880cdeb9b2b2fc9_2.avif"),
  banner: str().default(""),
  description: str().default(""),
  website: str().default(""),
  countryOfOrigin: str().default(""),
  warrantyPolicy: str().default(""),
  supportEmail: str().default(""),
  supportPhone: str().default(""),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  featured: bool().default(false),
  productCount: Count.default(0),
});

export function parseBrand(input: unknown) {
  const b = parse(BrandSchema, input);
  b.slug = b.slug || slugify(b.name);
  if (!b.slug) throw ValidationError.single("A brand slug is required", "slug");
  return b;
}

const CustomerSchema = z.object({
  name: Text,
  email: Text.refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "A valid email address is required")
    .transform((v) => v.toLowerCase()),
  phone: Text,
  city: str().default(""),
  state: str().default(""),
  country: str().default("India"),
  totalOrders: Count.default(0),
  totalSpent: Money.default(0),
  status: z.enum(["Active", "Inactive", "Blocked"]).default("Active"),
  tier: z.enum(["Standard", "Silver", "Gold", "VIP"]).default("Standard"),
  notes: str().default(""),
});
export const parseCustomer = (input: unknown) => parse(CustomerSchema, input);

const DAY_MS = 86_400_000;
const CouponSchema = z.object({
  code: Text,
  description: str().default(""),
  discountType: z.enum(["percentage", "fixed"]).default("percentage"),
  discountValue: z.preprocess(toNumber, z.number().gt(0)),
  minOrderValue: Money.default(0),
  maxDiscountAmount: Money.nullable().default(null),
  usageLimit: Count.default(500),
  usedCount: Count.default(0),
  startDate: date().default(() => new Date()),
  endDate: date().default(() => new Date(Date.now() + 30 * DAY_MS)),
  status: z.enum(["Active", "Expired", "Disabled"]).default("Active"),
});

export function parseCoupon(input: unknown) {
  const c = parse(CouponSchema, input);
  c.code = c.code.toUpperCase();
  if (c.endDate <= c.startDate) throw ValidationError.single("End date must be after start date", "endDate");
  if (c.discountType === "percentage" && c.discountValue > 100) {
    throw ValidationError.single("Percentage cannot exceed 100", "discountValue");
  }
  return c;
}

const SupplierSchema = z.object({
  name: Text,
  companyName: Text,
  email: str().default(""),
  phone: str().default(""),
  gstin: str().default(""),
  address: str().default(""),
  city: str().default(""),
  state: str().default(""),
  brandsSupplied: list(),
  paymentTerms: str().default("Net 30"),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  rating: z.preprocess(toNumber, z.number().min(0).max(5)).default(0),
});
export const parseSupplier = (input: unknown) => parse(SupplierSchema, input);

const SettingsSchema = z.object({
  storeName: str().default("Givolt Electronics"),
  storeTagline: str().default("Smart Tech for Smarter Living"),
  currency: z.enum(["INR", "USD", "EUR"]).default("INR"),
  currencySymbol: str().default("₹"),
  defaultTaxRate: z.preprocess(toNumber, z.number().min(0).max(100)).default(18),
  lowStockThreshold: Count.default(5),
  freeShippingThreshold: Money.default(50),
  defaultShippingCost: Money.default(0),
  codEnabled: bool().default(true),
  supportEmail: str().default(""),
  supportPhone: str().default(""),
  orderPrefix: str().default("GV-"),
  maintenanceMode: bool().default(false),
});
export const parseSettings = (input: unknown) => parse(SettingsSchema, input);

export const OrderPatchSchema = z.object({
  orderNumber: Text,
  fulfillmentStatus: z.enum(["Pending", "Confirmed", "Processing", "Packed", "Shipped", "Delivered",
    "Cancelled", "Return Requested", "Returned"]).nullish(),
  paymentStatus: z.enum(["Pending", "Paid", "Failed", "Refunded"]).nullish(),
  trackingNumber: str().nullish(),
  shippingCarrier: str().nullish(),
  adminNotes: str().nullish(),
});

export const InventoryAdjustmentSchema = z.object({
  productId: Text,
  quantityChange: z.preprocess(toNumber, z.number().int()),
  reason: Text,
  actor: str().default("Super Admin"),
  type: z.enum(["stock_in", "stock_out", "adjustment", "order", "return"]).default("adjustment"),
});

export const ImportSchema = z.object({
  csvContent: z.string().trim().min(1).max(2_000_000),
  commit: bool().default(false),
});
