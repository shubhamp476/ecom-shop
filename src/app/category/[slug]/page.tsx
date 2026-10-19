import { CATEGORIES } from "@/data/products";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/data-service";
import CategoryClient from "./CategoryClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found - Givolt" };

  return {
    title: `${category.name} - Givolt Tech Store`,
    description: category.description,
  };
}

async function CategoryContent({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(slug);
  return <CategoryClient category={category} products={products} />;
}

export default function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f2f1ed]" />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}
