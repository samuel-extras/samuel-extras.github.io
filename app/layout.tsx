import type { Metadata, Viewport } from "next";
import { Recursive } from "next/font/google";
import { profile } from "@/content";
import "./globals.css";

// One family: the sans for reading, its MONO axis for the scope readouts and the name's decode.
const recursive = Recursive({ subsets: ["latin"], axes: ["MONO"], variable: "--font-recursive" });

const title = `${profile.name}, software developer`;

export const metadata: Metadata = {
  metadataBase: new URL("https://samuel-extras.github.io"),
  title,
  description: profile.intro,
  openGraph: { title, description: profile.intro, url: "/", type: "website" },
};

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={recursive.variable}>
      <body>{children}</body>
    </html>
  );
}
