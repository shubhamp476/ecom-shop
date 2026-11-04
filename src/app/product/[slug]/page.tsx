export const dynamic = "force-dynamic";
import { PRODUCTS } from "@/data/products";
import { getProductBySlug } from "@/lib/data-service";
import ProductClient from "./ProductClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PRODUCTS.map((prod) => ({
    slug: prod.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found - Givolt" };

  return {
    title: `${product.name} | Givolt Electronics`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}

async function ProductContent({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductClient product={product} />;
}

export default function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f2f1ed]" />}>
      <ProductContent params={params} />
    </Suspense>
  );
}
