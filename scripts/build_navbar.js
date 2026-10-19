const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { sections, processHtml, cleanJsx } = require('./converter_utils');

const componentsDir = path.join(__dirname, '..', 'src', 'components');
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

// ----------------------------------------------------
// 0. Navbar.tsx
// ----------------------------------------------------
console.log('Generating Navbar.tsx...');
const navHtml = processHtml(sections[0].html);
const $nav = cheerio.load(navHtml, null, false);

// Extract parts
const brandLogoSrc = $nav('.site-logo').first().attr('src') || '/assets/69cfa642d519614f2c137ab9_0.svg';
const cartIconSrc = $nav('.cart-icon').attr('src') || '/assets/6992c7e6e7fe68129c92d8af_2.svg';
const searchIconSrc = $nav('.search-btn-icon').attr('src') || '/assets/6992c7e52a0ead73746b2828_Vector.svg';
const menuIconSrc = $nav('.mobile-menu-icon').attr('src') || '/assets/6992c5fd8e233bfbd96ceb5f_menu.png';
const closeIconSrc = $nav('.mobile-menu-close-btn').attr('src') || '/assets/6992c5fd8e233bfbd96ceb52_close_2_.png';
const searchCloseIconSrc = $nav('.search-close-btn').attr('src') || '/assets/6992c5fd8e233bfbd96ceb5a_679274e26348659b0fc56c38_close.png';
const arrowDownSrc = $nav('.menu-icon').attr('src') || '/assets/69d0cd30e7cb43d5d656127e_arrow-down.png';

const navbarCode = `"use client";

import React, { useState } from "react";
import Image from "next/image";

interface NavbarProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

export default function Navbar({ cartCount = 0, onOpenCart }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const handleOpenCart = () => {
    if (onOpenCart) onOpenCart();
    else setCartDrawerOpen(true);
  };

  return (
    <header className="main-header relative z-50">
      <div className="w-layout-blockcontainer container w-container">
        <div className="header-main-box">
          {/* Brand Logo */}
          <div>
            <a href="/" aria-current="page" className="logo-box w-inline-block w--current">
              <img
                src="${brandLogoSrc}"
                alt="Givolt Logo"
                className="site-logo"
              />
            </a>
          </div>

          {/* Desktop Nav Links with SplitText rollover effect */}
          <div className="header-menu-box">
            <a href="/" aria-current="page" className="header-menu-link w-inline-block w--current">
              <p className="header-menu" aria-label="Home">Home</p>
              <p className="header-menu-hover" aria-label="Home">Home</p>
            </a>
            <a href="#about" className="header-menu-link w-inline-block">
              <p className="header-menu" aria-label="About Us">About Us</p>
              <p className="header-menu-hover" aria-label="About Us">About Us</p>
            </a>
            <a href="#shop" className="header-menu-link w-inline-block">
              <p className="header-menu" aria-label="Shop">Shop</p>
              <p className="header-menu-hover" aria-label="Shop">Shop</p>
            </a>

            {/* Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCatDropdownOpen(true)}
              onMouseLeave={() => setCatDropdownOpen(false)}
            >
              <button
                type="button"
                className="header-menu-link w-inline-block flex items-center gap-1 cursor-pointer"
                onClick={() => setCatDropdownOpen(!catDropdownOpen)}
              >
                <div className="relative overflow-hidden inline-flex">
                  <p className="header-menu" aria-label="Categories">Categories</p>
                  <p className="header-menu-hover" aria-label="Categories">Categories</p>
                </div>
                <img
                  src="${arrowDownSrc}"
                  alt="Arrow down"
                  className={\`w-3 h-3 transition-transform duration-300 \${catDropdownOpen ? "rotate-180" : ""}\`}
                />
              </button>

              {catDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 rounded-xl bg-white/95 backdrop-blur-md shadow-2xl border border-black/5 p-3 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <a href="#categories" className="px-3 py-2 text-sm font-medium text-gray-800 rounded-lg hover:bg-black/5 transition-colors">Smartphones</a>
                  <a href="#categories" className="px-3 py-2 text-sm font-medium text-gray-800 rounded-lg hover:bg-black/5 transition-colors">Laptops</a>
                  <a href="#categories" className="px-3 py-2 text-sm font-medium text-gray-800 rounded-lg hover:bg-black/5 transition-colors">Smart Home</a>
                  <a href="#categories" className="px-3 py-2 text-sm font-medium text-gray-800 rounded-lg hover:bg-black/5 transition-colors">Audio & Sounds</a>
                  <a href="#categories" className="px-3 py-2 text-sm font-medium text-gray-800 rounded-lg hover:bg-black/5 transition-colors">Gaming Gadgets</a>
                </div>
              )}
            </div>

            <a href="#contact" className="header-menu-link w-inline-block">
              <p className="header-menu" aria-label="Contact">Contact</p>
              <p className="header-menu-hover" aria-label="Contact">Contact</p>
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="header-btn-box flex items-center gap-4">
            {/* Search Trigger Button */}
            <div
              className="search-button cursor-pointer flex items-center justify-center p-2 rounded-full hover:bg-black/5 transition-colors"
              onClick={() => setSearchOpen(true)}
              role="button"
              tabIndex={0}
              aria-label="Open search modal"
            >
              <img
                src="${searchIconSrc}"
                alt="Search"
                className="search-btn-icon w-5 h-5"
              />
            </div>

            {/* Cart Button */}
            <div className="w-commerce-commercecartwrapper cart relative">
              <button
                type="button"
                className="w-commerce-commercecartopenlink cart-button w-inline-block flex items-center gap-2 cursor-pointer"
                onClick={handleOpenCart}
                aria-label="Open cart"
              >
                <img
                  src="${cartIconSrc}"
                  alt="Cart"
                  className="cart-icon w-5 h-5"
                />
                <div className="w-commerce-commercecartopenlinkcount cart-quantity">
                  {cartCount}
                </div>
              </button>
            </div>

            {/* Mobile Menu Open Button */}
            <div
              className="mobile-menu-open-btn cursor-pointer md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              role="button"
              tabIndex={0}
              aria-label="Open navigation menu"
            >
              <img
                src="${menuIconSrc}"
                alt="Menu"
                className="mobile-menu-icon w-6 h-6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Search Dropdown Overlay */}
      <div
        className={\`search-form-box transition-all duration-300 ease-in-out \${
          searchOpen ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-full opacity-0 pointer-events-none"
        }\`}
        style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 9999 }}
      >
        <div className="w-layout-blockcontainer container w-container relative py-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Search submitted");
            }}
            className="search-form w-form flex items-center gap-3 bg-white rounded-2xl p-3 shadow-2xl border border-gray-100"
          >
            <input
              className="search-input w-input flex-1 px-4 py-3 outline-none text-lg text-gray-800 placeholder-gray-400 bg-transparent"
              maxLength={256}
              name="query"
              placeholder="Search for products, brands, and more..."
              type="search"
              id="search"
              required
              autoFocus={searchOpen}
            />
            <button
              type="submit"
              className="search-btn w-button bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>
          <img
            alt="Close search"
            src="${searchCloseIconSrc}"
            className="search-close-btn absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer w-6 h-6 hover:opacity-75 transition-opacity"
            onClick={() => setSearchOpen(false)}
          />
        </div>
      </div>

      {/* Mobile Slide-in Menu Drawer */}
      <div
        className={\`mobile-menu fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-[#f2f1ed] z-50 p-6 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out md:hidden \${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }\`}
      >
        <div>
          <div className="mobile-logo-box flex items-center justify-between pb-6 border-b border-gray-200">
            <a href="/" className="logo-box">
              <img src="${brandLogoSrc}" alt="Givolt Logo" className="site-logo" />
            </a>
            <img
              alt="Close menu"
              src="${closeIconSrc}"
              className="mobile-menu-close-btn cursor-pointer w-6 h-6"
              onClick={() => setMobileMenuOpen(false)}
            />
          </div>

          <div className="mobile-menu-box flex flex-col gap-4 pt-6">
            <a href="/" className="mobile-dropdown-link text-xl font-semibold text-gray-900" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#about" className="mobile-dropdown-link text-xl font-semibold text-gray-900" onClick={() => setMobileMenuOpen(false)}>About Us</a>
            <a href="#shop" className="mobile-dropdown-link text-xl font-semibold text-gray-900" onClick={() => setMobileMenuOpen(false)}>Shop</a>
            
            {/* Mobile Categories Accordion */}
            <div>
              <button
                type="button"
                className="flex items-center justify-between w-full text-xl font-semibold text-gray-900 py-1"
                onClick={() => setMobileCatOpen(!mobileCatOpen)}
              >
                <span>Collection</span>
                <img
                  src="${arrowDownSrc}"
                  alt=""
                  className={\`w-4 h-4 transition-transform \${mobileCatOpen ? "rotate-180" : ""}\`}
                />
              </button>
              {mobileCatOpen && (
                <div className="flex flex-col gap-2 pl-4 pt-2">
                  <a href="#categories" className="text-gray-600 font-medium py-1" onClick={() => setMobileMenuOpen(false)}>Smartphones</a>
                  <a href="#categories" className="text-gray-600 font-medium py-1" onClick={() => setMobileMenuOpen(false)}>Laptops</a>
                  <a href="#categories" className="text-gray-600 font-medium py-1" onClick={() => setMobileMenuOpen(false)}>Smart Home</a>
                  <a href="#categories" className="text-gray-600 font-medium py-1" onClick={() => setMobileMenuOpen(false)}>Audio & Sounds</a>
                  <a href="#categories" className="text-gray-600 font-medium py-1" onClick={() => setMobileMenuOpen(false)}>Gaming Gadgets</a>
                </div>
              )}
            </div>

            <a href="#contact" className="mobile-dropdown-link text-xl font-semibold text-gray-900" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          </div>
        </div>
      </div>

      {/* Cart Drawer Flyout */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setCartDrawerOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900">Your Cart</h3>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => setCartDrawerOpen(false)}
                >
                  <img src="${closeIconSrc}" alt="Close cart" className="w-5 h-5" />
                </button>
              </div>

              {cartCount === 0 ? (
                <div className="py-20 text-center text-gray-500 font-medium">
                  Your cart is currently empty.
                </div>
              ) : (
                <div className="py-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900">HD Smart TV</p>
                      <p className="text-sm text-gray-500">Qty: {cartCount}</p>
                    </div>
                    <p className="font-bold text-blue-600">\${(cartCount * 399).toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 font-medium">Subtotal</span>
                <span className="text-xl font-bold text-gray-900">
                  \${(cartCount * 399).toFixed(2)}
                </span>
              </div>
              <button
                type="button"
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
                onClick={() => alert("Proceeding to checkout...")}
              >
                Continue to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for mobile menu / search */}
      {(mobileMenuOpen || searchOpen) && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => {
            setMobileMenuOpen(false);
            setSearchOpen(false);
          }}
        />
      )}
    </header>
  );
}
`;

fs.writeFileSync(path.join(componentsDir, 'Navbar.tsx'), navbarCode);
console.log('Saved src/components/Navbar.tsx');
