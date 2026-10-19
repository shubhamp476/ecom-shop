import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product, IProduct } from "@/models/Product";
import { adminStore } from "@/lib/admin-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const category = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const conn = await connectToDatabase();
    let allProducts: IProduct[] = adminStore.products;

    if (conn) {
      const dbProducts = await Product.find({}).lean();
      if (dbProducts && dbProducts.length > 0) {
        allProducts = dbProducts as any;
      }
    }

    // Filter
    let filtered = allProducts.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search) ||
        p.sku?.toLowerCase().includes(search) ||
        p.brand?.toLowerCase().includes(search) ||
        p.category?.toLowerCase().includes(search);

      const matchesCat = !category || p.categorySlug === category || p.category === category;
      const matchesBrand = !brand || p.brandSlug === brand || p.brand === brand;
      const matchesStatus = !status || p.status === status;

      return matchesSearch && matchesCat && matchesBrand && matchesStatus;
    });

    // Sort
    if (sortBy === "price_asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "stock_low") {
      filtered.sort((a, b) => a.stock - b.stock);
    } else if (sortBy === "name_asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // newest
      filtered.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      products: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, error: "Name, price, and category are required." },
        { status: 400 }
      );
    }

    // Auto-generate slug if not provided
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const sku = body.sku || `GV-${(body.categorySlug || "GEN").slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const mrp = Number(body.mrp) || Number(body.price) * 1.25;
    const price = Number(body.price);
    const costPrice = Number(body.costPrice) || Math.round(price * 0.7 * 100) / 100;
    const discountAmount = Math.max(0, mrp - price);
    const discountPercentage = Math.round((discountAmount / mrp) * 100);
    const stock = Number(body.stock) || 10;

    const newProductData: IProduct = {
      id: `prod_${Date.now()}`,
      name: body.name,
      slug,
      shortDescription: body.shortDescription || body.description?.slice(0, 100) || "",
      description: body.description || "",
      brand: body.brand || "Givolt",
      brandSlug: body.brandSlug || (body.brand || "Givolt").toLowerCase().replace(/\s+/g, "-"),
      category: body.category,
      categorySlug: body.categorySlug || body.category.toLowerCase().replace(/\s+/g, "-"),
      subcategory: body.subcategory,
      productType: body.productType,
      manufacturer: body.manufacturer,
      modelNumber: body.modelNumber,
      sku,
      barcode: body.barcode || `890${Date.now().toString().slice(-9)}`,
      countryOfOrigin: body.countryOfOrigin || "India",
      condition: body.condition || "New",
      status: body.status || "Active",
      featured: Boolean(body.featured),
      newArrival: Boolean(body.newArrival),
      bestSeller: Boolean(body.bestSeller),
      image: body.image || "/assets/69d4a654a45341b80906ff1c_1.avif",
      gallery: body.gallery && body.gallery.length > 0 ? body.gallery : [body.image || "/assets/69d4a654a45341b80906ff1c_1.avif"],
      mrp,
      price,
      costPrice,
      discountAmount,
      discountPercentage,
      taxRate: Number(body.taxRate) || 18,
      hsnCode: body.hsnCode || "85171200",
      currency: body.currency || "INR",
      stock,
      reservedStock: 0,
      availableStock: stock,
      reorderLevel: Number(body.reorderLevel) || 5,
      warehouseLocation: body.warehouseLocation || "Warehouse Mumbai-A",
      weight: Number(body.weight) || 0.5,
      packageWeight: Number(body.packageWeight) || 0.7,
      shippingClass: body.shippingClass || "Standard Electronics",
      isFragile: Boolean(body.isFragile),
      codEligible: body.codEligible !== false,
      freeShipping: price > 50,
      metaTitle: body.metaTitle || `${body.name} - Electronics Store`,
      metaDescription: body.metaDescription || body.description?.slice(0, 150) || "",
      specs: body.specs || [],
      variants: body.variants || [],
      rating: 5,
      reviewsCount: 0,
      inStock: stock > 0,
      createdAt: new Date(),
    };

    const conn = await connectToDatabase();
    if (conn) {
      try {
        const created = await Product.create(newProductData);
        newProductData._id = created._id.toString();
      } catch (err: any) {
        console.warn("DB save failed, saving to in-memory store:", err.message);
      }
    }

    // Always keep in-memory store updated
    adminStore.products.unshift(newProductData);

    // Record activity log
    adminStore.activityLogs.unshift({
      actor: "Super Admin",
      role: "Product Manager",
      action: "PRODUCT_CREATED",
      entity: "Product",
      entityId: newProductData.sku,
      details: `Created product "${newProductData.name}" with SKU ${newProductData.sku} at price ₹${newProductData.price}.`,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Product created successfully!",
      product: newProductData,
    });
  } catch (error: any) {
    console.error("Product POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
