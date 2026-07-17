import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/app/contexts/LanguageContext";
import { CartProvider } from "@/app/contexts/CartContext";
import CartDrawer from "@/app/components/cart/CartDrawer";
import Navbar from "@/app/components/layout/Navbar";
import AnnouncementBar from "@/app/components/layout/AnnouncementBar";

export const metadata: Metadata = {
  title: {
    default: "R U READY — อุปกรณ์ Action Air & IPSC",
    template: "%s | R U READY",
  },
  description:
    "ร้านอุปกรณ์ Action Air และ IPSC ในไทย Green Gas, เป้ายิง, อุปกรณ์เสริม จัดส่งทั่วประเทศ",
  keywords: ["action air", "IPSC", "green gas", "เป้ายิง", "อุปกรณ์ยิงปืน", "airsoft", "ไทย", "R U READY"],
  metadataBase: new URL("https://ru-ready.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "R U READY — อุปกรณ์ Action Air & IPSC",
    description: "ร้านอุปกรณ์ Action Air และ IPSC ในไทย จัดส่งทั่วประเทศ",
    type: "website",
    url: "https://ru-ready.vercel.app",
    siteName: "R U READY",
    locale: "th_TH",
    images: [
      {
        url: "/images/hero-gas-products.png",
        width: 1200,
        height: 630,
        alt: "R U READY — Action Air Gear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "R U READY — อุปกรณ์ Action Air & IPSC",
    description: "ร้านอุปกรณ์ Action Air และ IPSC ในไทย จัดส่งทั่วประเทศ",
    images: ["/images/hero-gas-products.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0F0F10] text-[#F5F5F5]">
        {/* Global red top stripe */}
        <div className="fixed top-0 left-0 right-0 h-[3px] bg-[#D32F3A] z-[100]" />
        <div
          style={{ paddingTop: "calc(3px + var(--announce-h, 0px))" }}
          className="transition-[padding-top] duration-200"
        >
          <LanguageProvider>
            <CartProvider>
              <AnnouncementBar />
              <Navbar />
              <CartDrawer />
              {children}
            </CartProvider>
          </LanguageProvider>
        </div>
      </body>
    </html>
  );
}
