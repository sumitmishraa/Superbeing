import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { ContactPage } from "@/features/contact/ContactPage";

export const metadata: Metadata = pageMeta({
  title: "Contact",
  description: "Questions about a label, an order or a partnership. Superbeing Nutrition, Nuvexa Biotech, Bengaluru.",
  path: "/contact",
});

export default function Contact() {
  return <ContactPage />;
}
