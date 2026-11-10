import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";
import { AccountView } from "@/features/account/AccountView";

export const metadata: Metadata = privateMeta("Your account", "/account");

export default function AccountPage() {
  return <AccountView />;
}
