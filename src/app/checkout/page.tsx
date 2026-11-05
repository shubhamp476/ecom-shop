import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout | ECOM-SHOP Electronics Store",
  description: "Complete your electronic gadget order securely with Razorpay or Cash on Delivery.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}

