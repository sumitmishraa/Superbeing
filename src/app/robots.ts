import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/site";

/** Per-visitor pages: nothing for a search engine to index. */
const PRIVATE = ["/checkout", "/cart", "/account", "/login", "/wishlist", "/search"];

/**
 * Crawlers that collect pages to train AI models. Blocking them here is a request, not an
 * enforcement: well-behaved bots honour it, scrapers ignore it. Search engines are unaffected.
 */
const AI_TRAINING_BOTS = [
  "GPTBot",
  "CCBot",
  "Google-Extended",
  "anthropic-ai",
  "ClaudeBot",
  "PerplexityBot",
  "Bytespider",
  "Applebot-Extended",
  "meta-externalagent",
  "cohere-ai",
  "Diffbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_TRAINING_BOTS, disallow: "/" },
    ],
    sitemap: absUrl("/sitemap.xml"),
  };
}
