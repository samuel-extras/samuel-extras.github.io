import type { Metadata, Viewport } from "next";
import { Recursive } from "next/font/google";
import { profile } from "@/content";
import "./globals.css";

// One family: the sans for reading, its MONO axis for the scope readouts and the name's decode.
const recursive = Recursive({ subsets: ["latin"], axes: ["MONO"], variable: "--font-recursive" });

const title = `${profile.name}, software developer`;
// Drawn by app/og.png/route.tsx.
const preview = { url: "/og.png", width: 1200, height: 630, alt: `${profile.name}, software developer in Lagos` };

export const metadata: Metadata = {
  metadataBase: new URL("https://samuel-extras.github.io"),
  title,
  description: profile.intro,
  openGraph: { title, description: profile.intro, url: "/", type: "website", images: [preview] },
  twitter: { card: "summary_large_image", images: [preview] },
};

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={recursive.variable}>
      <body>{children}</body>
    </html>
  );
}
