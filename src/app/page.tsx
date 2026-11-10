import type { Metadata } from "next";
import { HomePage } from "@/features/home/HomePage";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

const TITLE = "Superbeing Nutrition · Formulas for one specific need";

export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "en_IN", siteName: SITE_NAME, url: "/", title: TITLE, description: SITE_DESCRIPTION },
};

export default function Home() {
  return <HomePage />;
}
