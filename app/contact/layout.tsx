import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description:
    "ติดต่อ R U READY สอบถามสินค้า Action Air และ IPSC ผ่าน LINE OpenChat หรือช่องทางติดต่ออื่นๆ",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
