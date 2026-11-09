import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { CartDrawer } from "@/components/shell/CartDrawer";
import { SearchPalette } from "@/components/shell/SearchPalette";
import { MenuOverlay } from "@/components/shell/MenuOverlay";
import { Providers } from "@/components/shell/Providers";

const switzer = localFont({
  variable: "--font-switzer",
  display: "swap",
  src: [
    { path: "../fonts/Switzer-300.woff2", weight: "300" },
    { path: "../fonts/Switzer-400.woff2", weight: "400" },
    { path: "../fonts/Switzer-500.woff2", weight: "500" },
    { path: "../fonts/Switzer-600.woff2", weight: "600" },
  ],
});

export const metadata: Metadata = {
  title: {
    default: "Superbeing Nutrition · Your need is specific",
    template: "%s · Superbeing Nutrition",
  },
  description: "Nutrition built for one specific need at a time, with every active dose printed on the pack. From Nuvexa Biotech, Bengaluru.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={switzer.variable} suppressHydrationWarning>
      <body>
        <Providers>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <MenuOverlay />
          <SearchPalette />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
