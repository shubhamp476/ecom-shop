# ecom-shop

Modern, high-performance Electronics E-Commerce platform with an enterprise systematic Admin Management Panel built with Next.js 16, TypeScript, Tailwind CSS, and MongoDB.

---

## 🌟 Key Features

### 🛍️ Storefront
- **Dynamic Category & Sub-Category Browsing**: Explore smartphones, laptops, smart TVs, audio gear, and more.
- **Product Details & Variants**: High-resolution image galleries, spec sheets, stock tracking, and INR (`₹`) pricing.
- **Responsive Navigation**: Seamless mobile drawer, rich desktop header, and instant search.
- **Cart & Checkout Experience**: Fluid add-to-cart, cart drawer, and interactive checkout flows.

### ⚙️ Systematic Admin Panel (`/admin`)
- **Executive Dashboard**: Real-time sales metrics, revenue analytics, quick-add product drawer, and recent order feeds.
- **Comprehensive Product Catalog**:
  - Multi-step product builder with live validation.
  - Category and multi-tier sub-category management.
  - Inline quick-edit for stock, prices (in INR `₹`), and publication statuses.
  - Bulk actions (publish, draft, discount, export).
- **Categories & Hierarchy**: Create parent categories and nested sub-categories dynamically.
- **Inventory & Pricing Engine**: Bulk price adjustments, stock threshold alerts, and supplier management.
- **Light & Dark Mode**: Handcrafted high-contrast light and sleek dark mode themes with smooth transitions.
- **Command Palette (`⌘K`)**: Quick navigation and instant admin actions anywhere in the panel.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18+ or Node.js 20+
- npm / yarn / pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shubhamp476/ecom-shop.git
   cd ecom-shop
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ecom-shop?retryWrites=true&w=majority
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   ```
   *(Note: The admin panel includes a seamless in-memory fallback store if MongoDB is not connected during local development).*

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open in Browser**:
   - Storefront: [http://localhost:3000](http://localhost:3000)
   - Admin Panel: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS custom design tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database**: [MongoDB](https://www.mongodb.com/) via Mongoose with resilient in-memory fallback
- **State Management**: React Hooks & Context API

---

## 📦 Build for Production

```bash
npm run build
npm run start
```

---

## 📄 License
MIT
