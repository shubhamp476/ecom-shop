"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  DollarSign,
  Cpu,
  Layers,
  Boxes,
  Globe,
  CheckCircle,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
  FolderTree,
  CornerDownRight,
  Check,
  ChevronRight,
  X,
  Copy,
  Zap,
  IndianRupee,
} from "lucide-react";
import { IProduct, ISpecItem, IProductVariant } from "@/models/Product";
import { ICategory } from "@/models/Category";

interface ProductFormProps {
  initialData?: Partial<IProduct>;
  isEdit?: boolean;
  productId?: string;
}

const TABS = [
  { id: "basic", label: "Basics", icon: Layers, shortLabel: "Info" },
  { id: "media", label: "Media", icon: ImageIcon, shortLabel: "Images" },
  { id: "pricing", label: "Pricing", icon: IndianRupee, shortLabel: "Price" },
  { id: "specs", label: "Specs", icon: Cpu, shortLabel: "Specs" },
  { id: "variants", label: "Variants", icon: Layers, shortLabel: "SKUs" },
  { id: "inventory", label: "Inventory", icon: Boxes, shortLabel: "Stock" },
  { id: "seo", label: "SEO", icon: Globe, shortLabel: "Meta" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function ProductForm({ initialData, isEdit = false, productId }: ProductFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [visitedTabs, setVisitedTabs] = useState<Set<TabId>>(new Set(["basic"]));

  // Form State
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [brand, setBrand] = useState(initialData?.brand || "Givolt");
  const [category, setCategory] = useState(initialData?.category || "Smartphones");
  const [categorySlug, setCategorySlug] = useState(initialData?.categorySlug || "smartphones");
  const [subcategory, setSubcategory] = useState(initialData?.subcategory || "");
  const [productType, setProductType] = useState(initialData?.productType || "");
  const [allCategories, setAllCategories] = useState<ICategory[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.categories) {
          setAllCategories(json.categories);
        }
      })
      .catch((err) => console.error("Failed to load categories in ProductForm", err));
  }, []);

  const [modelNumber, setModelNumber] = useState(initialData?.modelNumber || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [barcode, setBarcode] = useState(initialData?.barcode || "");
  const [condition, setCondition] = useState<"New" | "Refurbished" | "Used">(initialData?.condition || "New");
  const [status, setStatus] = useState<"Draft" | "Active" | "Inactive" | "Archived" | "Out of Stock">(
    initialData?.status || "Active"
  );
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [featured, setFeatured] = useState(Boolean(initialData?.featured));
  const [newArrival, setNewArrival] = useState(Boolean(initialData?.newArrival));
  const [bestSeller, setBestSeller] = useState(Boolean(initialData?.bestSeller));

  // Media
  const [image, setImage] = useState(initialData?.image || "/assets/69d4a654a45341b80906ff1c_1.avif");
  const [gallery, setGallery] = useState<string[]>(
    initialData?.gallery && initialData.gallery.length > 0
      ? initialData.gallery
      : ["/assets/69d4a654a45341b80906ff1c_1.avif"]
  );
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  // Pricing
  const [mrp, setMrp] = useState<number>(initialData?.mrp || 999);
  const [price, setPrice] = useState<number>(initialData?.price || 799);
  const [costPrice, setCostPrice] = useState<number>(initialData?.costPrice || 550);
  const [taxRate, setTaxRate] = useState<number>(initialData?.taxRate || 18);
  const [hsnCode, setHsnCode] = useState(initialData?.hsnCode || "85171200");

  // Dynamic Specs
  const [specs, setSpecs] = useState<ISpecItem[]>(
    initialData?.specs && initialData.specs.length > 0
      ? initialData.specs
      : [
          { label: "Display", value: '6.7-inch Super AMOLED, 120Hz' },
          { label: "Processor", value: "Octa-core 3.2GHz Chipset" },
          { label: "RAM & Storage", value: "8GB RAM + 128GB Storage" },
          { label: "Battery", value: "5000 mAh Fast Charge" },
        ]
  );
  const [newSpecLabel, setNewSpecLabel] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  // Variants
  const [variants, setVariants] = useState<IProductVariant[]>(
    initialData?.variants && initialData.variants.length > 0
      ? initialData.variants
      : [
          {
            id: "var_1",
            sku: `${sku || "GV-PRD"}-STD`,
            name: "Standard 8GB / 128GB",
            attributes: { RAM: "8GB", Storage: "128GB" },
            mrp: 999,
            price: 799,
            costPrice: 550,
            stock: 12,
            status: "Active",
          },
        ]
  );

  // Inventory & Shipping
  const [stock, setStock] = useState<number>(initialData?.stock || 15);
  const [reorderLevel, setReorderLevel] = useState<number>(initialData?.reorderLevel || 5);
  const [warehouseLocation, setWarehouseLocation] = useState(initialData?.warehouseLocation || "Warehouse Mumbai-A");
  const [weight, setWeight] = useState<number>(initialData?.weight || 0.45);
  const [codEligible, setCodEligible] = useState(initialData?.codEligible !== false);

  // SEO
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");

  // Submitting state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live Pricing Calculations
  const discountAmount = Math.max(0, mrp - price);
  const discountPercentage = mrp > 0 ? Math.round((discountAmount / mrp) * 100) : 0;
  const grossProfit = Math.round((price - (costPrice || price * 0.7)) * 100) / 100;
  const profitMargin = price > 0 ? Math.round((grossProfit / price) * 100) : 0;

  // Tab Progress
  const activeTabIndex = TABS.findIndex((t) => t.id === activeTab);
  const completionPercentage = Math.round((visitedTabs.size / TABS.length) * 100);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit && !slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
    if (!metaTitle) {
      setMetaTitle(`${val} | Givolt Electronics Store`);
    }
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    const catSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    setCategorySlug(catSlug);

    if (val === "Smartphones") {
      setSpecs([
        { label: "Display", value: '6.7" OLED 120Hz' },
        { label: "Processor", value: "Snapdragon 8 Gen 2 / A16 Bionic" },
        { label: "Rear Camera", value: "50MP Triple Pro Camera" },
        { label: "Battery", value: "5,000 mAh 45W Fast Charging" },
        { label: "OS", value: "Android 14 / iOS" },
      ]);
    } else if (val === "Laptops") {
      setSpecs([
        { label: "Processor", value: "Intel Core i7 / Apple M3 / AMD Ryzen 7" },
        { label: "RAM", value: "16GB Unified / DDR5" },
        { label: "Storage", value: "512GB PCIe NVMe SSD" },
        { label: "Display", value: '14.2" Liquid Retina XDR 120Hz' },
        { label: "Graphics", value: "Dedicated NVIDIA RTX / Apple 10-core GPU" },
      ]);
    } else if (val === "Audio & Sounds") {
      setSpecs([
        { label: "Driver Size", value: "40mm Titanium Acoustic Drivers" },
        { label: "Noise Cancellation", value: "Active Noise Cancellation (ANC)" },
        { label: "Battery Life", value: "40 Hours Playback" },
        { label: "Bluetooth", value: "Bluetooth 5.3 with AAC/aptX" },
      ]);
    }
  };

  const goToTab = (tabId: TabId) => {
    setActiveTab(tabId);
    setVisitedTabs((prev) => new Set(prev).add(tabId));
  };

  const goNext = () => {
    if (activeTabIndex < TABS.length - 1) {
      goToTab(TABS[activeTabIndex + 1].id);
    }
  };

  const goPrev = () => {
    if (activeTabIndex > 0) {
      goToTab(TABS[activeTabIndex - 1].id);
    }
  };

  const addSpec = () => {
    if (newSpecLabel.trim() && newSpecValue.trim()) {
      setSpecs([...specs, { label: newSpecLabel.trim(), value: newSpecValue.trim() }]);
      setNewSpecLabel("");
      setNewSpecValue("");
    }
  };

  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const addGalleryImage = () => {
    if (newGalleryUrl.trim()) {
      setGallery([...gallery, newGalleryUrl.trim()]);
      setNewGalleryUrl("");
    }
  };

  const removeGalleryImage = (idx: number) => {
    setGallery(gallery.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Product Name is required.");
      goToTab("basic");
      return;
    }
    if (!price || price <= 0) {
      setError("Valid Selling Price is required.");
      goToTab("pricing");
      return;
    }

    try {
      setSubmitting(true);
      const payload: Partial<IProduct> = {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        brand,
        brandSlug: brand.toLowerCase().replace(/\s+/g, "-"),
        category,
        categorySlug,
        subcategory: subcategory || undefined,
        productType: productType || undefined,
        modelNumber,
        sku: sku || `GV-${categorySlug.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        barcode: barcode || `890${Date.now().toString().slice(-9)}`,
        condition,
        status,
        shortDescription,
        description,
        featured,
        newArrival,
        bestSeller,
        image,
        gallery,
        mrp,
        price,
        costPrice,
        taxRate,
        hsnCode,
        stock,
        availableStock: stock,
        reorderLevel,
        warehouseLocation,
        weight,
        codEligible,
        specs,
        variants,
        metaTitle,
        metaDescription,
      };

      const url = isEdit && productId ? `/api/admin/products/${productId}` : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save product.");
      }

      setSaveSuccess(true);
      setTimeout(() => router.push("/admin/products"), 800);
    } catch (err: any) {
      setError(err.message || "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  // Input field component for consistency
  const Field = ({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) => (
    <div>
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );

  const inputClass = "w-full bg-white dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition";
  const selectClass = inputClass;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-white dark:bg-[#161c2b] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700/60"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {isEdit ? `Edit: ${name || "Product"}` : "New Product"}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>{completionPercentage}% complete</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span>Step {activeTabIndex + 1} of {TABS.length}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="btn-secondary px-3.5 py-2 rounded-xl text-xs font-semibold transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className={`btn-primary flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/25 transition ${
              saveSuccess ? "bg-emerald-600 hover:bg-emerald-500" : ""
            }`}
          >
            {saveSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEdit ? "Update" : "Publish"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isVisited = visitedTabs.has(tab.id);
          const isPast = i < activeTabIndex;

          return (
            <React.Fragment key={tab.id}>
              <button
                type="button"
                onClick={() => goToTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25"
                    : isPast && isVisited
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent"
                }`}
              >
                {isPast && isVisited ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
              {i < TABS.length - 1 && (
                <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-700 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* 1. BASIC DETAILS */}
        {activeTab === "basic" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Layers className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Product Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Product Name" required>
                <input
                  type="text"
                  required
                  placeholder="e.g. Galaxy S24 Ultra 5G"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="URL Slug" required hint="Auto-generated from name">
                <input
                  type="text"
                  required
                  placeholder="galaxy-s24-ultra-5g"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </Field>

              {/* Category Selection */}
              <Field label="Primary Category" required>
                <div className="flex items-center gap-2">
                  <select
                    value={category}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      const found = allCategories.find((c) => c.name === selectedName);
                      handleCategoryChange(selectedName);
                      if (found) setCategorySlug(found.slug);
                      setSubcategory("");
                      setProductType("");
                    }}
                    className={`${selectClass} flex-1`}
                  >
                    {allCategories.filter((c) => !c.parentId).length > 0 ? (
                      allCategories
                        .filter((c) => !c.parentId)
                        .map((c) => (
                          <option key={c.slug} value={c.name}>{c.name}</option>
                        ))
                    ) : (
                      <>
                        <option value="Smartphones">Smartphones</option>
                        <option value="Laptops">Laptops</option>
                        <option value="Smart Home">Smart Home</option>
                        <option value="Audio & Sounds">Audio & Sounds</option>
                        <option value="Gaming Gadgets">Gaming Gadgets</option>
                      </>
                    )}
                  </select>
                  <Link
                    href="/admin/categories"
                    target="_blank"
                    className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition shrink-0"
                    title="Manage categories"
                  >
                    <FolderTree className="w-4 h-4" />
                  </Link>
                </div>
              </Field>

              {/* Subcategory */}
              <Field label={`Subcategory (${category})`}>
                {(() => {
                  const directSubs = allCategories.filter((c) => c.parentId === categorySlug);
                  return directSubs.length > 0 ? (
                    <select
                      value={subcategory}
                      onChange={(e) => { setSubcategory(e.target.value); setProductType(""); }}
                      className={selectClass}
                    >
                      <option value="">-- Optional --</option>
                      {directSubs.map((sub) => (
                        <option key={sub.slug} value={sub.name}>↳ {sub.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>No subcategories for {category}</span>
                      <Link href="/admin/categories" target="_blank" className="text-blue-500 hover:underline font-medium">+ Create</Link>
                    </div>
                  );
                })()}
              </Field>

              {/* Nested Sub-subcategory */}
              {(() => {
                const selectedSubCat = allCategories.find((c) => c.name === subcategory);
                if (!selectedSubCat) return null;
                const nestedChildren = allCategories.filter((c) => c.parentId === selectedSubCat.slug);
                if (nestedChildren.length === 0) return null;

                return (
                  <Field label={`Type (${subcategory})`}>
                    <select
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">-- Optional --</option>
                      {nestedChildren.map((child) => (
                        <option key={child.slug} value={child.name}>↳ {child.name}</option>
                      ))}
                    </select>
                  </Field>
                );
              })()}

              <Field label="Brand / Manufacturer">
                <input
                  type="text"
                  placeholder="Samsung, Apple, Sony..."
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="SKU" hint="Auto-generated if empty">
                <input
                  type="text"
                  placeholder="GV-SMA-1020"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </Field>

              <Field label="Barcode / EAN">
                <input
                  type="text"
                  placeholder="890123456789"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </Field>

              <Field label="Status">
                <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={selectClass}>
                  <option value="Active">✅ Active (Published)</option>
                  <option value="Draft">📝 Draft (Internal)</option>
                  <option value="Out of Stock">🚫 Out of Stock</option>
                  <option value="Inactive">⏸️ Inactive</option>
                </select>
              </Field>

              <Field label="Condition">
                <select value={condition} onChange={(e) => setCondition(e.target.value as any)} className={selectClass}>
                  <option value="New">🆕 Brand New Sealed</option>
                  <option value="Refurbished">♻️ Certified Refurbished</option>
                  <option value="Used">📦 Pre-Owned / Open Box</option>
                </select>
              </Field>
            </div>

            {/* Description */}
            <Field label="Description">
              <textarea
                rows={3}
                placeholder="Detailed product features and overview..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
              />
            </Field>

            {/* Badges */}
            <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              {[
                { label: "Featured", checked: featured, onChange: setFeatured, emoji: "⭐" },
                { label: "New Arrival", checked: newArrival, onChange: setNewArrival, emoji: "🆕" },
                { label: "Best Seller", checked: bestSeller, onChange: setBestSeller, emoji: "🔥" },
              ].map((badge) => (
                <label key={badge.label} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={badge.checked}
                    onChange={(e) => badge.onChange(e.target.checked)}
                    className="rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{badge.emoji} {badge.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 2. IMAGES & MEDIA */}
        {activeTab === "media" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <ImageIcon className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Product Images</h2>
            </div>

            {/* Primary Image */}
            <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#141a27] border border-slate-200 dark:border-slate-800">
              <img
                src={image}
                alt="Main"
                className="w-24 h-24 rounded-xl object-contain bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-700 flex-shrink-0"
              />
              <div className="flex-1 w-full space-y-2">
                <Field label="Main Image URL">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Quick:</span>
                  {[
                    { label: "Phone", url: "/assets/69d4a654a45341b80906ff1c_1.avif" },
                    { label: "Laptop", url: "/assets/69d4a766514e45f3c66b8c46_3.avif" },
                    { label: "Audio", url: "/assets/69d4a8eeff34e3f332faf8cc_3.avif" },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setImage(preset.url)}
                      className="text-blue-500 hover:underline font-medium"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div>
              <h3 className="text-xs font-semibold text-slate-700 dark:text-white mb-2">
                Gallery ({gallery.length} images)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {gallery.map((imgUrl, idx) => (
                  <div key={idx} className="relative group p-2 rounded-xl bg-slate-50 dark:bg-[#141a27] border border-slate-200 dark:border-slate-800">
                    <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-16 object-contain rounded-lg bg-white dark:bg-slate-900" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition shadow"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste image URL..."
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={addGalleryImage}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-semibold rounded-xl transition"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. PRICING */}
        {activeTab === "pricing" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <IndianRupee className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Pricing & Taxes (INR)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="MRP (Maximum Retail Price)" required>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">₹</span>
                  <input
                    type="number"
                    step="1"
                    required
                    value={mrp}
                    onChange={(e) => setMrp(Number(e.target.value))}
                    className={`${inputClass} pl-7`}
                  />
                </div>
              </Field>

              <Field label="Selling Price" required>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">₹</span>
                  <input
                    type="number"
                    step="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className={`${inputClass} pl-7`}
                  />
                </div>
              </Field>

              <Field label="Cost Price (Procurement)">
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">₹</span>
                  <input
                    type="number"
                    step="1"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className={`${inputClass} pl-7`}
                  />
                </div>
              </Field>
            </div>

            {/* Live Margin Calculator */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50/80 via-white to-emerald-50/80 dark:from-blue-950/30 dark:via-slate-900 dark:to-emerald-950/20 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Discount</span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  ₹{discountAmount.toLocaleString("en-IN")} ({discountPercentage}%)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Gross Profit</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{grossProfit.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Margin</span>
                <span className={`text-sm font-bold ${profitMargin >= 20 ? "text-emerald-600 dark:text-emerald-400" : profitMargin >= 10 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {profitMargin}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">GST Rate</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{taxRate}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="HSN Code">
                <input type="text" placeholder="85171200" value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} className={`${inputClass} font-mono`} />
              </Field>
              <Field label="GST Rate">
                <select value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className={selectClass}>
                  <option value={18}>18% Standard Electronics</option>
                  <option value={12}>12% Accessories</option>
                  <option value={28}>28% Luxury / High-End</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* 4. SPECS */}
        {activeTab === "specs" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Technical Specifications</h2>
              </div>
              <button
                type="button"
                onClick={() => handleCategoryChange(category)}
                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Reset Preset
              </button>
            </div>

            <div className="space-y-2">
              {specs.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#141a27] border border-slate-200 dark:border-slate-800">
                  <span className="w-1/3 text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{s.label}</span>
                  <input
                    type="text"
                    value={s.value}
                    onChange={(e) => {
                      const updated = [...specs];
                      updated[idx].value = e.target.value;
                      setSpecs(updated);
                    }}
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <input
                type="text"
                placeholder="Label (e.g. Refresh Rate)"
                value={newSpecLabel}
                onChange={(e) => setNewSpecLabel(e.target.value)}
                className={`${inputClass} sm:w-1/3`}
              />
              <input
                type="text"
                placeholder="Value (e.g. 144Hz AMOLED)"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSpec(); } }}
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={addSpec}
                className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        )}

        {/* 5. VARIANTS */}
        {activeTab === "variants" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Layers className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Variants & Configurations</h2>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#121826]">
                    <th className="p-2.5 font-medium">Name</th>
                    <th className="p-2.5 font-medium">SKU</th>
                    <th className="p-2.5 font-medium">Price (₹)</th>
                    <th className="p-2.5 font-medium">Stock</th>
                    <th className="p-2.5 font-medium">Status</th>
                    <th className="p-2.5 font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {variants.map((v, idx) => (
                    <tr key={v.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx].name = e.target.value;
                            setVariants(updated);
                          }}
                          className="bg-transparent border-0 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-0 w-full"
                        />
                      </td>
                      <td className="p-2.5 font-mono text-slate-600 dark:text-slate-300">{v.sku}</td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx].price = Number(e.target.value);
                            setVariants(updated);
                          }}
                          className="bg-transparent border-0 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-0 w-20"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx].stock = Number(e.target.value);
                            setVariants(updated);
                          }}
                          className="bg-transparent border-0 text-xs text-emerald-600 dark:text-emerald-400 font-medium focus:outline-none focus:ring-0 w-16"
                        />
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-semibold">
                          {v.status}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <button
                          type="button"
                          onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                          className="p-1 rounded text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={() => {
                const newVar: IProductVariant = {
                  id: `var_${Date.now()}`,
                  sku: `${sku || "GV"}-${variants.length + 1}`,
                  name: `Variant ${variants.length + 1}`,
                  attributes: { Option: `Config ${variants.length + 1}` },
                  mrp: Math.round(mrp * 1.2),
                  price: Math.round(price * 1.2),
                  stock: 10,
                  status: "Active",
                };
                setVariants([...variants, newVar]);
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-white transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Variant
            </button>
          </div>
        )}

        {/* 6. INVENTORY */}
        {activeTab === "inventory" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Boxes className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Inventory & Shipping</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Opening Stock">
                <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className={inputClass} />
              </Field>
              <Field label="Low Stock Alert Level">
                <input type="number" value={reorderLevel} onChange={(e) => setReorderLevel(Number(e.target.value))} className={inputClass} />
              </Field>
              <Field label="Warehouse Location">
                <input type="text" value={warehouseLocation} onChange={(e) => setWarehouseLocation(e.target.value)} className={inputClass} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Weight (kg)">
                <input type="number" step="0.01" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className={inputClass} />
              </Field>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={codEligible}
                    onChange={(e) => setCodEligible(e.target.checked)}
                    className="rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Cash on Delivery (COD) Eligible</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 7. SEO */}
        {activeTab === "seo" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Globe className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">SEO & Meta Tags</h2>
            </div>

            <Field label="Meta Title" hint="Recommended: 50-60 characters">
              <input
                type="text"
                placeholder="Galaxy S24 Ultra - Best Electronics | Givolt"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className={inputClass}
              />
              <div className="text-[10px] text-right text-slate-400 mt-0.5">{metaTitle.length}/60</div>
            </Field>

            <Field label="Meta Description" hint="Recommended: 120-160 characters">
              <textarea
                rows={3}
                placeholder="Compelling summary for Google search listings..."
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className={inputClass}
              />
              <div className="text-[10px] text-right text-slate-400 mt-0.5">{metaDescription.length}/160</div>
            </Field>

            {/* Google Preview */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#141a27] border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Google Preview</span>
              <p className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline cursor-pointer truncate">
                {metaTitle || `${name || "Product Name"} | Givolt Electronics`}
              </p>
              <p className="text-emerald-600 dark:text-emerald-500 text-[11px]">https://givolt.store/product/{slug || "sample-slug"}</p>
              <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2">
                {metaDescription || description || "Discover high-performance electronics and premium gadgets on Givolt."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={goPrev}
          disabled={activeTabIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Previous
        </button>

        <span className="text-[11px] text-slate-400 hidden sm:block">
          All changes saved to database on publish
        </span>

        {activeTabIndex < TABS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Next <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/25 transition"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}</span>
          </button>
        )}
      </div>
    </form>
  );
}
