import React from "react";
import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us & Customer Support | ECOM-SHOP (Givolt)",
  description:
    "Get in touch with ECOM-SHOP (Givolt). Reach our technical support team, track orders, inquire about warranty, or visit our Mumbai Experience Center.",
};

export default function ContactPage() {
  return <ContactClient />;
}

