import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { SearchPalette } from "@/components/layout/SearchPalette";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { NewsletterPopup } from "@/components/layout/NewsletterPopup";
import { QuickShop } from "@/components/layout/QuickShop";
import { Providers } from "@/components/layout/Providers";
import { JsonLd, organizationLd, websiteLd } from "@/lib/jsonld";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Superbeing Nutrition · Formulas for one specific need",
    template: "%s · Superbeing Nutrition",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // Descriptive terms only: no health claims.
  keywords: [
    "Superbeing Nutrition",
    "food supplements India",
    "nutrition supplements",
    "every dose on the label",
    "transparent supplement labels",
    "vegetarian supplements",
    "Nuvexa Biotech",
    "Bengaluru",
  ],
  authors: [{ name: "Nuvexa Biotech Pvt. Ltd." }],
  creator: "Nuvexa Biotech Pvt. Ltd.",
  publisher: "Nuvexa Biotech Pvt. Ltd.",
  category: "shopping",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: SITE_NAME,
    title: "Superbeing Nutrition · Formulas for one specific need",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Superbeing Nutrition · Formulas for one specific need",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: [{ url: "/brand/superbeing-logo.webp" }],
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#a0153e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${oswald.variable}`} suppressHydrationWarning>
      <body>
        <JsonLd data={[organizationLd(), websiteLd()]} />
        <Providers>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <MobileTabBar />
          <MenuOverlay />
          <SearchPalette />
          <CartDrawer />
          <QuickShop />
          <NewsletterPopup />
        </Providers>
      </body>
    </html>
  );
}
