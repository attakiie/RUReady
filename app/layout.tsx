import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/app/contexts/LanguageContext";
import { CartProvider } from "@/app/contexts/CartContext";
import CartDrawer from "@/app/components/cart/CartDrawer";
import Navbar from "@/app/components/layout/Navbar";

export const metadata: Metadata = {
  title: "R U READY — Action Air Gear",
  description:
    "Performance gear for Action Air & IPSC players. Built by players. Tested on the range.",
  openGraph: {
    title: "R U READY — Action Air Gear",
    description: "Performance gear for Action Air & IPSC players.",
    type: "website",
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
        <div className="pt-[3px]">
          <LanguageProvider>
            <CartProvider>
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
