import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FirstNinety",
    template: "%s — FirstNinety",
  },
  description:
    "Survive your first 90 days. Workplace coaching for freshly trained tech professionals.",
  applicationName: "FirstNinety",
  appleWebApp: {
    capable: true,
    title: "FirstNinety",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#0E1116",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper text-ink font-body">{children}</body>
    </html>
  );
}
