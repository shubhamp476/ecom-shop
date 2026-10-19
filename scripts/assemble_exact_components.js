const fs = require('fs');
const path = require('path');

const sections = JSON.parse(fs.readFileSync('scripts/exact_sections.json', 'utf8'));
const componentsDir = path.join(__dirname, '..', 'src', 'components');

// Function to clean up JSX and make it 100% valid React TSX
function cleanForTsx(jsxStr) {
  let s = jsxStr;
  
  // Strip any inline <style> tags (styles belong in globals.css)
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/style=\{\{\}\}/g, '');
  
  // Fix boolean or unquoted attributes
  s = s.replace(/\bmaxlength="([^"]*)"/g, 'maxLength={$1}');
  s = s.replace(/\bminlength="([^"]*)"/g, 'minLength={$1}');
  s = s.replace(/autofocus=""/g, 'autoFocus');
  s = s.replace(/required=""/g, 'required');
  s = s.replace(/readonly=""/g, 'readOnly');
  s = s.replace(/disabled=""/g, 'disabled');
  s = s.replace(/checked=""/g, 'checked');

  // Fix aria-current="page"
  // Fix data-wf-* and data-w-id attributes (they are valid HTML5/React data attributes)

  // Fix any unescaped quotes inside text or entities
  s = s.replace(/&quot;/g, '"');
  s = s.replace(/&amp;/g, '&');
  s = s.replace(/&lt;/g, '<');
  s = s.replace(/&gt;/g, '>');
  s = s.replace(/&#39;/g, "'");

  return s;
}

// -----------------------------------------------------------------
// 1. Hero.tsx (Section 1)
// -----------------------------------------------------------------
console.log('Writing Hero.tsx...');
const heroJsx = cleanForTsx(sections[1].jsx);
const heroCode = `"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      ${heroJsx}
    </motion.div>
  );
}
`;
fs.writeFileSync(path.join(componentsDir, 'Hero.tsx'), heroCode);

// -----------------------------------------------------------------
// 2. Benefits.tsx (Section 2)
// -----------------------------------------------------------------
console.log('Writing Benefits.tsx...');
const benefitsJsx = cleanForTsx(sections[2].jsx);
const benefitsCode = `"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Benefits() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
    >
      ${benefitsJsx}
    </motion.div>
  );
}
`;
fs.writeFileSync(path.join(componentsDir, 'Benefits.tsx'), benefitsCode);

// -----------------------------------------------------------------
// 3. Brands.tsx (Section 3)
// -----------------------------------------------------------------
console.log('Writing Brands.tsx...');
const brandsJsx = cleanForTsx(sections[3].jsx);
const brandsCode = `"use client";

import React from "react";

export default function Brands() {
  return (
    <div className="overflow-hidden">
      ${brandsJsx}
    </div>
  );
}
`;
fs.writeFileSync(path.join(componentsDir, 'Brands.tsx'), brandsCode);

// -----------------------------------------------------------------
// 4. Categories.tsx (Section 4)
// -----------------------------------------------------------------
console.log('Writing Categories.tsx...');
let catJsx = cleanForTsx(sections[4].jsx);
// Ensure hrefs point to /category/...
catJsx = catJsx.replace(/href="\/category\/smartphones"/g, 'href="/category/smartphones"');
const categoriesCode = `"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Categories() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
    >
      ${catJsx}
    </motion.div>
  );
}
`;
fs.writeFileSync(path.join(componentsDir, 'Categories.tsx'), categoriesCode);

// -----------------------------------------------------------------
// 5. FeaturedProducts.tsx (Section 5)
// -----------------------------------------------------------------
console.log('Writing FeaturedProducts.tsx...');
let featJsx = cleanForTsx(sections[5].jsx);
const featCode = `"use client";

import React from "react";
import { motion } from "framer-motion";

interface FeaturedProps {
  onAddToCart?: (title: string) => void;
}

export default function FeaturedProducts({ onAddToCart }: FeaturedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
    >
      ${featJsx}
    </motion.div>
  );
}
`;
fs.writeFileSync(path.join(componentsDir, 'FeaturedProducts.tsx'), featCode);

// -----------------------------------------------------------------
// 6. DealSection.tsx (Section 6)
// -----------------------------------------------------------------
console.log('Writing DealSection.tsx...');
let dealJsx = cleanForTsx(sections[6].jsx);

const dealCode = `"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface DealProps {
  onAddToCart?: (title: string) => void;
}

export default function DealSection({ onAddToCart }: DealProps) {
  const TARGET_TIMESTAMP = 1783727999000;

  const [timeLeft, setTimeLeft] = useState({
    days: 45,
    hours: 12,
    minutes: 30,
    seconds: 15,
  });

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, TARGET_TIMESTAMP - now);

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });

      // Update any DOM elements with .days, .hours, .minutes, .seconds
      document.querySelectorAll(".days").forEach(el => (el as HTMLElement).innerText = String(d));
      document.querySelectorAll(".hours").forEach(el => (el as HTMLElement).innerText = String(h).padStart(2, "0"));
      document.querySelectorAll(".minutes").forEach(el => (el as HTMLElement).innerText = String(m).padStart(2, "0"));
      document.querySelectorAll(".seconds").forEach(el => (el as HTMLElement).innerText = String(s).padStart(2, "0"));
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
    >
      ${dealJsx}
    </motion.div>
  );
}
`;
fs.writeFileSync(path.join(componentsDir, 'DealSection.tsx'), dealCode);

// -----------------------------------------------------------------
// 7. NewArrivals.tsx (Section 7)
// -----------------------------------------------------------------
console.log('Writing NewArrivals.tsx...');
let arrivalsJsx = cleanForTsx(sections[7].jsx);
const arrivalsCode = `"use client";

import React from "react";
import { motion } from "framer-motion";

interface ArrivalsProps {
  onAddToCart?: (title: string) => void;
}

export default function NewArrivals({ onAddToCart }: ArrivalsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
    >
      ${arrivalsJsx}
    </motion.div>
  );
}
`;
fs.writeFileSync(path.join(componentsDir, 'NewArrivals.tsx'), arrivalsCode);

// -----------------------------------------------------------------
// 8. VideoSection.tsx (Section 8)
// -----------------------------------------------------------------
console.log('Writing VideoSection.tsx...');
let videoJsx = cleanForTsx(sections[8].jsx);

const videoCode = `"use client";

import React, { useState } from "react";

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative">
      <div onClick={() => setIsPlaying(true)} className="cursor-pointer">
        ${videoJsx}
      </div>

      {isPlaying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsPlaying(false)} />
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
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2.5 rounded-full transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync(path.join(componentsDir, 'VideoSection.tsx'), videoCode);

// -----------------------------------------------------------------
// 9. Reviews.tsx (Section 9)
// -----------------------------------------------------------------
console.log('Writing Reviews.tsx...');
let revJsx = cleanForTsx(sections[9].jsx);
const revCode = `"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Reviews() {
  useEffect(() => {
    // Add tab click behavior for Webflow tabs
    const tabLinks = document.querySelectorAll(".review-tab-link, .w-tab-link");
    const tabPanes = document.querySelectorAll(".w-tab-pane");

    tabLinks.forEach((link, idx) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        tabLinks.forEach(l => l.classList.remove("w--current"));
        link.classList.add("w--current");

        tabPanes.forEach((p, pIdx) => {
          if (pIdx === idx) {
            p.classList.add("w--tab-active");
            (p as HTMLElement).style.display = "block";
          } else {
            p.classList.remove("w--tab-active");
            (p as HTMLElement).style.display = "none";
          }
        });
      });
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
    >
      ${revJsx}
    </motion.div>
  );
}
`;
fs.writeFileSync(path.join(componentsDir, 'Reviews.tsx'), revCode);

// -----------------------------------------------------------------
// 10. InstagramGrid.tsx (Section 10)
// -----------------------------------------------------------------
console.log('Writing InstagramGrid.tsx...');
let instaJsx = cleanForTsx(sections[10].jsx);
const instaCode = `"use client";

import React from "react";

export default function InstagramGrid() {
  return (
    <div>
      ${instaJsx}
    </div>
  );
}
`;
fs.writeFileSync(path.join(componentsDir, 'InstagramGrid.tsx'), instaCode);

// -----------------------------------------------------------------
// 11. BlogSection.tsx (Section 11)
// -----------------------------------------------------------------
console.log('Writing BlogSection.tsx...');
let blogJsx = cleanForTsx(sections[11].jsx);
const blogCode = `"use client";

import React from "react";
import { motion } from "framer-motion";

export default function BlogSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
    >
      ${blogJsx}
    </motion.div>
  );
}
`;
fs.writeFileSync(path.join(componentsDir, 'BlogSection.tsx'), blogCode);

// -----------------------------------------------------------------
// 12. Footer.tsx (Section 12)
// -----------------------------------------------------------------
console.log('Writing Footer.tsx...');
let footJsx = cleanForTsx(sections[12].jsx);
const footCode = `"use client";

import React, { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStatus("success");
      setEmail("");
    }
  };

  return (
    <div>
      ${footJsx}
    </div>
  );
}
`;
fs.writeFileSync(path.join(componentsDir, 'Footer.tsx'), footCode);

console.log('All exact components generated successfully.');
