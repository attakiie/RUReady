import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("products")
    .select("name_en, name_th, desc_en, desc_th, images, price")
    .eq("slug", slug)
    .single();

  if (!data) {
    return {
      title: "สินค้า",
      description: "อุปกรณ์ Action Air และ IPSC",
    };
  }

  const title = data.name_th || data.name_en;
  const desc = data.desc_th || data.desc_en;
  const image = data.images?.[0];

  return {
    title,
    description: desc,
    openGraph: {
      title: `${title} | R U READY`,
      description: desc,
      images: image
        ? [{ url: image, width: 800, height: 800, alt: title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | R U READY`,
      description: desc,
      images: image ? [image] : [],
    },
  };
}

export default function ProductLayout({ children }: Props) {
  return <>{children}</>;
}
