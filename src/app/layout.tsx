import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "ECOM-SHOP | Electronics Store",
  description:
    "Discover thoughtfully designed gadgets that blend innovation, performance, and style — built to elevate how you live, work, and play.",
  icons: {
    icon: "/assets/69d4da7bec912f7377bc97fe_svgviewer-output_1_.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="wf-active">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Antonio:300,400,500,600,700%7CDM+Sans:300,400,500,600,700%7CHost+Grotesk:300,400,500,600,700%7CManrope:300,400,500,600,700%7COutfit:300,400,500,600,700%7CPlus+Jakarta+Sans:300,400,500,600,700%7CSpace+Grotesk:300,400,500,600,700%7CSyne:300,400,500,600,700"
          media="all"
        />
      </head>
      <body>
        {process.env.DEMO_MODE === "true" && <div style={{ background: "#172554", color: "white", padding: "10px", textAlign: "center", fontSize: "14px" }}>Storefront preview — sample catalog. Live database and administration are not connected.</div>}
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
