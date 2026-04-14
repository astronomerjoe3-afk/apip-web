import type { Metadata } from "next";

import "./globals.css";
import { AuthProvider } from "../lib/auth";

export const metadata: Metadata = {
  metadataBase: new URL("https://app.cognispark.tech"),
  title: {
    default: "Cognispark | Physics, mission by mission",
    template: "%s | Cognispark",
  },
  description:
    "Cognispark is a physics learning platform that turns concepts into guided missions with visuals, feedback, and clear progression from foundations to advanced study.",
  applicationName: "Cognispark",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://app.cognispark.tech",
    siteName: "Cognispark",
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
