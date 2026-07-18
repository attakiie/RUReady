import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "หมวดหมู่สินค้า",
  description:
    "เลือกดูสินค้าตามหมวดหมู่ — Green Gas, เป้ายิงและอุปกรณ์ IPSC, ชิ้นส่วนพิมพ์ 3D และอุปกรณ์เสริม Action Air",
  alternates: { canonical: "/categories" },
  openGraph: {
    title: "หมวดหมู่สินค้า | R U READY",
    description: "อุปกรณ์ Action Air และ IPSC แบ่งตามหมวดหมู่ ค้นหาง่าย จัดส่งทั่วไทย",
  },
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
