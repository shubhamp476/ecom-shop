// In-memory persistent state store for instant preview & fallback when MongoDB is unconfigured or in setup state.
// Also synchronizes with MongoDB collections whenever connection is active!

import { IProduct } from "@/models/Product";
import { ICategory } from "@/models/Category";
import { IBrand } from "@/models/Brand";
import { IOrder } from "@/models/Order";
import { ICustomer } from "@/models/Customer";
import { ICoupon } from "@/models/Coupon";
import { ISupplier } from "@/models/Supplier";
import { IInventoryLog } from "@/models/InventoryLog";
import { IActivityLog } from "@/models/ActivityLog";
import { IStoreSettings } from "@/models/StoreSettings";
import { PRODUCTS, CATEGORIES } from "@/data/products";

export interface AdminStoreState {
  products: IProduct[];
  categories: ICategory[];
  brands: IBrand[];
  orders: IOrder[];
  customers: ICustomer[];
  coupons: ICoupon[];
  suppliers: ISupplier[];
  inventoryLogs: IInventoryLog[];
  activityLogs: IActivityLog[];
  settings: IStoreSettings;
}

// Initial default brands
export const INITIAL_BRANDS: IBrand[] = [
  {
    name: "Samsung",
    slug: "samsung",
    logo: "/assets/69d13b078880cdeb9b2b2fc9_2.avif",
    description: "Global leader in smartphones, OLED displays, and smart electronics.",
    website: "https://www.samsung.com",
    countryOfOrigin: "South Korea",
    warrantyPolicy: "1 Year Official Brand Warranty across all authorized service centers.",
    supportEmail: "support@samsung.com",
    supportPhone: "1800-40-7267864",
    status: "Active",
    featured: true,
    productCount: 4,
  },
  {
    name: "Apple",
    slug: "apple",
    logo: "/assets/69d13b3baa611e87c5b41017_10.avif",
    description: "Innovator in personal computing, iPhone, Mac, and Apple Silicon.",
    website: "https://www.apple.com",
    countryOfOrigin: "United States",
    warrantyPolicy: "1 Year AppleCare Warranty with global coverage.",
    supportEmail: "contact@apple.com",
    supportPhone: "1800-165-2775",
    status: "Active",
    featured: true,
    productCount: 3,
  },
  {
    name: "Sony",
    slug: "sony",
    logo: "/assets/69e5d6e34156034a8c64aadd_5.avif",
    description: "Pioneering industry standards in premium audio, noise cancellation, and imaging.",
    website: "https://www.sony.com",
    countryOfOrigin: "Japan",
    warrantyPolicy: "1 Year Standard Replacement Warranty.",
    supportEmail: "help@sony.com",
    status: "Active",
    featured: true,
    productCount: 3,
  },
  {
    name: "Givolt",
    slug: "givolt",
    logo: "/assets/69d4a88b6ec9fb5582a36aeb_1.avif",
    description: "Curated tech store brand crafting high-value electronics and smart home solutions.",
    website: "https://givolt.store",
    countryOfOrigin: "India",
    warrantyPolicy: "2 Years Express Replacement Guarantee.",
    supportEmail: "support@givolt.store",
    status: "Active",
    featured: true,
    productCount: 10,
  },
  {
    name: "Logitech",
    slug: "logitech",
    logo: "/assets/69e5d6cac651252f78781dce_4.avif",
    description: "World renowned manufacturer of mechanical keyboards, mice, and battle-station accessories.",
    website: "https://www.logitech.com",
    countryOfOrigin: "Switzerland",
    warrantyPolicy: "2 Years Limited Hardware Warranty.",
    status: "Active",
    featured: false,
    productCount: 2,
  },
];

// Initial Categories
// Initial Categories with multi-level parent-child hierarchy
export const INITIAL_CATEGORIES: ICategory[] = [
  ...CATEGORIES.map((cat, idx) => ({
    name: cat.name,
    slug: cat.slug,
    parentId: null,
    count: cat.count,
    image: cat.image,
    description: cat.description,
    sortOrder: idx + 1,
    status: "Active" as const,
    specTemplate: ["Processor", "Display", "Battery", "Connectivity", "Warranty"],
  })),
  // Subcategories under Smartphones (Parent: smartphones)
  {
    name: "Android Smartphones",
    slug: "android-smartphones",
    parentId: "smartphones",
    count: "2 items",
    image: "/assets/69d13b078880cdeb9b2b2fc9_2.avif",
    description: "High performance Android devices powered by Qualcomm Snapdragon and MediaTek Dimensity.",
    sortOrder: 10,
    status: "Active",
    specTemplate: ["Processor", "RAM", "Display", "Battery", "Camera"],
  },
  {
    name: "iOS & iPhones",
    slug: "ios-iphones",
    parentId: "smartphones",
    count: "2 items",
    image: "/assets/69d13b078880cdeb9b2b2fc9_2.avif",
    description: "Apple iPhone models with A-series Bionic & Pro chips and Super Retina XDR displays.",
    sortOrder: 11,
    status: "Active",
    specTemplate: ["Bionic Chip", "Display", "Storage", "Battery", "FaceID"],
  },
  // Sub-subcategory under Android Smartphones (Parent: android-smartphones)
  {
    name: "Foldables & Flip Phones",
    slug: "foldables-flip-phones",
    parentId: "android-smartphones",
    count: "1 item",
    image: "/assets/69d13b078880cdeb9b2b2fc9_2.avif",
    description: "Next-generation foldable displays, dual hinge mechanisms, and compact flip form factors.",
    sortOrder: 20,
    status: "Active",
    specTemplate: ["Hinge Type", "Cover Screen", "Main Display", "Flex Mode"],
  },
  {
    name: "Gaming Phones",
    slug: "gaming-phones",
    parentId: "android-smartphones",
    count: "1 item",
    image: "/assets/69d13b078880cdeb9b2b2fc9_2.avif",
    description: "Ultra-high 165Hz refresh rate displays, active vapor chamber cooling, and trigger buttons.",
    sortOrder: 21,
    status: "Active",
    specTemplate: ["Refresh Rate", "Cooling System", "Trigger Buttons", "Battery"],
  },
  // Subcategories under Laptops (Parent: laptops)
  {
    name: "Gaming Laptops",
    slug: "gaming-laptops",
    parentId: "laptops",
    count: "2 items",
    image: "/assets/69d1396a8047ce5fc7b140ba_1.avif",
    description: "Dedicated NVIDIA GeForce RTX graphics cards, mechanical switches, and high-TGP power.",
    sortOrder: 12,
    status: "Active",
    specTemplate: ["GPU", "CPU", "RAM", "Display Refresh", "Storage"],
  },
  {
    name: "Ultrabooks & MacBooks",
    slug: "ultrabooks-macbooks",
    parentId: "laptops",
    count: "2 items",
    image: "/assets/69d1396a8047ce5fc7b140ba_1.avif",
    description: "Featherlight chassis, 18+ hour battery endurance, and color-calibrated creator displays.",
    sortOrder: 13,
    status: "Active",
    specTemplate: ["Weight", "Battery Life", "Processor", "Display Resolution"],
  },
  // Subcategories under Audio & Sounds (Parent: audio-sounds)
  {
    name: "Wireless Earbuds",
    slug: "wireless-earbuds",
    parentId: "audio-sounds",
    count: "2 items",
    image: "/assets/69d13f9c65651c6b2ba9aa86_1.avif",
    description: "True wireless stereo earbuds with active noise cancellation and low-latency gaming modes.",
    sortOrder: 14,
    status: "Active",
    specTemplate: ["Driver Size", "ANC", "Battery Case", "Water Resistance"],
  },
  {
    name: "Noise-Cancelling Headphones",
    slug: "noise-cancelling-headphones",
    parentId: "audio-sounds",
    count: "2 items",
    image: "/assets/69d13f9c65651c6b2ba9aa86_1.avif",
    description: "Over-ear audiophile acoustic chambers with multi-mic ANC and spatial audio tracking.",
    sortOrder: 15,
    status: "Active",
    specTemplate: ["Acoustic Design", "Spatial Audio", "Battery Hours", "Weight"],
  },
];

// Build comprehensive product list from static data
export const INITIAL_PRODUCTS: IProduct[] = PRODUCTS.map((p, idx) => {
  const cost = Math.round(p.price * 0.72 * 100) / 100;
  const mrp = p.originalPrice || Math.round(p.price * 1.25 * 100) / 100;
  const discountAmount = Math.max(0, Math.round((mrp - p.price) * 100) / 100);
  const discountPercentage = Math.round((discountAmount / mrp) * 100);
  const sku = `GV-${p.categorySlug.slice(0, 3).toUpperCase()}-${1000 + idx}`;

  return {
    id: `prod_${idx + 1}`,
    name: p.name,
    slug: p.slug,
    shortDescription: p.description.slice(0, 120) + "...",
    description: p.description,
    brand: p.name.includes("Galaxy") ? "Samsung" : p.name.includes("Retina") ? "Apple" : "Givolt",
    brandSlug: p.name.includes("Galaxy") ? "samsung" : p.name.includes("Retina") ? "apple" : "givolt",
    category: p.category,
    categorySlug: p.categorySlug,
    sku,
    barcode: `890123456${100 + idx}`,
    countryOfOrigin: "India",
    condition: "New",
    status: "Active",
    featured: idx < 6,
    newArrival: idx >= 10 && idx < 15,
    bestSeller: idx % 3 === 0,
    image: p.image,
    gallery: p.gallery || [p.image],
    mrp,
    price: p.price,
    costPrice: cost,
    discountAmount,
    discountPercentage,
    taxRate: 18,
    currency: "INR",
    stock: 15 + (idx % 8) * 4,
    reservedStock: idx % 3,
    availableStock: 15 + (idx % 8) * 4 - (idx % 3),
    reorderLevel: 5,
    warehouseLocation: idx % 2 === 0 ? "Warehouse Mumbai-A" : "Warehouse Bengaluru-B",
    weight: 0.4 + (idx % 5) * 0.3,
    packageWeight: 0.6 + (idx % 5) * 0.3,
    shippingClass: "Standard Electronics",
    isFragile: p.categorySlug === "smartphones" || p.categorySlug === "laptops",
    codEligible: true,
    freeShipping: p.price > 50,
    metaTitle: `${p.name} - Buy Online at Best Price | Givolt`,
    metaDescription: p.description,
    specs: p.specs.map((s) => ({ label: s.label, value: s.value })),
    variants: [
      {
        id: `var_${idx}_1`,
        sku: `${sku}-STD`,
        name: "Standard Edition",
        attributes: { Color: "Midnight Black", Edition: "Standard" },
        mrp,
        price: p.price,
        costPrice: cost,
        stock: 10 + (idx % 4),
        status: "Active",
      },
      {
        id: `var_${idx}_2`,
        sku: `${sku}-PRO`,
        name: "Pro Titanium",
        attributes: { Color: "Titanium Silver", Edition: "Pro" },
        mrp: Math.round(mrp * 1.15),
        price: Math.round(p.price * 1.15),
        costPrice: Math.round(cost * 1.15),
        stock: 5,
        status: "Active",
      },
    ],
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    inStock: true,
    tag: p.tag,
  };
});

// Initial Orders
export const INITIAL_ORDERS: IOrder[] = [
  {
    orderNumber: "GV-92810",
    customer: {
      name: "Rohit Sharma",
      email: "rohit.sharma@example.com",
      phone: "+91 98230 11223",
      shippingAddress: {
        street: "42 Bandra West, Sea View Apts",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400050",
        country: "India",
      },
    },
    items: [
      {
        productId: "prod_1",
        name: "Galaxy S23 Ultra",
        slug: "galaxy-s23-ultra",
        sku: "GV-SMA-1000",
        price: 999.99,
        quantity: 1,
        image: "/assets/69d4a654a45341b80906ff1c_1.avif",
        variantTitle: "Phantom Black - 256GB",
      },
    ],
    subtotal: 999.99,
    tax: 179.99,
    discount: 50.0,
    shipping: 0,
    total: 1129.98,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    fulfillmentStatus: "Delivered",
    trackingNumber: "DTDC-83920199",
    shippingCarrier: "DTDC Express",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
  {
    orderNumber: "GV-92811",
    customer: {
      name: "Pooja Verma",
      email: "pooja.v@example.com",
      phone: "+91 98711 44556",
      shippingAddress: {
        street: "18 Koramangala 4th Block",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560034",
        country: "India",
      },
    },
    items: [
      {
        productId: "prod_3",
        name: "Laptop with Retina",
        slug: "laptop-with-retina",
        sku: "GV-LAP-1002",
        price: 1499.99,
        quantity: 1,
        image: "/assets/69d4a766514e45f3c66b8c46_3.avif",
      },
      {
        productId: "prod_12",
        name: "Bluetooth Speaker",
        slug: "bluetooth-speaker",
        sku: "GV-AUD-1011",
        price: 84.99,
        quantity: 1,
        image: "/assets/69d4a88b6ec9fb5582a36aeb_1.avif",
      },
    ],
    subtotal: 1584.98,
    tax: 285.29,
    discount: 100.0,
    shipping: 0,
    total: 1770.27,
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    fulfillmentStatus: "Shipped",
    trackingNumber: "BLUE-72619022",
    shippingCarrier: "BlueDart",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
  },
  {
    orderNumber: "GV-92812",
    customer: {
      name: "Ananya Iyer",
      email: "ananya.iyer@example.com",
      phone: "+91 99400 33881",
      shippingAddress: {
        street: "75 TTK Road, Alwarpet",
        city: "Chennai",
        state: "Tamil Nadu",
        postalCode: "600018",
        country: "India",
      },
    },
    items: [
      {
        productId: "prod_17",
        name: "Mechanical Keyboard",
        slug: "mechanical-keyboard",
        sku: "GV-GAM-1016",
        price: 109.99,
        quantity: 2,
        image: "/assets/69d4a94dcbcca23bde74e4e6_1.avif",
      },
    ],
    subtotal: 219.98,
    tax: 39.59,
    discount: 0,
    shipping: 0,
    total: 259.57,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    fulfillmentStatus: "Processing",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    orderNumber: "GV-92813",
    customer: {
      name: "Siddharth Malhotra",
      email: "sid.m@example.com",
      phone: "+91 98199 77665",
      shippingAddress: {
        street: "12 Vasant Vihar, Block C",
        city: "New Delhi",
        state: "Delhi",
        postalCode: "110057",
        country: "India",
      },
    },
    items: [
      {
        productId: "prod_10",
        name: "Smart Video Doorbell",
        slug: "smart-video-doorbell",
        sku: "GV-SMA-1009",
        price: 104.99,
        quantity: 1,
        image: "/assets/69d4a80ed530f8cb0d394272_3.avif",
      },
    ],
    subtotal: 104.99,
    tax: 18.89,
    discount: 10.0,
    shipping: 0,
    total: 113.88,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    fulfillmentStatus: "Return Requested",
    customerNotes: "Ordered wrong model, requesting return & exchange.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
  },
];

// Initial Customers
export const INITIAL_CUSTOMERS: ICustomer[] = [
  {
    name: "Rohit Sharma",
    email: "rohit.sharma@example.com",
    phone: "+91 98230 11223",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    totalOrders: 4,
    totalSpent: 3840.5,
    status: "Active",
    tier: "VIP",
    notes: "Prefers flagship smartphone releases and express DTDC delivery.",
  },
  {
    name: "Pooja Verma",
    email: "pooja.v@example.com",
    phone: "+91 98711 44556",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    totalOrders: 3,
    totalSpent: 2650.0,
    status: "Active",
    tier: "Gold",
  },
  {
    name: "Ananya Iyer",
    email: "ananya.iyer@example.com",
    phone: "+91 99400 33881",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    totalOrders: 2,
    totalSpent: 520.0,
    status: "Active",
    tier: "Silver",
  },
  {
    name: "Siddharth Malhotra",
    email: "sid.m@example.com",
    phone: "+91 98199 77665",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    totalOrders: 1,
    totalSpent: 113.88,
    status: "Active",
    tier: "Standard",
  },
  {
    name: "Vikram Kirloskar",
    email: "vikram.k@example.com",
    phone: "+91 98450 67890",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    totalOrders: 5,
    totalSpent: 6420.0,
    status: "Active",
    tier: "VIP",
  },
];

// Initial Coupons
export const INITIAL_COUPONS: ICoupon[] = [
  {
    code: "WELCOME10",
    description: "10% off for first time electronic shoppers",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 50,
    maxDiscountAmount: 100,
    usageLimit: 1000,
    usedCount: 247,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
    status: "Active",
  },
  {
    code: "TECHFEST20",
    description: "Flat ₹500 off on smart gadgets and audio",
    discountType: "fixed",
    discountValue: 500,
    minOrderValue: 2499,
    usageLimit: 500,
    usedCount: 118,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
    status: "Active",
  },
  {
    code: "GAMER50",
    description: "Special ₹1,500 rebate for high-performance gaming rigs",
    discountType: "fixed",
    discountValue: 1500,
    minOrderValue: 9999,
    usageLimit: 200,
    usedCount: 84,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    status: "Active",
  },
];

// Initial Suppliers
export const INITIAL_SUPPLIERS: ISupplier[] = [
  {
    name: "Apex Electronics Wholesale",
    companyName: "Apex Tech Distributors Pvt Ltd",
    email: "procurement@apextech.in",
    phone: "+91 22 2849 5000",
    gstin: "27AABCA1234F1Z8",
    address: "Plot 42, Electronic City Phase 1",
    city: "Mumbai",
    state: "Maharashtra",
    brandsSupplied: ["Samsung", "Apple", "Sony"],
    paymentTerms: "Net 30",
    status: "Active",
    rating: 4.9,
  },
  {
    name: "Shenzhen Sound Components",
    companyName: "Shenzhen Audio Precision Ltd",
    email: "export@sz-soundtech.com",
    phone: "+86 755 8320 9188",
    address: "Bldg 4, High-Tech Industrial Park",
    city: "Shenzhen",
    state: "Guangdong",
    brandsSupplied: ["Givolt", "Logitech"],
    paymentTerms: "Advance / LC",
    status: "Active",
    rating: 4.8,
  },
  {
    name: "Silicon Peripherals India",
    companyName: "Silicon Hardware Supply LLP",
    email: "sales@siliconhardware.in",
    phone: "+91 80 4122 3344",
    gstin: "29AABCS5678G2Z1",
    address: "102 Industrial Suburb, Yeshwanthpur",
    city: "Bengaluru",
    state: "Karnataka",
    brandsSupplied: ["Logitech", "Givolt"],
    paymentTerms: "Net 15",
    status: "Active",
    rating: 4.7,
  },
];

// Initial Inventory Logs
export const INITIAL_INVENTORY_LOGS: IInventoryLog[] = [
  {
    productId: "prod_1",
    productName: "Galaxy S23 Ultra",
    sku: "GV-SMA-1000",
    type: "stock_in",
    quantityChange: 25,
    previousStock: 0,
    newStock: 25,
    reason: "Initial Purchase Order #PO-1001 from Apex Tech",
    actor: "Inventory Manager",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
  {
    productId: "prod_1",
    productName: "Galaxy S23 Ultra",
    sku: "GV-SMA-1000",
    type: "order",
    quantityChange: -1,
    previousStock: 25,
    newStock: 24,
    reason: "Order Fulfilled #GV-92810",
    actor: "Order System",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    productId: "prod_3",
    productName: "Laptop with Retina",
    sku: "GV-LAP-1002",
    type: "adjustment",
    quantityChange: 10,
    previousStock: 8,
    newStock: 18,
    reason: "Quarterly stock audit reconciliation",
    actor: "Super Admin",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
  },
];

// Initial Activity Logs
export const INITIAL_ACTIVITY_LOGS: IActivityLog[] = [
  {
    actor: "Super Admin",
    role: "Super Admin",
    action: "STORE_INITIALIZED",
    entity: "System",
    details: "Initialized Givolt Electronics Store admin dashboard and database collections.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
  {
    actor: "Super Admin",
    role: "Product Manager",
    action: "PRODUCT_CATALOG_SYNCED",
    entity: "Product",
    details: "Synchronized 20 electronics products across 5 categories with dynamic specs.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    actor: "Order Supervisor",
    role: "Order Manager",
    action: "ORDER_STATUS_CHANGED",
    entity: "Order",
    entityId: "GV-92811",
    details: "Updated order #GV-92811 status to 'Shipped' via BlueDart (Tracking: BLUE-72619022).",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
];

// Default Store Settings
export const DEFAULT_SETTINGS: IStoreSettings = {
  storeName: "Givolt Electronics Store",
  storeTagline: "Engineered for Performance & Everyday Excellence",
  currency: "INR",
  currencySymbol: "₹",
  defaultTaxRate: 18,
  lowStockThreshold: 5,
  freeShippingThreshold: 50,
  defaultShippingCost: 0,
  codEnabled: true,
  supportEmail: "support@givolt.store",
  supportPhone: "+91 98765 43210",
  orderPrefix: "GV-",
  maintenanceMode: false,
};

// Global in-memory singleton state
declare global {
  // eslint-disable-next-line no-var
  var __adminStore: AdminStoreState | undefined;
}

if (!global.__adminStore) {
  global.__adminStore = {
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    brands: INITIAL_BRANDS,
    orders: INITIAL_ORDERS,
    customers: INITIAL_CUSTOMERS,
    coupons: INITIAL_COUPONS,
    suppliers: INITIAL_SUPPLIERS,
    inventoryLogs: INITIAL_INVENTORY_LOGS,
    activityLogs: INITIAL_ACTIVITY_LOGS,
    settings: DEFAULT_SETTINGS,
  };
} else {
  // Ensure newly added initial subcategories are merged into active memory
  INITIAL_CATEGORIES.forEach((initCat) => {
    if (!global.__adminStore!.categories.some((c) => c.slug === initCat.slug)) {
      global.__adminStore!.categories.push(initCat);
    }
  });

  // Ensure currency is set to INR across existing in-memory store
  if (global.__adminStore.settings.currency === "USD") {
    global.__adminStore.settings.currency = "INR";
    global.__adminStore.settings.currencySymbol = "₹";
  }
  global.__adminStore.products.forEach((p) => {
    if (p.currency === "USD") {
      p.currency = "INR";
    }
  });
}

export const adminStore = global.__adminStore;
