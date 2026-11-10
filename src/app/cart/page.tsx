import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";
import { CartView } from "@/features/cart/CartView";

export const metadata: Metadata = privateMeta("Your bag", "/cart");

export default function CartPage() {
  return <CartView />;
}
