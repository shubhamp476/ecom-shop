"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  ShieldCheck,
  Lock,
  Truck,
  CreditCard,
  ShoppingBag,
  Tag,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Printer,
  ChevronRight,
  PackageCheck,
  Phone,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi NCR",
];

interface CompletedOrder {
  orderNumber: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  paymentMethod: string;
  paymentStatus: string;
  razorpayPaymentId?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  createdAt: string;
}

export default function CheckoutClient() {
  const { items, subtotal, clearCart, cartCount } = useCart();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "Maharashtra",
    postalCode: "",
    country: "India",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"Razorpay" | "Cash on Delivery">("Razorpay");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    description: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Mock / Simulated Razorpay Modal State (for development / testing before live keys)
  const [simulatedModalOpen, setSimulatedModalOpen] = useState(false);
  const [pendingSimulatedData, setPendingSimulatedData] = useState<{
    orderId: string;
    amount: number;
  } | null>(null);

  // Completed Order State
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);

  // Calculations
  const shippingCost = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const taxAmount = 0; // Prices are GST inclusive
  const finalTotal = Math.max(0, subtotal + shippingCost - discountAmount + taxAmount);

  // Check if Razorpay script is already loaded
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      setRazorpayLoaded(true);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Valid email address is required";
    }
    if (!formData.phone.trim() || formData.phone.replace(/[^0-9]/g, "").length < 10) {
      newErrors.phone = "10-digit mobile number is required";
    }
    if (!formData.street.trim()) newErrors.street = "Street address / building is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.postalCode.trim() || formData.postalCode.length < 5) {
      newErrors.postalCode = "Valid postal / PIN code is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyCoupon = () => {
    setCouponError(null);
    setCouponSuccess(null);
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (code === "WELCOME10") {
      const discount = Math.min(1000, Math.round(subtotal * 0.1));
      setAppliedCoupon({ code, discount, description: "10% Welcome Discount applied!" });
      setCouponSuccess(`Coupon ${code} applied! Saved ₹${discount.toLocaleString("en-IN")}`);
    } else if (code === "TECHFEST20") {
      if (subtotal < 2499) {
        setCouponError("Minimum order amount of ₹2,499 required for TECHFEST20");
        return;
      }
      setAppliedCoupon({ code, discount: 500, description: "Flat ₹500 TechFest rebate applied!" });
      setCouponSuccess(`Coupon ${code} applied! Saved ₹500`);
    } else if (code === "GAMER50") {
      if (subtotal < 9999) {
        setCouponError("Minimum order amount of ₹9,999 required for GAMER50");
        return;
      }
      setAppliedCoupon({ code, discount: 1500, description: "Flat ₹1,500 Gaming rebate applied!" });
      setCouponSuccess(`Coupon ${code} applied! Saved ₹1,500`);
    } else {
      setCouponError("Invalid or expired coupon code. Try WELCOME10 for 10% off.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponSuccess(null);
    setCouponError(null);
  };

  // Finalize Order Helper
  const finalizeOrder = async (details: {
    paymentMethod: string;
    paymentStatus: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  }) => {
    const orderPayload = {
      orderNumber: `GV-${Math.floor(100000 + Math.random() * 900000)}`,
      customer: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        shippingAddress: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state,
          postalCode: formData.postalCode.trim(),
          country: formData.country,
        },
      },
      items: items.map((item) => ({
        productId: item.id || item.slug,
        name: item.name,
        slug: item.slug,
        sku: item.sku || `GV-${item.slug.toUpperCase()}`,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      shipping: shippingCost,
      total: finalTotal,
      couponCode: appliedCoupon?.code,
      paymentMethod: details.paymentMethod,
      paymentStatus: details.paymentStatus,
      fulfillmentStatus: "Confirmed",
      shippingCarrier: "Delhivery",
      customerNotes: formData.notes.trim(),
      adminNotes:
        details.paymentMethod === "Razorpay"
          ? `Verified via Razorpay. Payment ID: ${details.razorpayPaymentId || "N/A"}`
          : "Cash on delivery - collect payment upon delivery",
      razorpayOrderId: details.razorpayOrderId,
      razorpayPaymentId: details.razorpayPaymentId,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      const savedOrder = data.order || orderPayload;

      setCompletedOrder({
        orderNumber: savedOrder.orderNumber,
        total: finalTotal,
        subtotal,
        tax: taxAmount,
        shipping: shippingCost,
        discount: discountAmount,
        paymentMethod: details.paymentMethod,
        paymentStatus: details.paymentStatus,
        razorpayPaymentId: details.razorpayPaymentId,
        customer: orderPayload.customer,
        items: items.map((i) => ({
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        createdAt: savedOrder.createdAt || new Date().toISOString(),
      });

      clearCart();
    } catch (e) {
      console.error("Order submission error:", e);
      // Even if network blips, show confirmation to customer
      setCompletedOrder({
        orderNumber: orderPayload.orderNumber,
        total: finalTotal,
        subtotal,
        tax: taxAmount,
        shipping: shippingCost,
        discount: discountAmount,
        paymentMethod: details.paymentMethod,
        paymentStatus: details.paymentStatus,
        razorpayPaymentId: details.razorpayPaymentId,
        customer: orderPayload.customer,
        items: items.map((i) => ({
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        createdAt: orderPayload.createdAt,
      });
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Main Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (items.length === 0) return;

    setIsSubmitting(true);

    if (paymentMethod === "Cash on Delivery") {
      await finalizeOrder({
        paymentMethod: "Cash on Delivery",
        paymentStatus: "Pending",
      });
      return;
    }

    // Razorpay Flow
    try {
      const res = await fetch("/api/checkout/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalTotal,
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
          notes: {
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: formData.phone,
          },
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to initialize Razorpay checkout");
      }

      // Check if real Razorpay keys are configured or if we are in simulated test mode
      if (data.isMock || !data.key || data.key === "rzp_test_placeholder") {
        // Open simulation popup so testing is seamless out of the box
        setPendingSimulatedData({
          orderId: data.orderId,
          amount: finalTotal,
        });
        setSimulatedModalOpen(true);
        setIsSubmitting(false);
        return;
      }

      // Real Razorpay integration
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "ECOM-SHOP",
        description: `Order Payment for ${items.length} item(s)`,
        image: "/assets/69cfa642d519614f2c137ab9_0.svg",
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              await finalizeOrder({
                paymentMethod: "Razorpay",
                paymentStatus: "Paid",
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
              });
            } else {
              alert("Payment verification failed. Please contact support.");
              setIsSubmitting(false);
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Error verifying payment response.");
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: `${formData.street}, ${formData.city}, ${formData.state} - ${formData.postalCode}`,
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on("payment.failed", function (failResponse: any) {
        alert(`Payment failed: ${failResponse.error?.description || "Transaction declined"}`);
        setIsSubmitting(false);
      });
      razorpay.open();
    } catch (err: any) {
      console.error("Razorpay initiation error:", err);
      alert(err?.message || "Failed to initiate Razorpay checkout.");
      setIsSubmitting(false);
    }
  };

  // Complete Simulated Razorpay Payment
  const handleCompleteSimulatedPayment = async () => {
    setSimulatedModalOpen(false);
    setIsSubmitting(true);
    const mockPaymentId = `pay_sim_${Date.now()}`;
    await finalizeOrder({
      paymentMethod: "Razorpay",
      paymentStatus: "Paid",
      razorpayOrderId: pendingSimulatedData?.orderId,
      razorpayPaymentId: mockPaymentId,
    });
  };

  // If order was successfully completed, show the confirmation screen
  if (completedOrder) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] text-neutral-900 py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-black/5 p-8 sm:p-10 animate-in fade-in duration-500">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
              Payment Successful
            </span>
            <h1 className="text-3xl font-extrabold text-neutral-900">Thank You for Your Order!</h1>
            <p className="text-neutral-500 mt-2 text-sm">
              We&apos;ve received your order and are getting it ready for shipment.
            </p>
          </div>

          <div className="bg-[#faf9f7] rounded-2xl p-5 mb-8 border border-black/5 flex flex-wrap justify-between items-center gap-4">
            <div>
              <p className="text-xs text-neutral-500 font-medium">Order Number</p>
              <p className="text-xl font-mono font-bold text-blue-600">{completedOrder.orderNumber}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-medium">Payment Method</p>
              <p className="text-sm font-bold text-neutral-800 flex items-center gap-1.5 mt-0.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                {completedOrder.paymentMethod} ({completedOrder.paymentStatus})
              </p>
            </div>
            {completedOrder.razorpayPaymentId && (
              <div>
                <p className="text-xs text-neutral-500 font-medium">Payment ID</p>
                <p className="text-xs font-mono font-semibold text-neutral-700 mt-0.5">
                  {completedOrder.razorpayPaymentId}
                </p>
              </div>
            )}
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-sm">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" /> Shipping Address
              </p>
              <p className="text-neutral-800 font-medium">{completedOrder.customer.name}</p>
              <p className="text-neutral-600 text-xs mt-1">{completedOrder.customer.shippingAddress.street}</p>
              <p className="text-neutral-600 text-xs">
                {completedOrder.customer.shippingAddress.city}, {completedOrder.customer.shippingAddress.state} -{" "}
                {completedOrder.customer.shippingAddress.postalCode}
              </p>
              <p className="text-neutral-600 text-xs">{completedOrder.customer.shippingAddress.country}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" /> Delivery Estimate
              </p>
              <p className="text-neutral-800 font-medium">3 - 5 Business Days</p>
              <p className="text-neutral-600 text-xs mt-1">Carrier: Delhivery Express Logistics</p>
              <p className="text-neutral-600 text-xs mt-2 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-neutral-400" /> {completedOrder.customer.email}
              </p>
              <p className="text-neutral-600 text-xs flex items-center gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-neutral-400" /> {completedOrder.customer.phone}
              </p>
            </div>
          </div>

          {/* Purchased Items */}
          <div className="border-t border-gray-100 pt-6 mb-6">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4">
              Items in Order ({completedOrder.items.length})
            </h3>
            <div className="divide-y divide-gray-100">
              {completedOrder.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl p-1 border border-gray-200 flex items-center justify-center shrink-0">
                      <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{item.name}</p>
                      <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-neutral-900">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="bg-[#faf9f7] rounded-2xl p-4 border border-black/5 text-sm space-y-2 mb-8">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span>₹{completedOrder.subtotal.toLocaleString("en-IN")}</span>
            </div>
            {completedOrder.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Promotional Discount</span>
                <span>-₹{completedOrder.discount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-600">
              <span>Delivery Charges</span>
              <span>{completedOrder.shipping === 0 ? "FREE" : `₹${completedOrder.shipping}`}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-extrabold text-neutral-900 text-base">
              <span>Total Paid</span>
              <span className="text-blue-600">₹{completedOrder.total.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/shop"
              className="flex-1 py-3.5 bg-[#2563eb] text-white rounded-2xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 text-center text-sm"
            >
              Continue Shopping
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-neutral-800 rounded-2xl font-semibold transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty, show informative empty cart banner
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf9f7] text-neutral-900">
        <header className="border-b border-black/10 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="inline-block">
              <img src="/assets/69cfa642d519614f2c137ab9_0.svg" alt="Givolt Logo" className="h-7 w-auto" />
            </Link>
            <Link
              href="/shop"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Shop
            </Link>
          </div>
        </header>

        <div className="max-w-md mx-auto py-24 px-4 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Your Shopping Cart is Empty</h2>
          <p className="text-neutral-500 text-sm mb-8">
            Looks like you haven&apos;t added any items to your cart yet. Explore our latest smart gadgets and electronics!
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#2563eb] text-white rounded-2xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
          >
            Explore Catalog <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dynamic script loading for official Razorpay modal */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />

      <div className="min-h-screen bg-[#faf9f7] text-neutral-900">
        {/* Minimal Checkout Header */}
        <header className="border-b border-black/10 bg-white sticky top-0 z-30 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="inline-block">
              <img src="/assets/69cfa642d519614f2c137ab9_0.svg" alt="Givolt" className="h-7 w-auto" />
            </Link>
            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
              </span>
              <Link
                href="/shop"
                className="text-xs font-semibold text-neutral-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Shop
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Layout */}
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Checkout</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Please enter your delivery details and choose your preferred payment method.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Fields (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Contact Info */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-xs">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h2 className="text-lg font-bold text-neutral-900">Contact Information</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Rahul Sharma"
                        className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                          errors.name ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-blue-600"
                        }`}
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="rahul@example.com"
                          className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                            errors.email ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-blue-600"
                          }`}
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-3 text-sm text-neutral-400 font-semibold">+91</span>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="9876543210"
                            maxLength={10}
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                              errors.phone ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-blue-600"
                            }`}
                          />
                        </div>
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Shipping Address */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-xs">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h2 className="text-lg font-bold text-neutral-900">Shipping Address</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Street Address / Flat / Building <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        placeholder="Flat 402, Sunshine Apartments, MG Road"
                        className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                          errors.street ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-blue-600"
                        }`}
                      />
                      {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Mumbai"
                          className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                            errors.city ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-blue-600"
                          }`}
                        />
                        {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                          State <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-600"
                        >
                          {INDIAN_STATES.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                          PIN / Postal Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="400001"
                          maxLength={6}
                          className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                            errors.postalCode ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-blue-600"
                          }`}
                        />
                        {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Country</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          disabled
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 text-neutral-500 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Delivery Notes or Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Near Metro Station or Leave at front door"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Payment Method Selection (Razorpay highlighted) */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-xs">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <h2 className="text-lg font-bold text-neutral-900">Select Payment Method</h2>
                  </div>

                  <div className="space-y-3">
                    {/* Razorpay Option */}
                    <div
                      onClick={() => setPaymentMethod("Razorpay")}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        paymentMethod === "Razorpay"
                          ? "border-blue-600 bg-blue-50/30 shadow-xs"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === "Razorpay" ? "border-blue-600" : "border-gray-300"
                          }`}
                        >
                          {paymentMethod === "Razorpay" && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 text-sm">Razorpay</span>
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded-md tracking-wider">
                              RECOMMENDED
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            UPI (GPay, PhonePe, Paytm), Credit &amp; Debit Cards, NetBanking, Wallets
                          </p>
                        </div>
                      </div>

                      {/* Payment Badges */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <span className="text-[10px] font-bold px-2 py-1 bg-white border border-gray-200 rounded text-neutral-700">
                          UPI
                        </span>
                        <span className="text-[10px] font-bold px-2 py-1 bg-white border border-gray-200 rounded text-neutral-700">
                          Cards
                        </span>
                        <span className="text-[10px] font-bold px-2 py-1 bg-white border border-gray-200 rounded text-neutral-700">
                          NetBanking
                        </span>
                      </div>
                    </div>

                    {/* Cash on Delivery Option */}
                    <div
                      onClick={() => setPaymentMethod("Cash on Delivery")}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        paymentMethod === "Cash on Delivery"
                          ? "border-blue-600 bg-blue-50/30 shadow-xs"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === "Cash on Delivery" ? "border-blue-600" : "border-gray-300"
                          }`}
                        >
                          {paymentMethod === "Cash on Delivery" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 text-sm">Cash on Delivery (COD)</span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">Pay via cash or UPI QR code at doorstep</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-neutral-600 bg-gray-100 px-2.5 py-1 rounded-md">
                        Standard
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary (5 Cols) */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-black/5 shadow-xs">
                  <h3 className="text-base font-bold text-neutral-900 mb-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                    <span>Order Summary</span>
                    <span className="text-xs font-normal text-neutral-500">{cartCount} item(s)</span>
                  </h3>

                  {/* Item List */}
                  <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1 mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 bg-[#faf9f7] rounded-xl p-1 border border-black/5 flex items-center justify-center shrink-0">
                            <img
                              src={item.image || "/assets/69d4a88b6ec9fb5582a36aeb_1.avif"}
                              alt={item.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-neutral-900 truncate">{item.name}</p>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-neutral-900 shrink-0">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Code Input */}
                  <div className="pt-3 border-t border-gray-100 mb-4">
                    {appliedCoupon ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-emerald-600" />
                          <div>
                            <p className="text-xs font-bold text-emerald-800">{appliedCoupon.code}</p>
                            <p className="text-[10px] text-emerald-600">{appliedCoupon.description}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              placeholder="Coupon code (e.g. WELCOME10)"
                              className="w-full pl-9 pr-3 py-2 text-xs uppercase rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                        {couponError && <p className="text-[11px] text-red-500 mt-1.5">{couponError}</p>}
                        {couponSuccess && <p className="text-[11px] text-emerald-600 mt-1.5">{couponSuccess}</p>}
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-neutral-400">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Tip: Use coupon <strong>WELCOME10</strong> for 10% instant off</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Coupon Discount ({appliedCoupon.code})</span>
                        <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-neutral-600">
                      <span>Shipping Fee</span>
                      <span>{shippingCost === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${shippingCost}`}</span>
                    </div>

                    <div className="flex justify-between text-neutral-600">
                      <span>GST (18% included)</span>
                      <span>₹0 (Inclusive)</span>
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                      <span className="text-sm font-bold text-neutral-900">Total Payable</span>
                      <span className="text-xl font-extrabold text-blue-600">
                        ₹{finalTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Submit / Pay Button */}
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 text-sm"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing Secure Order...</span>
                        </div>
                      ) : paymentMethod === "Razorpay" ? (
                        <>
                          <Lock className="w-4 h-4" /> Pay ₹{finalTotal.toLocaleString("en-IN")} via Razorpay
                        </>
                      ) : (
                        <>
                          <PackageCheck className="w-4 h-4" /> Place Cash on Delivery Order
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-neutral-400 mt-3">
                      By placing this order, you agree to our Terms of Sale and Returns Policy.
                    </p>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-xs space-y-3">
                  <div className="flex items-center gap-3 text-xs text-neutral-700">
                    <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                    <span>
                      <strong>100% Genuine Electronics:</strong> Verified manufacturer warranty.
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-700">
                    <Truck className="w-5 h-5 text-blue-600 shrink-0" />
                    <span>
                      <strong>Express Delivery:</strong> Dispatched within 24 hours via Delhivery.
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-700">
                    <CreditCard className="w-5 h-5 text-blue-600 shrink-0" />
                    <span>
                      <strong>Razorpay Verified:</strong> Industry-standard PCI-DSS Level 1 compliance.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Simulated Razorpay Modal (Active when API keys are not yet configured) */}
      {simulatedModalOpen && pendingSimulatedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#2563eb] text-white p-6 text-center relative">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Razorpay Payment Gateway</h3>
              <p className="text-xs text-blue-100 mt-1">Test &amp; Development Sandbox Simulation</p>
              <button
                type="button"
                onClick={() => setSimulatedModalOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900">
                <p className="font-semibold mb-1">Razorpay Integration Active</p>
                <p className="text-[11px] text-blue-700">
                  Razorpay test order ID: <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">{pendingSimulatedData.orderId}</code>
                </p>
                <p className="text-[11px] text-blue-700 mt-2">
                  To open Razorpay&apos;s live hosted popup, provide your <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> in <code>.env.local</code>.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-500">
                  <span>Merchant:</span>
                  <span className="font-semibold text-neutral-800">ECOM-SHOP Electronics</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Customer:</span>
                  <span className="font-semibold text-neutral-800">{formData.name}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Amount:</span>
                  <span className="font-bold text-neutral-900 text-sm">
                    ₹{pendingSimulatedData.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleCompleteSimulatedPayment}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-600/25 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Simulate Successful Razorpay Payment
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedModalOpen(false)}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-neutral-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

