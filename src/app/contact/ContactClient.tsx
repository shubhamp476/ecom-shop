"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  CheckCircle2,
  ChevronDown,
  Send,
  HelpCircle,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Headphones,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How do I track my active order?",
    answer:
      "Once your order is processed, you will receive an SMS and email notification with your Delhivery express tracking link. You can also view and track the real-time fulfillment status inside our Admin or Customer order lookup.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "We accept all major payment methods powered by Razorpay: UPI (Google Pay, PhonePe, Paytm, BHIM), Credit & Debit Cards (Visa, Mastercard, RuPay, Amex), NetBanking across 50+ banks, and Cash on Delivery (COD) across eligible PIN codes.",
  },
  {
    question: "What is your replacement and returns policy?",
    answer:
      "We provide a 7-day hassle-free replacement guarantee for all electronic devices that arrive damaged, defective, or do not match advertised specifications. All items also include standard 1-year authorized manufacturer brand warranty.",
  },
  {
    question: "Do you ship across all states in India?",
    answer:
      "Yes! We partner with Delhivery Express and Blue Dart to cover over 27,000+ PIN codes across all Indian states and Union Territories. Metro deliveries usually arrive within 2-3 business days.",
  },
  {
    question: "How do I claim a brand warranty for Apple, Samsung, or Sony products?",
    answer:
      "Every product purchased from ECOM-SHOP comes with an official GST invoice containing the serial number (IMEI / S/N). Simply carry this invoice to any authorized brand service center across India for instant warranty service.",
  },
];

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: "Order Status & Tracking",
    orderNumber: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Please enter your name";
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim() || formData.phone.replace(/[^0-9]/g, "").length < 10) {
      newErrors.phone = "Please enter a 10-digit mobile number";
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const ticketId = `TK-${Math.floor(10000 + Math.random() * 90000)}`;
      setTicketSuccess(ticketId);
      setIsSubmitting(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        inquiryType: "Order Status & Tracking",
        orderNumber: "",
        message: "",
      });
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] text-neutral-900 selection:bg-blue-600 selection:text-white font-sans">
      {/* 1. Header Navigation */}
      <Navbar />

      <main>
        {/* 2. Hero Section */}
        <section className="relative pt-20 pb-16 md:pt-24 md:pb-20 border-b border-black/5 bg-white">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 text-center max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Headphones className="w-3.5 h-3.5" /> 24/7 Dedicated Support
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
              We&apos;re Here to Help You
            </h1>
            <p className="mt-3 text-base sm:text-lg text-neutral-600 font-normal">
              Have a question regarding product compatibility, your order dispatch, or warranty claims? Our hardware specialists are ready to assist.
            </p>
          </div>
        </section>

        {/* 3. Direct Contact Channels Grid */}
        <section className="py-12 max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phone & WhatsApp Card */}
            <div className="p-7 rounded-3xl bg-white border border-black/5 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-neutral-900 text-lg mb-1">Direct Calling &amp; WhatsApp</h3>
              <p className="text-xs text-neutral-500 mb-4">
                Instant telephone support for urgent order amendments.
              </p>
              <div className="space-y-1 text-sm font-semibold text-neutral-800">
                <p>
                  Toll-Free: <a href="tel:18004258900" className="text-blue-600 hover:underline">1800-425-8900</a>
                </p>
                <p>
                  WhatsApp: <a href="https://wa.me/919820012345" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">+91 98200-12345</a>
                </p>
              </div>
              <p className="text-[11px] text-neutral-400 mt-3 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Mon - Sat: 9:00 AM – 9:00 PM IST
              </p>
            </div>

            {/* Email Support Card */}
            <div className="p-7 rounded-3xl bg-white border border-black/5 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-neutral-900 text-lg mb-1">Email Concierge Desk</h3>
              <p className="text-xs text-neutral-500 mb-4">
                Send us specs inquiries, order invoices, or B2B quote requests.
              </p>
              <div className="space-y-1 text-sm font-semibold text-neutral-800">
                <p>
                  Support: <a href="mailto:support@givolt.store" className="text-blue-600 hover:underline">support@givolt.store</a>
                </p>
                <p>
                  Corporate: <a href="mailto:business@givolt.store" className="text-blue-600 hover:underline">business@givolt.store</a>
                </p>
              </div>
              <p className="text-[11px] text-neutral-400 mt-3 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Typical reply in &lt; 2 hours
              </p>
            </div>

            {/* Experience Center Card */}
            <div className="p-7 rounded-3xl bg-white border border-black/5 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-neutral-900 text-lg mb-1">Flagship Experience Hub</h3>
              <p className="text-xs text-neutral-500 mb-4">
                Visit our physical showroom for hands-on demos and instant pickups.
              </p>
              <p className="text-xs text-neutral-700 font-medium leading-relaxed">
                Unit 402, Tech Boulevard, Bandra Kurla Complex (BKC), Mumbai, Maharashtra 400051
              </p>
              <p className="text-[11px] text-neutral-400 mt-3 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Mon - Sun: 10:00 AM – 8:00 PM IST
              </p>
            </div>
          </div>
        </section>

        {/* 4. Form + Experience Center Section */}
        <section className="py-12 max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Interactive Ticket Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-black/5 shadow-xs">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Send an Inquiry or Log a Ticket</h2>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  Fill out the form below and our dedicated hardware support team will reach back with a resolution.
                </p>
              </div>

              {ticketSuccess && (
                <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Support Ticket Generated: #{ticketSuccess}</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Thank you! We have received your inquiry. A support engineer has been assigned and will reply to your registered email shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTicketSuccess(null)}
                    className="mt-3 text-xs font-bold text-emerald-800 underline cursor-pointer"
                  >
                    Submit another inquiry
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Vikram Mehta"
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                        errors.name ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-blue-600"
                      }`}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="vikram@example.com"
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                        errors.email ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-blue-600"
                      }`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      maxLength={10}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                        errors.phone ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-blue-600"
                      }`}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="Order Status & Tracking">Order Status &amp; Tracking</option>
                      <option value="Product Specs & Compatibility">Product Specs &amp; Compatibility</option>
                      <option value="Warranty Claim & Replacement">Warranty Claim &amp; Replacement</option>
                      <option value="Payment & Invoicing Support">Payment &amp; Invoicing Support</option>
                      <option value="Corporate / Bulk Purchases">Corporate / Bulk Purchases</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Order Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. GV-123456"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Your Message / Detailed Question <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Describe how we can assist you with your order, device, or setup..."
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all resize-none ${
                      errors.message ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-blue-600"
                    }`}
                  />
                  {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 text-sm"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Logging Ticket...</span>
                      </div>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Submit Inquiry Ticket
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-neutral-400 mt-3">
                    Your data is strictly confidential and protected by 256-bit encryption.
                  </p>
                </div>
              </form>
            </div>

            {/* Right 5 Columns: Experience Store & Quick Links */}
            <div className="lg:col-span-5 space-y-6">
              {/* Store Experience Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-xs">
                <span className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-2 block">
                  Storefront Visit
                </span>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Visit the Givolt Sound &amp; Workstation Lounge
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6 font-normal">
                  Want to audition active noise-cancelling headphones, test tactile keyboard switches, or see smart home ambient lighting live before purchasing? Book a walk-in visit to our Mumbai flagship.
                </p>

                <div className="p-4 rounded-2xl bg-[#faf9f7] border border-black/5 space-y-3 text-xs mb-6">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-neutral-900">Bandra Kurla Complex (BKC)</p>
                      <p className="text-neutral-500 mt-0.5">Plot C-32, G-Block, BKC, Mumbai 400051</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-neutral-900">Operating Hours</p>
                      <p className="text-neutral-500 mt-0.5">Mon to Sun: 10:00 AM – 8:00 PM</p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/shop"
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  Explore Online Catalog Instead <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Express Support Guarantees */}
              <div className="bg-[#0c1013] text-white rounded-3xl p-6 sm:p-7 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-base">The Givolt Concierge Promise</h4>
                </div>
                <div className="space-y-3 text-xs text-neutral-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Every replacement ticket approved within 24 hours of device receipt.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Zero restocking fees on manufacturer defect claims.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Complimentary remote setup assistance for smart locks and audio gear.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Interactive FAQ Accordion Section */}
        <section className="py-20 bg-white border-t border-black/5">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">Quick Answers</span>
              <h2 className="text-3xl font-extrabold text-neutral-900">Frequently Asked Questions</h2>
              <p className="text-neutral-500 text-sm">
                Instant answers to the most common questions regarding ordering, payment, and warranties.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-2xl overflow-hidden transition-all bg-[#faf9f7]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full px-6 py-4.5 text-left font-bold text-sm sm:text-base text-neutral-900 flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-100/60 transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-gray-100 bg-white animate-in fade-in duration-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <Footer />
    </div>
  );
}

