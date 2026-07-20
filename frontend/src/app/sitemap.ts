import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/opportunities",
    "/faq",
    "/contact",
    "/terms",
    "/privacy",
    "/refunds",
    "/disclaimers",
  ];
  return routes.map((route) => ({
    url: `https://leadhippo.ca${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/opportunities" ? "daily" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
