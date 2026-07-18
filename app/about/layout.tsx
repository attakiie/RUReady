import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description:
    "R U READY ก่อตั้งโดยนักกีฬา Action Air และ IPSC ตัวจริง คัดสรรอุปกรณ์คุณภาพที่เราใช้เองในสนาม จัดส่งทั่วประเทศไทย",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "เกี่ยวกับเรา | R U READY",
    description: "สร้างโดยนักกีฬา Action Air และ IPSC เพื่อนักกีฬาด้วยกัน",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
