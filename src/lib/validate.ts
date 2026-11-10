/**
 * Small validators and sanitisers for anything a visitor types or the browser stores.
 *
 * Each `clean*` function returns a tidied string (or null when the input cannot be made valid);
 * each `is*` function answers yes or no. They never throw, so they are safe to call on values
 * read back from localStorage, where anything may have been edited by hand.
 */

/** Longest value any single text field may hold. Keeps stored state and rendered text bounded. */
export const MAX = { name: 80, email: 254, text: 2000, line: 160, city: 60, coupon: 20 } as const;

/** Control characters (except tab and newline) and the bidi override marks used to disguise text. */
const UNSAFE_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u202A-\u202E\u2066-\u2069]/g;

/**
 * Free text: drops control and bidi-override characters, collapses runs of spaces, trims, and
 * cuts to `max` characters. Use for messages, address lines and any other open field.
 * React already escapes text when it renders, so this is about tidiness and size, not HTML.
 */
export function cleanText(value: unknown, max: number = MAX.text): string {
  if (typeof value !== "string") return "";
  return value.replace(UNSAFE_CHARS, "").replace(/[ \t]+/g, " ").trim().slice(0, max);
}

/**
 * A person's name: letters (any script), spaces, and . ' - only, 1 to 80 characters.
 * Returns the cleaned name, or null if it is empty or contains anything else.
 */
export function cleanName(value: unknown): string | null {
  const s = cleanText(value, MAX.name);
  return /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u.test(s) ? s : null;
}

/**
 * An email address in the everyday shape name@domain.tld, lower-cased, at most 254 characters.
 * Deliberately simpler than RFC 5322: it rejects spaces, angle brackets and quotes.
 * Returns the cleaned address, or null.
 */
export function cleanEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const s = value.trim().toLowerCase();
  if (s.length > MAX.email) return null;
  return /^[a-z0-9._%+-]{1,64}@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,24}$/.test(s) ? s : null;
}

/**
 * An Indian mobile number: ten digits starting 6–9, with an optional +91, 91 or 0 in front and
 * any spaces or dashes. Returns the bare ten digits, or null.
 */
export function cleanIndianMobile(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const digits = value.replace(/[\s-]/g, "").replace(/^(\+?91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

/** An Indian PIN code: exactly six digits, not starting with 0. Returns the six digits, or null. */
export function cleanPin(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const s = value.replace(/\s/g, "");
  return /^[1-9]\d{5}$/.test(s) ? s : null;
}

/**
 * A coupon code: 3 to 20 capital letters or digits after trimming and upper-casing.
 * This only checks the shape; whether the code exists is up to the store.
 */
export function cleanCoupon(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const s = value.trim().toUpperCase();
  return /^[A-Z0-9]{3,20}$/.test(s) ? s : null;
}

/** Clamps any value to a whole number in [min, max]; anything that is not a finite number becomes `min`. */
export function clampInt(value: unknown, min: number, max: number): number {
  const n = typeof value === "number" && Number.isFinite(value) ? Math.round(value) : min;
  return Math.max(min, Math.min(max, n));
}
