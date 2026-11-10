import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { Header, MobileTabBar } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { CartDrawer } from "@/components/shell/CartDrawer";
import { SearchPalette } from "@/components/shell/SearchPalette";
import { MenuOverlay } from "@/components/shell/MenuOverlay";
import { NewsletterPopup, QuickShop } from "@/components/shell/Modals";
import { Providers } from "@/components/shell/Providers";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Superbeing Nutrition · Formulas for one specific need",
    template: "%s · Superbeing Nutrition",
  },
  description: "Nutrition built for one specific need at a time, with every active dose printed on the pack. From Nuvexa Biotech, Bengaluru.",
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
