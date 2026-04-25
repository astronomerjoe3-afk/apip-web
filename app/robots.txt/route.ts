const ROBOTS_BODY = `User-Agent: *
Allow: /
Allow: /mission-demo
Allow: /graph-lab
Allow: /force-builder
Allow: /energy-ledger
Allow: /learn
Allow: /login
Allow: /register
Allow: /support
Allow: /terms
Allow: /privacy
Allow: /delete-account
Allow: /operations-guide
Disallow: /api/
Disallow: /api
Disallow: /student
Disallow: /student/
Disallow: /dashboard
Disallow: /dashboard/
Disallow: /institution
Disallow: /institution/
Disallow: /instructor
Disallow: /instructor/
Disallow: /delete-account/request

Sitemap: https://app.cognispark.tech/sitemap.xml
Host: https://app.cognispark.tech
`;

export function GET() {
  return new Response(ROBOTS_BODY, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
