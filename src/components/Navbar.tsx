"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface NavbarProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

export default function Navbar({ cartCount: propCartCount, onOpenCart }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [localCartOpen, setLocalCartOpen] = useState(false);

  const cart = useCart();
  const effectiveCount = propCartCount !== undefined && propCartCount > 0 ? propCartCount : cart.cartCount;
  const isDrawerOpen = cart.isCartOpen || localCartOpen;

  const handleOpenCart = () => {
    if (onOpenCart) onOpenCart();
    else {
      setLocalCartOpen(true);
      cart.openCart();
    }
  };

  const handleCloseCart = () => {
    setLocalCartOpen(false);
    cart.closeCart();
  };

  return (
    <>
      <header className="main-header sticky top-0 left-0 w-full z-40 bg-[#faf9f7]/95 backdrop-blur-md border-b border-black/10 transition-colors">
        <div className="w-layout-blockcontainer container w-container max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="header-main-box flex items-center justify-between py-5">
            {/* Brand Logo */}
            <div>
              <Link href="/" aria-current="page" className="logo-box inline-block">
                <img
                  src="/assets/69cfa642d519614f2c137ab9_0.svg"
                  alt="Givolt Logo"
                  className="site-logo h-7 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Desktop Nav Links with Webflow SplitText roll-over effect */}
            <nav className="header-menu-box hidden md:flex items-center gap-8 font-medium text-[16px] text-[#1a1a2e]">
              <Link href="/" className="header-menu-link group relative overflow-hidden inline-flex py-1">
                <span className="header-menu transition-transform duration-300 group-hover:-translate-y-full">Home</span>
                <span className="header-menu-hover absolute inset-0 transition-transform duration-300 translate-y-full group-hover:translate-y-0 text-blue-600">Home</span>
              </Link>
              <Link href="/about-us" className="header-menu-link group relative overflow-hidden inline-flex py-1">
                <span className="header-menu transition-transform duration-300 group-hover:-translate-y-full">About Us</span>
                <span className="header-menu-hover absolute inset-0 transition-transform duration-300 translate-y-full group-hover:translate-y-0 text-blue-600">About Us</span>
              </Link>
              <Link href="/shop" className="header-menu-link group relative overflow-hidden inline-flex py-1">
                <span className="header-menu transition-transform duration-300 group-hover:-translate-y-full">Shop</span>
                <span className="header-menu-hover absolute inset-0 transition-transform duration-300 translate-y-full group-hover:translate-y-0 text-blue-600">Shop</span>
              </Link>

              {/* Categories Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setCatDropdownOpen(true)}
                onMouseLeave={() => setCatDropdownOpen(false)}
              >
                <button
                  type="button"
                  className="header-menu-link group relative overflow-hidden inline-flex items-center gap-1.5 py-1 cursor-pointer"
                  onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                >
                  <span className="header-menu transition-transform duration-300 group-hover:-translate-y-full">Categories</span>
                  <span className="header-menu-hover absolute inset-0 transition-transform duration-300 translate-y-full group-hover:translate-y-0 text-blue-600">Categories</span>
                  <svg
                    className={`w-3.5 h-3.5 ml-1 transition-transform duration-300 ${catDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {catDropdownOpen && (
                  <div className="absolute top-full -left-4 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-black/5 p-2 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link
                      href="/category/smartphones"
                      className="px-3.5 py-2.5 text-[15px] font-medium text-neutral-800 rounded-xl hover:bg-[#f2f1ed] hover:text-blue-600 transition-colors"
                      onClick={() => setCatDropdownOpen(false)}
                    >
                      Smartphones
                    </Link>
                    <Link
                      href="/category/laptops"
                      className="px-3.5 py-2.5 text-[15px] font-medium text-neutral-800 rounded-xl hover:bg-[#f2f1ed] hover:text-blue-600 transition-colors"
                      onClick={() => setCatDropdownOpen(false)}
                    >
                      Laptops
                    </Link>
                    <Link
                      href="/category/smart-home"
                      className="px-3.5 py-2.5 text-[15px] font-medium text-neutral-800 rounded-xl hover:bg-[#f2f1ed] hover:text-blue-600 transition-colors"
                      onClick={() => setCatDropdownOpen(false)}
                    >
                      Smart Home
                    </Link>
                    <Link
                      href="/category/audio-sounds"
                      className="px-3.5 py-2.5 text-[15px] font-medium text-neutral-800 rounded-xl hover:bg-[#f2f1ed] hover:text-blue-600 transition-colors"
                      onClick={() => setCatDropdownOpen(false)}
                    >
                      Audio & Sounds
                    </Link>
                    <Link
                      href="/category/gaming-gadgets"
                      className="px-3.5 py-2.5 text-[15px] font-medium text-neutral-800 rounded-xl hover:bg-[#f2f1ed] hover:text-blue-600 transition-colors"
                      onClick={() => setCatDropdownOpen(false)}
                    >
                      Gaming Gadgets
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/contact" className="header-menu-link group relative overflow-hidden inline-flex py-1">
                <span className="header-menu transition-transform duration-300 group-hover:-translate-y-full">Contact</span>
                <span className="header-menu-hover absolute inset-0 transition-transform duration-300 translate-y-full group-hover:translate-y-0 text-blue-600">Contact</span>
              </Link>
            </nav>

            {/* Right Action Icons (Search + Cart + Mobile Hamburger) */}
            <div className="header-btn-box flex items-center gap-5">
              {/* Search Trigger Button */}
              <button
                type="button"
                className="search-button p-2 text-neutral-800 hover:text-blue-600 transition-colors cursor-pointer"
                onClick={() => setSearchOpen(true)}
                aria-label="Open Search"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Exact Webflow Shopping Cart Button */}
              <button
                type="button"
                className="shopping-cart-btn relative p-2 cursor-pointer transition-transform hover:scale-105"
                onClick={handleOpenCart}
                aria-label="Open Shopping Cart"
              >
                <img
                  src="/assets/6992c7e6e7fe68129c92d8af_2.svg"
                  alt="Shopping Cart"
                  className="shopping-cart-icon w-6 h-6 object-contain"
                />
                <span className="shopping-cart-quantity absolute top-0.5 -right-1 bg-[#2563eb] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {effectiveCount}
                </span>
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                className="mobile-menu-open-btn md:hidden p-2 text-neutral-900 cursor-pointer"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-4 border border-black/5 z-10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/shop?q=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-neutral-400 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, categories, tech..."
                autoFocus
                className="w-full py-2.5 text-lg outline-none bg-transparent text-neutral-900 placeholder:text-neutral-400"
              />
              <button
                type="submit"
                className="bg-[#2563eb] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Slide-in Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-80 max-w-[80vw] bg-[#f2f1ed] h-full shadow-2xl p-6 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-black/10">
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <img src="/assets/69cfa642d519614f2c137ab9_0.svg" alt="Givolt" className="h-6 w-auto" />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-neutral-600 hover:text-black"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-4 pt-6 text-lg font-semibold text-neutral-900">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">Home</Link>
                <Link href="/about-us" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">About Us</Link>
                <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">Shop</Link>
                <div className="pt-2 border-t border-black/5 flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Categories</span>
                  <Link href="/category/smartphones" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-neutral-700 hover:text-blue-600 pl-2">Smartphones</Link>
                  <Link href="/category/laptops" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-neutral-700 hover:text-blue-600 pl-2">Laptops</Link>
                  <Link href="/category/smart-home" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-neutral-700 hover:text-blue-600 pl-2">Smart Home</Link>
                  <Link href="/category/audio-sounds" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-neutral-700 hover:text-blue-600 pl-2">Audio & Sounds</Link>
                  <Link href="/category/gaming-gadgets" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-neutral-700 hover:text-blue-600 pl-2">Gaming Gadgets</Link>
                </div>
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1 border-t border-black/5 pt-3">Contact</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer Flyout */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={handleCloseCart} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-neutral-900">Your Shopping Cart</h3>
                  {effectiveCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                      {effectiveCount}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full cursor-pointer text-neutral-500 hover:text-neutral-900 transition-colors"
                  onClick={handleCloseCart}
                  aria-label="Close cart"
                >
                  ✕
                </button>
              </div>

              {cart.items.length === 0 ? (
                <div className="py-20 text-center text-gray-500 font-medium">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <img src="/assets/6992c7e6e7fe68129c92d8af_2.svg" alt="" className="w-8 h-8 opacity-40" />
                  </div>
                  <p className="text-neutral-700 font-semibold mb-1">Your cart is currently empty.</p>
                  <p className="text-xs text-neutral-400 mb-6">Explore our curated tech catalog and add your favorites.</p>
                  <Link
                    href="/shop"
                    onClick={handleCloseCart}
                    className="inline-block px-5 py-2.5 bg-[#2563eb] text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Browse Shop
                  </Link>
                </div>
              ) : (
                <div className="py-4 flex flex-col gap-3">
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 bg-[#f8f7f5] hover:bg-[#f2f1ed] rounded-2xl transition-colors border border-black/5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 bg-white rounded-xl p-1.5 flex items-center justify-center shrink-0 border border-black/5 overflow-hidden">
                          <img
                            src={item.image || "/assets/69d4a88b6ec9fb5582a36aeb_1.avif"}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={handleCloseCart}
                            className="font-semibold text-neutral-900 text-sm hover:text-blue-600 transition-colors line-clamp-1 block"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-neutral-500 font-medium mt-0.5">
                            ₹{item.price.toLocaleString("en-IN")} each
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-xs">
                              <button
                                type="button"
                                onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center text-xs font-bold text-neutral-600 hover:bg-gray-100 cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <span className="w-7 text-center text-xs font-semibold text-neutral-800">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center text-xs font-bold text-neutral-600 hover:bg-gray-100 cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => cart.removeFromCart(item.id)}
                              className="text-[11px] text-red-500 hover:text-red-700 hover:underline cursor-pointer ml-1"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="text-right pl-3 shrink-0">
                        <p className="font-bold text-neutral-900 text-sm">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.items.length > 0 && (
              <div className="pt-4 border-t border-gray-100 mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-neutral-600 font-medium text-sm">Subtotal</span>
                  <span className="text-xl font-bold text-neutral-900">
                    ₹{cart.subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mb-4">Taxes and shipping calculated at checkout.</p>
                <Link
                  href="/checkout"
                  onClick={handleCloseCart}
                  className="w-full py-3.5 bg-[#2563eb] text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25 cursor-pointer text-center block"
                >
                  Continue to Checkout →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
