import type { Metadata } from "next";

import "./globals.css";
import { AuthProvider } from "../lib/auth";

const siteUrl = "https://app.cognispark.tech";
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Cognispark",
      url: siteUrl,
      email: "support@cognispark.tech",
      sameAs: [siteUrl],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Cognispark",
      url: siteUrl,
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/learn?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "LearningResource",
      "@id": `${siteUrl}/mission-demo#learning-resource`,
      name: "Cognispark Public Physics Mission Demo",
      url: `${siteUrl}/mission-demo`,
      learningResourceType: "Interactive physics mission",
      educationalLevel: "High school",
      teaches: ["Motion graphs", "Physics misconceptions", "Graph interpretation"],
      isAccessibleForFree: true,
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cognispark | Physics, mission by mission",
    template: "%s | Cognispark",
  },
  description:
    "Cognispark is a physics learning platform that turns concepts into guided missions with visuals, feedback, and clear progression from foundations to advanced study.",
  applicationName: "Cognispark",
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    siteName: "Cognispark",
    url: "/",
    title: "Cognispark | Physics, mission by mission",
    description:
      "Interactive physics lessons with guided missions, real progress tracking, and stronger conceptual understanding.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Cognispark physics learning platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cognispark | Physics, mission by mission",
    description:
      "Interactive physics lessons with guided missions, visuals, feedback, and deep conceptual coverage.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
