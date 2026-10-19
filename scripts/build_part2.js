const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { sections, processHtml } = require('./converter_utils');

const componentsDir = path.join(__dirname, '..', 'src', 'components');

// ----------------------------------------------------
// 5. FeaturedProducts.tsx
// ----------------------------------------------------
console.log('Building FeaturedProducts.tsx...');
const featHtml = processHtml(sections[5].html);
const $feat = cheerio.load(featHtml, null, false);

const featuredList = [];
$feat('.w-dyn-item').each((i, el) => {
  const title = $feat(el).find('.product-title, h3, h4').text().trim();
  const price = $feat(el).find('.product-price, .price, .w-commerce-commerceprice').text().trim();
  const category = $feat(el).find('.product-category, .badge, p').first().text().trim() || 'Gadgets';
  const img = $feat(el).find('img').first().attr('src');
  if (title && img) {
    featuredList.push({ title, price, category, img });
  }
});

const featuredCode = `"use client";

import React from "react";
import { motion } from "framer-motion";

interface FeaturedProductsProps {
  onAddToCart?: (productName: string) => void;
}

export default function FeaturedProducts({ onAddToCart }: FeaturedProductsProps) {
  const products = ${JSON.stringify(featuredList, null, 2)};

  return (
    <section id="shop" className="product-section pb-zero py-20 bg-[#f2f1ed]">
      <div className="w-layout-blockcontainer container w-container">
        <div className="product-wrapper">
          <div className="section-title-box flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
                Popular Hardware
              </p>
              <h2 className="section-title text-3xl md:text-5xl font-bold text-neutral-900">
                Top Picks Loved by Customers
              </h2>
            </div>
            <a
              href="#shop"
              className="inline-flex items-center gap-2 text-neutral-900 font-semibold hover:text-blue-600 transition-colors"
            >
              View All Products →
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -6 }}
                className="product-card group rounded-3xl bg-white p-6 shadow-sm hover:shadow-2xl border border-black/5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="product-image-box h-64 rounded-2xl bg-neutral-100 flex items-center justify-center p-6 relative overflow-hidden mb-6">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs text-xs font-semibold px-3 py-1 rounded-full text-neutral-800">
                      {item.category}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 mb-2 text-sm">
                    {"★".repeat(5)}
                    <span className="text-xs text-neutral-400 ml-1">(4.9)</span>
                  </div>

                  <h3 className="product-title text-xl font-bold text-neutral-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 mt-4">
                  <span className="product-price text-xl font-extrabold text-neutral-900">
                    {item.price}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onAddToCart) onAddToCart(item.title);
                    }}
                    className="cursor-pointer bg-neutral-900 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors duration-200 shadow-sm"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`;

fs.writeFileSync(path.join(componentsDir, 'FeaturedProducts.tsx'), featuredCode);
console.log('Saved src/components/FeaturedProducts.tsx');

// ----------------------------------------------------
// 6. DealSection.tsx
// ----------------------------------------------------
console.log('Building DealSection.tsx...');
const dealHtml = processHtml(sections[6].html);
const $deal = cheerio.load(dealHtml, null, false);

const dealProducts = [];
$deal('.deal-box, .deal-item, .w-dyn-item').each((i, el) => {
  const title = $deal(el).find('.deal-product-title, h3, h4').text().trim();
  const price = $deal(el).find('.deal-product-price, .price').text().trim();
  const img = $deal(el).find('img').first().attr('src');
  if (title && img && !dealProducts.some(p => p.title === title)) {
    dealProducts.push({ title, price, img });
  }
});

const dealCode = `"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface DealSectionProps {
  onAddToCart?: (productName: string) => void;
}

export default function DealSection({ onAddToCart }: DealSectionProps) {
  // Target date set to July 10, 2026
  const targetTime = new Date("2026-07-10T23:59:59").getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 45,
    hours: 12,
    minutes: 30,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, targetTime - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  const deals = ${JSON.stringify(dealProducts, null, 2)};

  return (
    <section className="deal-section pb-zero py-24 bg-[#111318] text-white overflow-hidden relative">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-layout-blockcontainer container w-container relative z-10">
        <div className="deal-wrapper flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
            Limited Time Offer
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Exclusive Monthly Deals — Up to 40% Off
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-10 text-lg">
            High-performance hardware at unbeatable prices. Once the timer strikes zero, these offers are gone.
          </p>

          {/* Real-time Countdown Timer */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 min-w-[75px] sm:min-w-[100px] backdrop-blur-md">
              <span className="text-3xl sm:text-5xl font-black text-white">{timeLeft.days}</span>
              <span className="text-xs uppercase tracking-wider text-gray-400 mt-1">Days</span>
            </div>
            <span className="text-3xl sm:text-5xl font-light text-gray-600">:</span>
            <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 min-w-[75px] sm:min-w-[100px] backdrop-blur-md">
              <span className="text-3xl sm:text-5xl font-black text-white">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-xs uppercase tracking-wider text-gray-400 mt-1">Hours</span>
            </div>
            <span className="text-3xl sm:text-5xl font-light text-gray-600">:</span>
            <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 min-w-[75px] sm:min-w-[100px] backdrop-blur-md">
              <span className="text-3xl sm:text-5xl font-black text-white">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-xs uppercase tracking-wider text-gray-400 mt-1">Minutes</span>
            </div>
            <span className="text-3xl sm:text-5xl font-light text-gray-600">:</span>
            <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 min-w-[75px] sm:min-w-[100px] backdrop-blur-md">
              <span className="text-3xl sm:text-5xl font-black text-blue-400">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-xs uppercase tracking-wider text-gray-400 mt-1">Seconds</span>
            </div>
          </div>
        </div>

        {/* Promo Deal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {deals.length > 0 ? (
            deals.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-blue-500/50 transition-all duration-300 backdrop-blur-sm"
              >
                <div>
                  <div className="h-60 rounded-2xl bg-white/5 flex items-center justify-center p-6 mb-6 overflow-hidden">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6">
                  <span className="text-2xl font-black text-blue-400">{item.price || "USD $299.99"}</span>
                  <button
                    type="button"
                    onClick={() => onAddToCart && onAddToCart(item.title)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-600/30"
                  >
                    Claim Deal
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-400">
              Check back soon for new flash deals!
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
`;

fs.writeFileSync(path.join(componentsDir, 'DealSection.tsx'), dealCode);
console.log('Saved src/components/DealSection.tsx');

// ----------------------------------------------------
// 7. NewArrivals.tsx
// ----------------------------------------------------
console.log('Building NewArrivals.tsx...');
const newHtml = processHtml(sections[7].html);
const $new = cheerio.load(newHtml, null, false);

const arrivalsList = [];
$new('.w-dyn-item').each((i, el) => {
  const title = $new(el).find('.product-title, h3, h4').text().trim();
  const price = $new(el).find('.product-price, .price, .w-commerce-commerceprice').text().trim();
  const img = $new(el).find('img').first().attr('src');
  if (title && img) {
    arrivalsList.push({ title, price, img });
  }
});

const newArrivalsCode = `"use client";

import React from "react";
import { motion } from "framer-motion";

interface NewArrivalsProps {
  onAddToCart?: (productName: string) => void;
}

export default function NewArrivals({ onAddToCart }: NewArrivalsProps) {
  const products = ${JSON.stringify(arrivalsList, null, 2)};

  return (
    <section className="product-section py-24 bg-[#f2f1ed]">
      <div className="w-layout-blockcontainer container w-container">
        <div className="product-wrapper">
          <div className="section-title-box flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
                Fresh Inventory
              </p>
              <h2 className="section-title text-3xl md:text-5xl font-bold text-neutral-900">
                Fresh Innovations, Just Arrived
              </h2>
            </div>
            <a
              href="#shop"
              className="inline-flex items-center gap-2 text-neutral-900 font-semibold hover:text-blue-600 transition-colors"
            >
              Browse Full Catalog →
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                whileHover={{ y: -6 }}
                className="product-card group rounded-3xl bg-white p-5 shadow-sm hover:shadow-xl border border-black/5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="product-image-box h-52 rounded-2xl bg-neutral-100 flex items-center justify-center p-4 relative overflow-hidden mb-5">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      New
                    </div>
                  </div>

                  <h3 className="product-title text-lg font-bold text-neutral-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 mt-4">
                  <span className="product-price text-lg font-black text-neutral-900">
                    {item.price}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAddToCart && onAddToCart(item.title)}
                    className="cursor-pointer bg-neutral-900 hover:bg-blue-600 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`;

fs.writeFileSync(path.join(componentsDir, 'NewArrivals.tsx'), newArrivalsCode);
console.log('Saved src/components/NewArrivals.tsx');

// ----------------------------------------------------
// 8. VideoSection.tsx
// ----------------------------------------------------
console.log('Building VideoSection.tsx...');
const videoHtml = processHtml(sections[8].html);
const $video = cheerio.load(videoHtml, null, false);

const videoBgImg = $video('img').first().attr('src') || '/assets/69d1423138afd7f32acf822b_untitled_design_1_.avif';

const videoCode = `"use client";

import React, { useState } from "react";

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="video-section py-20 bg-[#f2f1ed]">
      <div className="w-layout-blockcontainer container w-container">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[420px] md:h-[580px] bg-neutral-950 flex items-center justify-center group cursor-pointer">
          {/* Background Image / Poster */}
          <img
            src="${videoBgImg}"
            alt="Product In Action"
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />

          {/* Centered Pulsing Play Button */}
          <div
            onClick={() => setIsPlaying(true)}
            className="relative z-10 flex flex-col items-center gap-4 cursor-pointer"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl pulse-btn group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-white font-semibold tracking-wide text-base uppercase drop-shadow-md">
              Watch Product Reel
            </span>
          </div>
        </div>
      </div>

      {/* YouTube Modal Popup */}
      {isPlaying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsPlaying(false)}
          />
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl z-10">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/bhoybya39QU?autoplay=1"
              title="Givolt Showcase"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              type="button"
              onClick={() => setIsPlaying(false)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2.5 rounded-full backdrop-blur-xs transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
`;

fs.writeFileSync(path.join(componentsDir, 'VideoSection.tsx'), videoCode);
console.log('Saved src/components/VideoSection.tsx');
