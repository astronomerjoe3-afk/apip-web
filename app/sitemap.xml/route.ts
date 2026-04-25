const PUBLIC_ROUTES = [
  "",
  "/mission-demo",
  "/graph-lab",
  "/force-builder",
  "/energy-ledger",
  "/learn",
  "/login",
  "/register",
  "/support",
  "/privacy",
  "/terms",
  "/delete-account",
  "/operations-guide",
];

function priorityForRoute(route: string): string {
  if (route === "") {
    return "1.0";
  }

  if (["/mission-demo", "/graph-lab", "/force-builder", "/energy-ledger", "/learn"].includes(route)) {
    return "0.8";
  }

  return "0.6";
}

export function GET() {
  const lastModified = new Date().toISOString();
  const urls = PUBLIC_ROUTES.map((route) => {
    const changeFrequency = route === "" ? "weekly" : "monthly";
    return [
      "  <url>",
      `    <loc>https://app.cognispark.tech${route}</loc>`,
      `    <lastmod>${lastModified}</lastmod>`,
      `    <changefreq>${changeFrequency}</changefreq>`,
      `    <priority>${priorityForRoute(route)}</priority>`,
      "  </url>",
    ].join("\n");
  }).join("\n");

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
