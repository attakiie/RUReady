import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/account", "/account/", "/checkout", "/reset-password"],
      },
    ],
    sitemap: "https://ru-ready.vercel.app/sitemap.xml",
  };
}
