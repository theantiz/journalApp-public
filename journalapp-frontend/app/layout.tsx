import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { themeInitScript } from "@/lib/theme-constants";

const displayFont = Newsreader({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Source_Serif_4({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Journal App",
  description: "A paper-inspired personal journal with secure sign in and synced entries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full"
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} min-h-screen text-[var(--text)] antialiased`}
        style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
      >
        {children}
      </body>
    </html>
  );
}
