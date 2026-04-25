const MANIFEST = {
  name: "Cognispark Physics Learning Platform",
  short_name: "Cognispark",
  description:
    "Interactive physics missions with visual reasoning tools, targeted feedback, and clear progression from foundations to advanced study.",
  start_url: "/",
  scope: "/",
  display: "standalone",
  background_color: "#f4f7ff",
  theme_color: "#173b8f",
  categories: ["education", "productivity"],
  icons: [
    {
      src: "/favicon.ico",
      sizes: "256x256",
      type: "image/x-icon",
    },
  ],
};

export function GET() {
  return Response.json(MANIFEST, {
    headers: {
      "cache-control": "public, max-age=3600",
    },
  });
}
