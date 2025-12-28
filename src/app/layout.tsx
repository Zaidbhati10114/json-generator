import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/context/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import { LogRocketProvider } from "./components/providers/LogRocketProvider";
import { ThemeScript } from "./components/context/ThemeScript";
import { Providers } from "@/lib/react-query/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JSON Generator | AI-Powered Mock API Builder",
  description:
    "Generate realistic JSON datasets instantly using AI — no signup, no credit card. Build mock APIs and test your projects faster.",
  // icons: {
  //   icon: [{ url: "/favicon.png", type: "image/png", sizes: "32x32" }],
  // },
  openGraph: {
    title: "JSON Generator by Zaid Bhati",
    description:
      "AI-powered JSON generator for developers. Create data or live mock APIs in seconds.",
    url: "https://json-generator-mu.vercel.app",
    // images: ["/og-image.png"],
  },
  twitter: {
    // card: "summary_large_image",
    creator: "@zaidbhati",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LogRocketProvider>
          <ThemeProvider>
            <Providers>{children}</Providers>
          </ThemeProvider>
          <Toaster />
        </LogRocketProvider>
      </body>
    </html>
  );
}
