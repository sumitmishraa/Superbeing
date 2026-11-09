import type { Metadata } from "next";
import { AccountView } from "@/components/commerce/AccountView";

export const metadata: Metadata = { title: "Your account" };

export default function AccountPage() {
  return <AccountView />;
}
