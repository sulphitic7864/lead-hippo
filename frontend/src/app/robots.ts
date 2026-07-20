import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/cart", "/success", "/cancel", "/refund-claim"],
    },
    sitemap: "https://leadhippo.ca/sitemap.xml",
  };
}
