import { backendJson, isDemo } from "./backend";
import { PRODUCTS, CATEGORIES, type Product, type Category } from "@/data/products";

export async function getAllProducts(): Promise<Product[]> {
  if (isDemo()) return PRODUCTS;
  return (await backendJson<{ data: Product[] }>("/api/products"))?.data || [];
}
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isDemo()) return PRODUCTS.find((p) => p.slug === slug) || null;
  return (await backendJson<{ data: Product }>(`/api/products/${encodeURIComponent(slug)}`))?.data || null;
}
export async function getAllCategories(): Promise<Category[]> {
  if (isDemo()) return CATEGORIES;
  return (await backendJson<{ categories: Category[] }>("/api/categories"))?.categories || [];
}
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return (await getAllCategories()).find((c) => c.slug === slug) || null;
}
export async function getProductsByCategory(slug: string): Promise<Product[]> {
  if (isDemo()) return PRODUCTS.filter((p) => p.categorySlug === slug);
  return (await backendJson<{ data: Product[] }>(`/api/products?category=${encodeURIComponent(slug)}`))?.data || [];
}
