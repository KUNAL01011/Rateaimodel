import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getSettings, SITE_BASE } from "@/lib/server-api";

const FALLBACK_TITLE = "RateAI — The Review Index for AI Tools";
const FALLBACK_DESC =
  "Independent, use-case-specific ratings for AI tools, models, agents and bots — so you choose on evidence, not hype.";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const base = SITE_BASE(s);
  const title = s?.defaultTitle ?? FALLBACK_TITLE;
  const description = s?.defaultDescription ?? FALLBACK_DESC;
  const images = s?.ogImageUrl ? [{ url: s.ogImageUrl }] : undefined;

  return {
    metadataBase: new URL(base),
    title: { default: title, template: s?.titleTemplate ?? "%s · RateAI" },
    description,
    keywords: s?.keywords,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: s?.siteName ?? "RateAI",
      title,
      description,
      url: base,
      images,
    },
    twitter: {
      card: "summary_large_image",
      site: s?.twitterHandle,
      title,
      description,
      images,
    },
    ...(s?.googleSiteVerification
      ? { verification: { google: s.googleSiteVerification } }
      : {}),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const ga = settings?.googleAnalyticsId;

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        {ga && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
