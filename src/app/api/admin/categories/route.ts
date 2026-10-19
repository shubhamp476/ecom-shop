import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Category, ICategory } from "@/models/Category";
import { adminStore } from "@/lib/admin-store";

export async function GET(request: NextRequest) {
  try {
    const conn = await connectToDatabase();
    let categories: ICategory[] = adminStore.categories;

    if (conn) {
      try {
        const dbCats = await Category.find({}).sort({ sortOrder: 1 }).lean();
        if (dbCats && dbCats.length > 0) categories = dbCats as any;
      } catch (e) {
        // Fallback to in-memory store
      }
    }

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const rawSlug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    // Ensure unique slug
    let slug = rawSlug;
    let counter = 1;
    while (adminStore.categories.some((c) => c.slug === slug)) {
      slug = `${rawSlug}-${counter++}`;
    }

    const parentId = body.parentId && body.parentId.trim() ? body.parentId.trim() : null;

    const newCat: ICategory = {
      name: body.name.trim(),
      slug,
      parentId,
      count: "0 items",
      image: body.image || "/assets/69d13b078880cdeb9b2b2fc9_2.avif",
      bannerImage: body.bannerImage || "",
      description: body.description || "",
      sortOrder: Number(body.sortOrder) || adminStore.categories.length + 1,
      status: body.status || "Active",
      specTemplate: body.specTemplate && body.specTemplate.length > 0
        ? body.specTemplate
        : ["Processor", "Display", "Battery", "Connectivity"],
      createdAt: new Date(),
    };

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Category.create(newCat);
      } catch (e) {
        // Fallback to store
      }
    }

    adminStore.categories.push(newCat);

    const parentName = parentId
      ? adminStore.categories.find((c) => c.slug === parentId)?.name || parentId
      : "Root";

    adminStore.activityLogs.unshift({
      actor: "Super Admin",
      role: "Product Manager",
      action: "CATEGORY_CREATED",
      entity: "Category",
      entityId: newCat.slug,
      details: parentId
        ? `Created subcategory "${newCat.name}" under parent "${parentName}".`
        : `Created root category "${newCat.name}".`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, category: newCat });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Category slug is required to update" },
        { status: 400 }
      );
    }

    const idx = adminStore.categories.findIndex((c) => c.slug === slug);
    if (idx === -1) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const existing = adminStore.categories[idx];
    const updated: ICategory = {
      ...existing,
      name: body.name !== undefined ? body.name : existing.name,
      parentId: body.parentId !== undefined ? (body.parentId || null) : existing.parentId,
      description: body.description !== undefined ? body.description : existing.description,
      status: body.status !== undefined ? body.status : existing.status,
      image: body.image !== undefined ? body.image : existing.image,
      specTemplate: body.specTemplate !== undefined ? body.specTemplate : existing.specTemplate,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : existing.sortOrder,
      updatedAt: new Date(),
    };

    adminStore.categories[idx] = updated;

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Category.findOneAndUpdate({ slug }, updated, { new: true });
      } catch (e) {}
    }

    adminStore.activityLogs.unshift({
      actor: "Super Admin",
      role: "Product Manager",
      action: "CATEGORY_UPDATED",
      entity: "Category",
      entityId: slug,
      details: `Updated category "${updated.name}".`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Category slug is required" },
        { status: 400 }
      );
    }

    const catIndex = adminStore.categories.findIndex((c) => c.slug === slug);
    if (catIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const deletedCat = adminStore.categories[catIndex];
    adminStore.categories.splice(catIndex, 1);

    // Re-parent direct children to the deleted category's parent (or null)
    adminStore.categories.forEach((c) => {
      if (c.parentId === slug) {
        c.parentId = deletedCat.parentId || null;
      }
    });

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Category.findOneAndDelete({ slug });
        await Category.updateMany({ parentId: slug }, { parentId: deletedCat.parentId || null });
      } catch (e) {}
    }

    adminStore.activityLogs.unshift({
      actor: "Super Admin",
      role: "Product Manager",
      action: "CATEGORY_DELETED",
      entity: "Category",
      entityId: slug,
      details: `Deleted category "${deletedCat.name}".`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
