import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginView } from "@/components/commerce/AccountView";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80svh]" aria-busy="true" />}>
      <LoginView />
    </Suspense>
  );
}
