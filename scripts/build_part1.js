const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { sections, processHtml, cleanJsx } = require('./converter_utils');

const componentsDir = path.join(__dirname, '..', 'src', 'components');

// ----------------------------------------------------
// 1. Hero.tsx
// ----------------------------------------------------
console.log('Building Hero.tsx...');
const heroProcessed = processHtml(sections[1].html);
const $hero = cheerio.load(heroProcessed, null, false);

// Extract the 5 hero product images
const heroImages = [];
$hero('.hero-image-box').each((i, el) => {
  const img = $hero(el).find('img').first();
  heroImages.push({
    src: img.attr('src'),
    alt: img.attr('alt') || `Hero Gadget ${i + 1}`,
    className: $hero(el).attr('class')
  });
});

const heroCode = `"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Hero() {
  const images = ${JSON.stringify(heroImages, null, 2)};

  return (
    <section className="hero-section overflow-hidden">
      <div className="w-layout-blockcontainer container w-container">
        <div className="hero-wrapper flex flex-col items-center text-center">
          {/* Main Title with Entrance Motion */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hero-title-box max-w-4xl mx-auto"
          >
            <h1 className="hero-title text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
              Upgrade Your Everyday Tech Experience
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hero-subtext-box max-w-2xl mx-auto mt-6"
          >
            <p className="hero-subtext text-lg md:text-xl text-neutral-600 leading-relaxed font-normal">
              Discover thoughtfully designed gadgets that blend innovation, performance, and style — built to elevate how you live, work, and play.
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="hero-btn-box mt-8"
          >
            <a
              href="#shop"
              className="primary-button group inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-4 rounded-full shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02]"
            >
              <span className="primary-button-text font-semibold tracking-wide">
                Shop the Collection
              </span>
              <span className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Hero Product Images Grid with Staggered Entrance */}
      <div className="hero-image-wrap mt-14 overflow-x-auto pb-4 scrollbar-none">
        <div className="hero-image-grid flex items-end justify-center gap-4 md:gap-6 min-w-max px-6 mx-auto">
          {images.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.4 + index * 0.12,
                ease: [0.16, 1, 0.3, 1]
              }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={\`\${item.className} rounded-3xl overflow-hidden shadow-xl border border-black/5 bg-white flex-shrink-0\`}
            >
              <img
                src={item.src}
                alt={item.alt}
                className="hero-image object-cover w-full h-full"
                loading="eager"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

fs.writeFileSync(path.join(componentsDir, 'Hero.tsx'), heroCode);
console.log('Saved src/components/Hero.tsx');

// ----------------------------------------------------
// 2. Benefits.tsx
// ----------------------------------------------------
console.log('Building Benefits.tsx...');
const benefitsHtml = processHtml(sections[2].html);
const $benefits = cheerio.load(benefitsHtml, null, false);

const benefitCards = [];
$benefits('.benefit-box').each((i, el) => {
  const icon = $benefits(el).find('img').attr('src');
  const title = $benefits(el).find('.benefit-title, h4, h5, h6').text().trim();
  const desc = $benefits(el).find('.benefit-text, p').text().trim();
  benefitCards.push({ icon, title, desc });
});

const benefitsCode = `"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Benefits() {
  const benefits = ${JSON.stringify(benefitCards, null, 2)};

  return (
    <section className="benefit-section pt-zero py-16 bg-[#f2f1ed]">
      <div className="w-layout-blockcontainer container w-container">
        <div className="benefit-wrapper">
          <div className="section-title-box text-center mb-12">
            <h2 className="section-title text-3xl md:text-5xl font-bold text-neutral-900">
              Experience the Difference
            </h2>
          </div>

          <div className="w-layout-grid benefit-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="benefit-box p-8 rounded-3xl bg-white shadow-sm border border-black/5 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="benefit-icon-box w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                  {item.icon ? (
                    <img src={item.icon} alt="" className="benefit-icon w-8 h-8 object-contain" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600" />
                  )}
                </div>
                <h3 className="benefit-title text-xl font-bold text-neutral-900 mb-2">
                  {item.title}
                </h3>
                <p className="benefit-text text-sm text-neutral-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`;

fs.writeFileSync(path.join(componentsDir, 'Benefits.tsx'), benefitsCode);
console.log('Saved src/components/Benefits.tsx');

// ----------------------------------------------------
// 3. Brands.tsx
// ----------------------------------------------------
console.log('Building Brands.tsx...');
const brandsHtml = processHtml(sections[3].html);
const $brands = cheerio.load(brandsHtml, null, false);

const brandLogos = [];
$brands('img').each((i, el) => {
  const src = $brands(el).attr('src');
  if (src && !brandLogos.includes(src)) {
    brandLogos.push(src);
  }
});

const brandsCode = `"use client";

import React from "react";

export default function Brands() {
  const logos = ${JSON.stringify(brandLogos, null, 2)};
  // Duplicate for seamless infinite marquee loop
  const marqueeItems = [...logos, ...logos, ...logos];

  return (
    <section className="client-section pt-zero py-12 overflow-hidden bg-[#f2f1ed]">
      <div className="w-layout-blockcontainer container w-container mb-8">
        <div className="section-title-box text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Trusted by Tech Enthusiasts Worldwide
          </p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden mask-[linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="animate-marquee flex items-center gap-16 py-4">
          {marqueeItems.map((logo, index) => (
            <div key={index} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-300">
              <img src={logo} alt="Brand Partner" className="client-logo h-8 md:h-10 object-contain max-w-[140px]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

fs.writeFileSync(path.join(componentsDir, 'Brands.tsx'), brandsCode);
console.log('Saved src/components/Brands.tsx');

// ----------------------------------------------------
// 4. Categories.tsx
// ----------------------------------------------------
console.log('Building Categories.tsx...');
const catHtml = processHtml(sections[4].html);
const $cat = cheerio.load(catHtml, null, false);

const categories = [];
$cat('.category-box, .cat-box, a.w-inline-block').each((i, el) => {
  const title = $cat(el).find('.category-title, h3, h4, h5').text().trim();
  const count = $cat(el).find('.category-items-count, .category-count, p').text().trim();
  const img = $cat(el).find('img').attr('src');
  if (title && img && !categories.some(c => c.title === title)) {
    categories.push({ title, count, img });
  }
});

const categoriesCode = `"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Categories() {
  const categories = ${JSON.stringify(categories, null, 2)};

  return (
    <section id="categories" className="category-section p-zero py-20 bg-[#f2f1ed]">
      <div className="w-layout-blockcontainer container w-container">
        <div className="category-wrapper">
          <div className="section-title-box flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
                Curated Collections
              </p>
              <h2 className="section-title text-3xl md:text-5xl font-bold text-neutral-900">
                Meet Your Next Favorite Gadget
              </h2>
            </div>
            <a
              href="#shop"
              className="inline-flex items-center gap-2 text-neutral-900 font-semibold hover:text-blue-600 transition-colors"
            >
              Explore Featured Picks →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-2xl border border-black/5 transition-all duration-300"
              >
                <div className="h-64 sm:h-72 overflow-hidden bg-neutral-100 flex items-center justify-center p-6">
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-sm text-neutral-500 mt-1">
                      {cat.count || "Explore collection"}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-neutral-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                    →
                  </div>
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

fs.writeFileSync(path.join(componentsDir, 'Categories.tsx'), categoriesCode);
console.log('Saved src/components/Categories.tsx');
