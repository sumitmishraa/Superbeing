import type { Metadata } from "next";
import { WishlistView } from "@/components/commerce/Views";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return <WishlistView />;
}
