import { connectToDatabase } from "./mongodb";
import { Product, IProduct } from "@/models/Product";
import { Category, ICategory } from "@/models/Category";
import { adminStore } from "@/lib/admin-store";
import { PRODUCTS as STATIC_PRODUCTS, CATEGORIES as STATIC_CATEGORIES, Product as ProductType, Category as CategoryType } from "@/data/products";

// Convert Mongoose doc or fallback to plain object
function sanitize<T>(doc: any): T {
  return JSON.parse(JSON.stringify(doc));
}

export async function getAllProducts(): Promise<ProductType[]> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const products = await Product.find({}).sort({ createdAt: -1 }).lean();
      if (products && products.length > 0) {
        return sanitize<ProductType[]>(products);
      }
    }
  } catch (err) {
    console.error("Failed to load products from MongoDB, falling back to admin store:", err);
  }

  // Use adminStore.products which contains all products including newly created items
  if (adminStore && adminStore.products && adminStore.products.length > 0) {
    return sanitize<ProductType[]>(adminStore.products);
  }

  return STATIC_PRODUCTS;
}

export async function getProductBySlug(slug: string): Promise<ProductType | null> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const product = await Product.findOne({ slug }).lean();
      if (product) {
        return sanitize<ProductType>(product);
      }
    }
  } catch (err) {
    console.error(`Failed to find product [${slug}] in MongoDB:`, err);
  }

  // Check adminStore.products first
  if (adminStore && adminStore.products) {
    const found = adminStore.products.find((p) => p.slug === slug || p.id === slug || p._id === slug);
    if (found) {
      return sanitize<ProductType>(found);
    }
  }

  return STATIC_PRODUCTS.find((p) => p.slug === slug) || null;
}

export async function getAllCategories(): Promise<CategoryType[]> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const categories = await Category.find({}).lean();
      if (categories && categories.length > 0) {
        return sanitize<CategoryType[]>(categories);
      }
    }
  } catch (err) {
    console.error("Failed to load categories from MongoDB, falling back to admin store:", err);
  }

  if (adminStore && adminStore.categories && adminStore.categories.length > 0) {
    return sanitize<CategoryType[]>(adminStore.categories);
  }

  return STATIC_CATEGORIES;
}

export async function getCategoryBySlug(slug: string): Promise<CategoryType | null> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const category = await Category.findOne({ slug }).lean();
      if (category) {
        return sanitize<CategoryType>(category);
      }
    }
  } catch (err) {
    console.error(`Failed to find category [${slug}] in MongoDB:`, err);
  }

  if (adminStore && adminStore.categories) {
    const found = adminStore.categories.find((c) => c.slug === slug);
    if (found) {
      return sanitize<CategoryType>(found);
    }
  }

  return STATIC_CATEGORIES.find((c) => c.slug === slug) || null;
}

export async function getProductsByCategory(categorySlug: string): Promise<ProductType[]> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const products = await Product.find({ categorySlug }).lean();
      if (products && products.length > 0) {
        return sanitize<ProductType[]>(products);
      }
    }
  } catch (err) {
    console.error(`Failed to find products for category [${categorySlug}] in MongoDB:`, err);
  }

  if (adminStore && adminStore.products) {
    const filtered = adminStore.products.filter((p) => p.categorySlug === categorySlug);
    if (filtered.length > 0) {
      return sanitize<ProductType[]>(filtered);
    }
  }

  return STATIC_PRODUCTS.filter((p) => p.categorySlug === categorySlug);
}
