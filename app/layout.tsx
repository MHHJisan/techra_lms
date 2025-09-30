import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { cookies } from "next/headers";
import "./globals.css";
import { ToastProvider } from "@/components/providers/toast-provider";
import Footer from "@/components/udemy-clone/Footer";
import { LanguageProvider } from "@/app/providers/LanguageProvider";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteName = "TECHRA LMS";
const siteDescription = "Learn high‑quality tech courses from TECHRA — a Techra concern.";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: "%s | TECHRA LMS",
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "TECHRA",
    "LMS",
    "online courses",
    "tech courses",
    "Bangladesh",
  ],
  authors: [{ name: "TECHRA" }],
  creator: "TECHRA",
  publisher: "TECHRA",
  alternates: {
    canonical: "/",
    languages: {
      "en": "/?lang=en",
      "bn": "/?lang=bn",
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: siteName,
    siteName,
    description: siteDescription,
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    site: "@techra",
    creator: "@techra",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = cookies();
  const initialLang = (cookieStore.get("lang")?.value === "bn" ? "bn" : "en");
  return (
    <ClerkProvider>
      <html lang={initialLang}>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <LanguageProvider initialLang={initialLang}>
            <ToastProvider />
            <OrganizationJsonLd
              siteUrl={siteUrl}
              sameAs={[
                "https://facebook.com/Techrabd",
                "https://youtube.com/@techra2811",
              ]}
            />
            <div className="min-h-screen flex flex-col">
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
