"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import Brands from "@/components/Brands";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";
import DealSection from "@/components/DealSection";
import NewArrivals from "@/components/NewArrivals";
import VideoSection from "@/components/VideoSection";
import Reviews from "@/components/Reviews";
import InstagramGrid from "@/components/InstagramGrid";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const cart = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddToCart = (productName: string) => {
    cart.addToCart({ name: productName }, 1);
    setToastMessage(`Added "${productName}" to cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  return (
    <div className="relative min-h-screen bg-[#f2f1ed] text-neutral-900 selection:bg-blue-600 selection:text-white font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-sm font-semibold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header / Navbar */}
      <Navbar />

      <main>
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Benefits Section */}
        <Benefits />

        {/* 4. Brand Marquee */}
        <Brands />

        {/* 5. Categories Section */}
        <Categories />

        {/* 6. Featured Products Section */}
        <FeaturedProducts onAddToCart={handleAddToCart} />

        {/* 7. Deals & Countdown Section */}
        <DealSection onAddToCart={handleAddToCart} />

        {/* 8. New Arrivals Section */}
        <NewArrivals onAddToCart={handleAddToCart} />

        {/* 9. Video Showcase Banner */}
        <VideoSection />

        {/* 10. Customer Reviews Tabs */}
        <Reviews />

        {/* 11. Follow Us / Instagram Grid */}
        <InstagramGrid />

        {/* 12. Blog News & Articles */}
        <BlogSection />
      </main>

      {/* 13. Footer */}
      <Footer />
    </div>
  );
}
