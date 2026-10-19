import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/admin-store";
import { IProduct } from "@/models/Product";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { csvContent, commit = false } = body;

    if (!csvContent || typeof csvContent !== "string") {
      return NextResponse.json({ success: false, error: "CSV content string is required" }, { status: 400 });
    }

    const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return NextResponse.json({ success: false, error: "CSV must contain a header and at least one data row" }, { status: 400 });
    }

    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const skuIdx = header.findIndex((h) => h.includes("sku"));
    const nameIdx = header.findIndex((h) => h.includes("name"));
    const catIdx = header.findIndex((h) => h.includes("cat"));
    const priceIdx = header.findIndex((h) => h.includes("price") && !h.includes("cost") && !h.includes("mrp"));
    const stockIdx = header.findIndex((h) => h.includes("stock"));

    const validRows: any[] = [];
    const errors: { row: number; error: string; data: string }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // simple csv split ignoring quotes
      const cols = line.split(",").map((c) => c.replace(/^"|"$/g, "").trim());

      const sku = skuIdx !== -1 ? cols[skuIdx] : `GV-IMP-${1000 + i}`;
      const name = nameIdx !== -1 ? cols[nameIdx] : cols[1];
      const category = catIdx !== -1 ? cols[catIdx] : "Smartphones";
      const priceStr = priceIdx !== -1 ? cols[priceIdx] : cols[4];
      const stockStr = stockIdx !== -1 ? cols[stockIdx] : "10";

      if (!name) {
        errors.push({ row: i, error: "Missing product name", data: line });
        continue;
      }

      const price = parseFloat(priceStr);
      if (isNaN(price) || price <= 0) {
        errors.push({ row: i, error: "Invalid price value", data: line });
        continue;
      }

      const stock = parseInt(stockStr, 10);

      validRows.push({
        sku,
        name,
        category,
        price,
        stock: isNaN(stock) ? 10 : stock,
      });
    }

    if (commit && validRows.length > 0) {
      for (const row of validRows) {
        const existingIdx = adminStore.products.findIndex((p) => p.sku === row.sku);
        if (existingIdx !== -1) {
          adminStore.products[existingIdx].name = row.name;
          adminStore.products[existingIdx].price = row.price;
          adminStore.products[existingIdx].stock = row.stock;
        } else {
          const newProduct: IProduct = {
            id: `prod_imp_${Date.now()}_${Math.random()}`,
            name: row.name,
            slug: row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            sku: row.sku,
            category: row.category,
            categorySlug: row.category.toLowerCase().replace(/\s+/g, "-"),
            brand: "Givolt",
            brandSlug: "givolt",
            mrp: Math.round(row.price * 1.25),
            price: row.price,
            stock: row.stock,
            reservedStock: 0,
            availableStock: row.stock,
            condition: "New",
            status: "Active",
            featured: false,
            newArrival: false,
            bestSeller: false,
            image: "/assets/69d4a654a45341b80906ff1c_1.avif",
            gallery: ["/assets/69d4a654a45341b80906ff1c_1.avif"],
            specs: [],
            variants: [],
            currency: "INR",
            rating: 5,
            reviewsCount: 0,
            inStock: row.stock > 0,
            description: `Imported electronic product: ${row.name}`,
            createdAt: new Date(),
          };
          adminStore.products.unshift(newProduct);
        }
      }

      adminStore.activityLogs.unshift({
        actor: "Super Admin",
        role: "Product Manager",
        action: "PRODUCTS_IMPORTED",
        entity: "ImportJob",
        details: `Imported ${validRows.length} products via CSV upload. (${errors.length} errors/skipped)`,
        timestamp: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      committed: commit,
      totalRows: lines.length - 1,
      validCount: validRows.length,
      errorCount: errors.length,
      validRows,
      errors,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process CSV" },
      { status: 500 }
    );
  }
}
