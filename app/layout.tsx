import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const vcr = localFont({ src: "./fonts/vcr-osd-mono.ttf", variable: "--font-vcr", display: "block" });

export const metadata: Metadata = {
  title: "Tavla",
  description: "Departures and weather for the kitchen TV",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" className={vcr.variable}>
      <body className="grid min-h-svh place-items-center bg-black antialiased">{children}</body>
    </html>
  );
}
