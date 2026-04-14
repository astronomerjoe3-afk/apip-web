import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register", "/learn", "/support", "/terms", "/privacy"],
        disallow: [
          "/api/",
          "/student/",
          "/dashboard/",
          "/institution/",
          "/instructor/",
          "/delete-account/",
        ],
      },
    ],
    sitemap: "https://app.cognispark.tech/sitemap.xml",
    host: "https://app.cognispark.tech",
  };
}
