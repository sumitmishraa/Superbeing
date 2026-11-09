import type { Metadata } from "next";
import { CartView } from "@/components/commerce/Views";

export const metadata: Metadata = { title: "Your bag" };

export default function CartPage() {
  return <CartView />;
}
