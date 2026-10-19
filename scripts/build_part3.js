const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { sections, processHtml } = require('./converter_utils');

const componentsDir = path.join(__dirname, '..', 'src', 'components');

// ----------------------------------------------------
// 9. Reviews.tsx
// ----------------------------------------------------
console.log('Building Reviews.tsx...');
const reviewsHtml = processHtml(sections[9].html);
const $rev = cheerio.load(reviewsHtml, null, false);

const reviewList = [];
$rev('.w-tab-pane').each((i, el) => {
  const author = $rev(el).find('.review-name, h4, h5, .author').text().trim().replace(/^—\s*/, '');
  const role = $rev(el).find('.review-role, .designation, p.role').text().trim() || 'Verified Buyer';
  const text = $rev(el).find('.review-text, p').first().text().trim();
  const avatar = $rev(el).find('img').first().attr('src') || '';
  if (author && text && !reviewList.some(r => r.author === author)) {
    reviewList.push({ author, role, text, avatar });
  }
});

// Also grab tab avatars
const tabAvatars = [];
$rev('.review-tab-link img, .w-tab-link img').each((i, el) => {
  const src = $rev(el).attr('src');
  if (src && !tabAvatars.includes(src)) {
    tabAvatars.push(src);
  }
});

const reviewsCode = `"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Reviews() {
  const [activeTab, setActiveTab] = useState(0);

  const reviews = ${JSON.stringify(reviewList, null, 2)};
  const avatars = ${JSON.stringify(tabAvatars, null, 2)};

  const current = reviews[activeTab] || reviews[0];

  return (
    <section className="reviews-sectin py-24 bg-[#f2f1ed]">
      <div className="w-layout-blockcontainer container w-container">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
            Testimonials
          </p>
          <h2 className="section-title text-3xl md:text-5xl font-bold text-neutral-900 mb-12">
            What Our Customers Are Saying
          </h2>

          {/* Active Review Quote Card */}
          <div className="w-full bg-white rounded-3xl p-8 md:p-14 shadow-sm border border-black/5 relative min-h-[300px] flex flex-col justify-between mb-10">
            {/* Stars */}
            <div className="flex justify-center gap-1.5 text-amber-400 text-xl mb-6">
              {"★★★★★"}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center"
              >
                <p className="text-xl md:text-2xl text-neutral-800 font-medium leading-relaxed max-w-2xl italic mb-6">
                  {current.text}
                </p>
                <div>
                  <h4 className="text-lg font-bold text-neutral-900">— {current.author}</h4>
                  <p className="text-sm text-neutral-500 mt-0.5">{current.role}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Avatar Tab Selector Row */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            {reviews.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={\`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 transition-all duration-300 cursor-pointer \${
                  activeTab === idx
                    ? "border-blue-600 scale-110 shadow-lg shadow-blue-500/25 ring-4 ring-blue-600/10"
                    : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                }\`}
              >
                <img
                  src={avatars[idx] || item.avatar}
                  alt={item.author}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`;

fs.writeFileSync(path.join(componentsDir, 'Reviews.tsx'), reviewsCode);
console.log('Saved src/components/Reviews.tsx');

// ----------------------------------------------------
// 10. InstagramGrid.tsx
// ----------------------------------------------------
console.log('Building InstagramGrid.tsx...');
const instaHtml = processHtml(sections[10].html);
const $insta = cheerio.load(instaHtml, null, false);

const instaImages = [];
$insta('img').each((i, el) => {
  const src = $insta(el).attr('src');
  if (src && !src.includes('instagram-svgrepo') && !instaImages.includes(src)) {
    instaImages.push(src);
  }
});

const instaCode = `"use client";

import React from "react";
import { motion } from "framer-motion";

export default function InstagramGrid() {
  const images = ${JSON.stringify(instaImages.slice(0, 5), null, 2)};

  return (
    <section className="follow-section py-20 bg-[#f2f1ed] overflow-hidden">
      <div className="w-layout-blockcontainer container w-container mb-12">
        <div className="section-title-box flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
              Community
            </p>
            <h2 className="section-title text-3xl md:text-5xl font-bold text-neutral-900">
              Follow Us @Instagram
            </h2>
          </div>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-neutral-900 font-semibold hover:text-blue-600 transition-colors"
          >
            @givolt.official →
          </a>
        </div>
      </div>

      <div className="w-full px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((img, idx) => (
            <motion.a
              key={idx}
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -6 }}
              className="group relative h-56 sm:h-64 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl bg-neutral-200 block"
            >
              <img
                src={img}
                alt="Instagram Lifestyle"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

fs.writeFileSync(path.join(componentsDir, 'InstagramGrid.tsx'), instaCode);
console.log('Saved src/components/InstagramGrid.tsx');

// ----------------------------------------------------
// 11. BlogSection.tsx
// ----------------------------------------------------
console.log('Building BlogSection.tsx...');
const blogHtml = processHtml(sections[11].html);
const $blog = cheerio.load(blogHtml, null, false);

const blogList = [];
$blog('.blog-box, .w-dyn-item').each((i, el) => {
  const title = $blog(el).find('.blog-title, h3, h4').text().trim();
  const meta = $blog(el).find('.blog-meta, p').first().text().trim() || 'Apr 3, 2026';
  const img = $blog(el).find('img').first().attr('src');
  if (title && img && !blogList.some(b => b.title === title)) {
    blogList.push({ title, meta, img });
  }
});

const blogCode = `"use client";

import React from "react";
import { motion } from "framer-motion";

export default function BlogSection() {
  const blogs = ${JSON.stringify(blogList, null, 2)};

  return (
    <section className="blog-section py-24 bg-[#f2f1ed]">
      <div className="w-layout-blockcontainer container w-container">
        <div className="blog-wrapper">
          <div className="section-title-box flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
                Knowledge & Insights
              </p>
              <h2 className="section-title text-3xl md:text-5xl font-bold text-neutral-900">
                Recent News and Resources
              </h2>
            </div>
            <a
              href="#blogs"
              className="inline-flex items-center gap-2 text-neutral-900 font-semibold hover:text-blue-600 transition-colors"
            >
              View All Articles →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((post, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="blog-box group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-black/5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="blog-image-box h-60 overflow-hidden relative">
                    <img
                      src={post.img}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">
                      <span>{post.meta}</span>
                      <span>•</span>
                      <span>5 min read</span>
                    </div>
                    <h3 className="blog-title text-xl font-bold text-neutral-900 leading-snug group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-neutral-100">
                  <span className="text-sm font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                    Read Story
                  </span>
                  <div className="w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                    →
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`;

fs.writeFileSync(path.join(componentsDir, 'BlogSection.tsx'), blogCode);
console.log('Saved src/components/BlogSection.tsx');

// ----------------------------------------------------
// 12. Footer.tsx
// ----------------------------------------------------
console.log('Building Footer.tsx...');
const footerHtml = processHtml(sections[12].html);
const $ft = cheerio.load(footerHtml, null, false);

const footerLogoSrc = $ft('.footer-bottom img').first().attr('src') || '/assets/69cfa684789fe8d974b2bca8_Givolt..svg';
const socialLogos = [];
$ft('.footer-social img').each((i, el) => {
  socialLogos.push($ft(el).attr('src'));
});

const footerCode = `"use client";

import React, { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const socials = ${JSON.stringify(socialLogos, null, 2)};

  return (
    <footer className="main-footer bg-[#111318] text-white pt-24 pb-12">
      <div className="w-layout-blockcontainer container w-container">
        {/* Newsletter & Main Navigation Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20 border-b border-white/10">
          {/* Newsletter Box (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-white">
                Get Exclusive Deals Before Anyone Else
              </h3>
              <p className="text-gray-400 text-base max-w-md leading-relaxed mb-8">
                Sign up today and receive early access to seasonal discounts, limited gadget drops, and insider updates.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 px-5 py-4 rounded-xl bg-white/5 border border-white/15 text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/30 whitespace-nowrap cursor-pointer"
              >
                {subscribed ? "Subscribed!" : "Get Access"}
              </button>
            </form>
            {subscribed && (
              <p className="text-sm text-green-400 mt-2">
                Thank you! You have been subscribed to exclusive updates.
              </p>
            )}
          </div>

          {/* Links Grid (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h6 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
                Categories
              </h6>
              <div className="flex flex-col gap-3.5 text-sm text-gray-300">
                <a href="/" className="hover:text-blue-400 transition-colors">Home</a>
                <a href="#about" className="hover:text-blue-400 transition-colors">About Us</a>
                <a href="#categories" className="hover:text-blue-400 transition-colors">Collection</a>
                <a href="#shop" className="hover:text-blue-400 transition-colors">Shop</a>
                <a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a>
              </div>
            </div>

            <div>
              <h6 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
                Hardware
              </h6>
              <div className="flex flex-col gap-3.5 text-sm text-gray-300">
                <a href="#shop" className="hover:text-blue-400 transition-colors">Smartphones</a>
                <a href="#shop" className="hover:text-blue-400 transition-colors">Laptops</a>
                <a href="#shop" className="hover:text-blue-400 transition-colors">Smart Home</a>
                <a href="#shop" className="hover:text-blue-400 transition-colors">Audio & Sounds</a>
                <a href="#shop" className="hover:text-blue-400 transition-colors">Gaming Gadgets</a>
              </div>
            </div>

            <div>
              <h6 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
                Utility Pages
              </h6>
              <div className="flex flex-col gap-3.5 text-sm text-gray-300">
                <a href="#license" className="hover:text-blue-400 transition-colors">License</a>
                <a href="#changelog" className="hover:text-blue-400 transition-colors">Changelog</a>
                <a href="#style-guide" className="hover:text-blue-400 transition-colors">Style Guide</a>
                <a href="#privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
                <a href="#terms" className="hover:text-blue-400 transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Logo, Copyright & Social Icons */}
        <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <a href="/" className="inline-block">
              <img src="${footerLogoSrc}" alt="Givolt" className="h-6 object-contain" />
            </a>
            <div className="hidden sm:block w-px h-4 bg-white/20" />
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Givolt Inc. All rights reserved. Reverse-Engineered with REA.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {socials.map((icon, idx) => (
              <a
                key={idx}
                href="https://social.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-blue-600 flex items-center justify-center transition-colors border border-white/10"
              >
                <img src={icon} alt="Social icon" className="w-4 h-4 object-contain filter invert" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
`;

fs.writeFileSync(path.join(componentsDir, 'Footer.tsx'), footerCode);
console.log('Saved src/components/Footer.tsx');
