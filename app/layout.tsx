import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/app/contexts/LanguageContext";

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
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
