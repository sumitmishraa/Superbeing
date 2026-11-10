import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";
import { WishlistView } from "@/features/wishlist/WishlistView";

export const metadata: Metadata = privateMeta("Wishlist", "/wishlist");

export default function WishlistPage() {
  return <WishlistView />;
}
