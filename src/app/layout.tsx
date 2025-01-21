import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: "%s | Space Forecast Portal",
    default:
      "Space Forecast Portal - Track Astronomical Events & Space Weather",
  },
  description:
    "Discover upcoming astronomical events and monitor space weather conditions with our comprehensive space forecast portal.",
  keywords: [
    "space weather",
    "astronomical events",
    "meteor showers",
    "solar activity",
    "space forecast",
    "celestial events",
    "aurora forecast",
    "astronomical calendar",
  ],
  metadataBase: new URL("https://space-forecast.vercel.app"),
  authors: [{ name: "Your Name" }],
  creator: "Your Name",
  publisher: "Space Forecast Portal",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://space-forecast.vercel.app",
    siteName: "Space Forecast Portal",
    title: "Space Forecast Portal - Track Astronomical Events & Space Weather",
    description:
      "Discover upcoming astronomical events and monitor space weather conditions.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Space Forecast Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Space Forecast Portal",
    description: "Track astronomical events and space weather conditions.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen bg-black text-white pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
