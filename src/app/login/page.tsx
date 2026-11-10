import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";
import { Suspense } from "react";
import { LoginView } from "@/features/account/LoginView";

export const metadata: Metadata = privateMeta("Log in", "/login");

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80svh]" aria-busy="true" />}>
      <LoginView />
    </Suspense>
  );
}
