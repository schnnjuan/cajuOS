import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Analytics } from "@/components/analytics";
import { websiteSchema, jsonLd } from "@/lib/schema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://cajuos.dev";

export const metadata: Metadata = {
  title: {
    default: "CajuOS",
    template: "%s · CajuOS",
  },
  description:
    "Uma tool por semana. Pequenas ferramentas úteis, open source, feitas para durar.",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "any" },
    ],
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "CajuOS",
    url: siteUrl,
    title: "CajuOS",
    description:
      "Uma tool por semana. Pequenas ferramentas úteis, open source, feitas para durar.",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CajuOS",
    description:
      "Uma tool por semana. Pequenas ferramentas úteis, open source, feitas para durar.",
    images: ["/opengraph-image.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
  other: {
    "apple-mobile-web-app-title": "CajuOS",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
  (function() {
    try {
      var t = localStorage.getItem('theme');
      if (t === 'dark') document.documentElement.classList.add('dark');
    } catch (e) {}
  })();
  `;

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Analytics />
        {jsonLd(websiteSchema())}
      </body>
    </html>
  );
}
