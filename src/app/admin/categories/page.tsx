"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Package,
  ChevronRight,
  ChevronDown,
  CornerDownRight,
  LayoutGrid,
  ListTree,
} from "lucide-react";
import { ICategory } from "@/models/Category";

interface CategoryTreeNode extends ICategory {
  children: CategoryTreeNode[];
  depth: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"tree" | "grid">("tree");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("/assets/69d13b078880cdeb9b2b2fc9_2.avif");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [specTemplate, setSpecTemplate] = useState("Display, Processor, Battery, Connectivity");
  const [toast, setToast] = useState<string | null>(null);

  // Collapsed branches state for Tree view
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success) {
        setCategories(json.categories);
        // Expand all top-level nodes by default
        const initExpanded: Record<string, boolean> = {};
        json.categories.forEach((c: ICategory) => {
          initExpanded[c.slug] = true;
        });
        setExpandedNodes(initExpanded);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Build Hierarchical Tree
  const treeData = useMemo(() => {
    const map = new Map<string, CategoryTreeNode>();
    categories.forEach((cat) => {
      map.set(cat.slug, { ...cat, children: [], depth: 0 });
    });

    const roots: CategoryTreeNode[] = [];
    categories.forEach((cat) => {
      const node = map.get(cat.slug);
      if (!node) return;
      if (cat.parentId && map.has(cat.parentId)) {
        const parent = map.get(cat.parentId)!;
        node.depth = parent.depth + 1;
        parent.children.push(node);
      } else {
        node.depth = 0;
        roots.push(node);
      }
    });

    return roots;
  }, [categories]);

  // Flatten tree for indented Parent Selector dropdown
  const flatCategoryOptions = useMemo(() => {
    const result: { slug: string; name: string; depth: number }[] = [];
    function traverse(list: CategoryTreeNode[]) {
      for (const node of list) {
        result.push({ slug: node.slug, name: node.name, depth: node.depth });
        if (node.children.length > 0) {
          traverse(node.children);
        }
      }
    }
    traverse(treeData);
    return result;
  }, [treeData]);

  // Helper to open modal for adding a subcategory under a specific parent
  const handleOpenAddSubcategory = (targetParentSlug: string) => {
    setModalMode("create");
    setEditingSlug(null);
    setName("");
    setSlug("");
    setParentId(targetParentSlug);
    setDescription("");
    setImage("/assets/69d13b078880cdeb9b2b2fc9_2.avif");
    setStatus("Active");
    setSpecTemplate("Processor, Display, Battery, Connectivity");
    setShowModal(true);
  };

  // Open modal for root category
  const handleOpenAddRoot = () => {
    setModalMode("create");
    setEditingSlug(null);
    setName("");
    setSlug("");
    setParentId(null);
    setDescription("");
    setImage("/assets/69d13b078880cdeb9b2b2fc9_2.avif");
    setStatus("Active");
    setSpecTemplate("Processor, Display, Battery, Connectivity");
    setShowModal(true);
  };

  // Open modal for editing
  const handleOpenEdit = (cat: ICategory) => {
    setModalMode("edit");
    setEditingSlug(cat.slug);
    setName(cat.name);
    setSlug(cat.slug);
    setParentId(cat.parentId || null);
    setDescription(cat.description || "");
    setImage(cat.image || "/assets/69d13b078880cdeb9b2b2fc9_2.avif");
    setStatus((cat.status as any) || "Active");
    setSpecTemplate((cat.specTemplate || []).join(", "));
    setShowModal(true);
  };

  // Save (Create or Edit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (modalMode === "create") {
        const generatedSlug =
          slug.trim() ||
          name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug: generatedSlug,
            parentId: parentId || null,
            description,
            image,
            status,
            specTemplate: specTemplate.split(",").map((s) => s.trim()).filter(Boolean),
          }),
        });
        const json = await res.json();
        if (json.success) {
          showToast(`Category "${name}" created.`);
          setShowModal(false);
          fetchCategories();
        } else {
          alert(json.error || "Failed to create category");
        }
      } else {
        const res = await fetch("/api/admin/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: editingSlug,
            name,
            parentId: parentId || null,
            description,
            image,
            status,
            specTemplate: specTemplate.split(",").map((s) => s.trim()).filter(Boolean),
          }),
        });
        const json = await res.json();
        if (json.success) {
          showToast(`Category "${name}" updated.`);
          setShowModal(false);
          fetchCategories();
        } else {
          alert(json.error || "Failed to update category");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Category
  const handleDelete = async (catSlug: string, catName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${catName}"? Child subcategories will be safely re-parented.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories?slug=${encodeURIComponent(catSlug)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Category "${catName}" deleted.`);
        fetchCategories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Branch Collapse
  const toggleExpand = (catSlug: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [catSlug]: !prev[catSlug],
    }));
  };

  // Filter Categories by search
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, search]);

  // Find Parent Name Helper
  const getParentName = (pId?: string | null) => {
    if (!pId) return null;
    return categories.find((c) => c.slug === pId)?.name || pId;
  };

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: CategoryTreeNode) => {
    const isExpanded = expandedNodes[node.slug] !== false;
    const hasChildren = node.children.length > 0;
    const parentName = getParentName(node.parentId);

    return (
      <div key={node.slug} className="group/node">
        <div
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition ${
            node.depth === 0
              ? "bg-white dark:bg-[#0f1420] border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700"
              : node.depth === 1
              ? "bg-slate-50/70 dark:bg-[#141a27] border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 ml-4 sm:ml-7"
              : "bg-slate-100/60 dark:bg-[#182032] border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 ml-8 sm:ml-14"
          }`}
        >
          {/* Left: Indicator, Icon & Details */}
          <div className="flex items-center gap-3 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(node.slug)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
                title={isExpanded ? "Collapse branch" : "Expand branch"}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-blue-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>
            ) : (
              <div className="w-6 flex justify-center text-slate-400 shrink-0">
                {node.depth > 0 ? (
                  <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                )}
              </div>
            )}

            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 p-1 flex items-center justify-center shrink-0">
              <img
                src={node.image}
                alt={node.name}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                {node.name}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                /{node.slug}
              </span>
              {node.depth === 0 ? (
                <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 uppercase tracking-wider">
                  Root
                </span>
              ) : (
                <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 truncate max-w-[130px]">
                  Sub of {parentName}
                </span>
              )}
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                  node.status === "Active"
                    ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {node.status}
              </span>
              {hasChildren && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  • {node.children.length} {node.children.length === 1 ? "subcategory" : "subcategories"}
                </span>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Direct "Subcategory" action button */}
            <button
              type="button"
              onClick={() => handleOpenAddSubcategory(node.slug)}
              className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition"
              title={`Add subcategory under ${node.name}`}
            >
              <Plus className="w-3 h-3" />
              <span>Subcategory</span>
            </button>

            {/* View storefront link */}
            <a
              href={`/category/${node.slug}`}
              target="_blank"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="View on storefront"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Edit button */}
            <button
              type="button"
              onClick={() => handleOpenEdit(node)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Edit category"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => handleDelete(node.slug, node.name)}
              className="p-1.5 rounded-lg text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
              title="Delete category"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recursive Child Nodes */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {node.children.map((child) => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-blue-500" />
            <span>Categories & Subcategories</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize store taxonomy, multi-level subcategories, and attribute templates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAddRoot}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search & View Mode Toggle */}
      <div className="p-2.5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700/60 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
                viewMode === "tree"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ListTree className="w-3.5 h-3.5" />
              <span>Tree</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Total: <span className="text-slate-900 dark:text-white font-semibold">{categories.length}</span>
          </div>
        </div>
      </div>

      {/* Content Rendering: Tree View or Grid View */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 animate-pulse flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-2.5 w-24 rounded bg-slate-100 dark:bg-slate-800/60" />
                </div>
              </div>
              <div className="h-6 w-20 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800">
          <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">No categories configured</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Create your first root category to get started.</p>
          <button
            onClick={handleOpenAddRoot}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Category</span>
          </button>
        </div>
      ) : viewMode === "tree" && !search ? (
        /* Systematic Hierarchical Tree View */
        <div className="space-y-1.5 rounded-2xl bg-white dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-slate-800/80 px-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Category Taxonomy</span>
            <span>{categories.length} Categories</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {treeData.map((rootNode) => renderTreeNode(rootNode))}
          </div>
        </div>
      ) : (
        /* Card Grid View (also used when searching) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => {
            const parentName = getParentName(cat.parentId);
            const directChildren = categories.filter((c) => c.parentId === cat.slug);

            return (
              <div
                key={cat.slug}
                className="p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 flex items-center justify-center shrink-0">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{cat.name}</h3>
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-mono block truncate">
                          /{cat.slug}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shrink-0">
                      {cat.status}
                    </span>
                  </div>

                  {/* Hierarchy Parent Badge */}
                  {parentName ? (
                    <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[10px] font-medium">
                      <CornerDownRight className="w-3 h-3" />
                      <span>Subcategory of: <strong>{parentName}</strong></span>
                    </div>
                  ) : (
                    <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-medium">
                      <span>Root Category</span>
                    </div>
                  )}

                  {cat.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                      {cat.description}
                    </p>
                  )}

                  {/* Subcategories preview tags */}
                  {directChildren.length > 0 && (
                    <div className="mb-3">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mb-1">
                        Subcategories ({directChildren.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {directChildren.map((sub) => (
                          <span
                            key={sub.slug}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700"
                          >
                            {sub.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  {/* Direct link to add subcategory under this category */}
                  <button
                    type="button"
                    onClick={() => handleOpenAddSubcategory(cat.slug)}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1 text-xs"
                    title={`Create a subcategory under ${cat.name}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Subcategory</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.slug, cat.name)}
                      className="p-1 rounded text-rose-500 hover:text-rose-700"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={`/category/${cat.slug}`}
                      target="_blank"
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      title="View on storefront"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category & Subcategory Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-700 p-6 shadow-2xl text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {modalMode === "create" ? "Add Category or Subcategory" : `Edit Category: ${name}`}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {parentId
                    ? `Creating nested subcategory under: "${getParentName(parentId)}"`
                    : "Create a root category or select a parent category below."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Android Smartphones, Foldable Phones, Gaming Laptops..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (modalMode === "create" && !slug) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, "")
                      );
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Parent Category Dropdown (Hierarchical Selection) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 dark:text-slate-200 font-semibold">
                    Parent Category / Nesting Option
                  </label>
                  {parentId && (
                    <button
                      type="button"
                      onClick={() => setParentId(null)}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Make Top-Level (None)
                    </button>
                  )}
                </div>
                <select
                  value={parentId || ""}
                  onChange={(e) => setParentId(e.target.value ? e.target.value : null)}
                  className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">[ None - This is a Top-Level / Root Category ]</option>
                  {flatCategoryOptions
                    .filter((opt) => opt.slug !== editingSlug)
                    .map((opt) => (
                      <option key={opt.slug} value={opt.slug}>
                        {"\u00A0\u00A0".repeat(opt.depth * 2)}
                        {opt.depth > 0 ? "↳ " : "📁 "}
                        {opt.name} {opt.depth === 0 ? "(Root)" : `(Depth ${opt.depth})`}
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Choose an existing category to nest this as a subcategory.
                </p>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  URL Slug (Auto-generated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. android-smartphones"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Category overview and hardware characteristics..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Image URL & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Thumbnail Image URL</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Specification Template Tags */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Hardware Specification Template Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Screen Size, Chipset, Storage, Battery, Camera..."
                  value={specTemplate}
                  onChange={(e) => setSpecTemplate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30"
                >
                  {modalMode === "create" ? "Create Category" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
