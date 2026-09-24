import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Jev Studio",
  description: "Structured decisions, classification and scoring — a visual interface for Jev.",
  openGraph: {
    title: "Jev Studio",
    description: "Structured decisions, classification and scoring — a visual interface for Jev.",
    images: ["/brand/logo-256.png"],
  },
  twitter: {
    card: "summary",
    title: "Jev Studio",
    description: "Structured decisions, classification and scoring — a visual interface for Jev.",
    images: ["/brand/logo-256.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col bg-background text-foreground"
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
