import type { MetadataRoute } from "next";

const PUBLIC_ROUTES = [
  "",
  "/login",
  "/register",
  "/learn",
  "/support",
  "/privacy",
  "/terms",
  "/operations-guide",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PUBLIC_ROUTES.map((route) => ({
    url: `https://app.cognispark.tech${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.65,
  }));
}
