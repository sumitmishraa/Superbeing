/**
 * Checkout form shape, its validation (built on lib/validate.ts) and the PIN → state/city lookup
 * that pre-fills the address.
 */

import { MAX, cleanEmail, cleanIndianMobile, cleanName, cleanPin, cleanText } from "@/lib/validate";

export const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

/**
 * PIN prefixes we can read with confidence, longest first. Two digits give the state; three give
 * the city where one city owns the whole range. Anything else is left for the shopper to type.
 */
const PIN_PREFIXES: [prefix: string, state: string, city?: string][] = [
  ["560", "Karnataka", "Bengaluru"],
  ["56", "Karnataka"],
  ["400", "Maharashtra", "Mumbai"],
  ["411", "Maharashtra", "Pune"],
  ["40", "Maharashtra"],
  ["41", "Maharashtra"],
  ["11", "Delhi", "Delhi"],
  ["600", "Tamil Nadu", "Chennai"],
  ["60", "Tamil Nadu"],
  ["500", "Telangana", "Hyderabad"],
  ["50", "Telangana"],
  ["700", "West Bengal", "Kolkata"],
  ["70", "West Bengal"],
  ["380", "Gujarat", "Ahmedabad"],
  ["38", "Gujarat"],
];

/** State and (where certain) city for a PIN, from the first matching prefix. */
export function placeForPin(pin: string): { state?: string; city?: string } {
  const hit = PIN_PREFIXES.find(([prefix]) => pin.startsWith(prefix));
  return hit ? { state: hit[1], city: hit[2] } : {};
}

export type CheckoutForm = { first: string; last: string; email: string; phone: string; pin: string; state: string; city: string; line1: string };
export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

/** Fields of each step, used to tick the step chips. */
export const CONTACT_FIELDS: (keyof CheckoutForm)[] = ["first", "last", "email", "phone"];
export const ADDRESS_FIELDS: (keyof CheckoutForm)[] = ["pin", "state", "city", "line1"];

/** Every problem with the form, keyed by field, in on-screen order (the first one gets focus). */
export function validateCheckout(f: CheckoutForm): CheckoutErrors {
  const e: CheckoutErrors = {};
  if (!cleanName(f.first)) e.first = "Enter your first name, using letters.";
  if (!cleanName(f.last)) e.last = "Enter your last name, using letters.";
  if (!cleanEmail(f.email)) e.email = "Enter an email like name@example.com.";
  if (!cleanIndianMobile(f.phone)) e.phone = "Enter a 10-digit Indian mobile number.";
  if (!cleanPin(f.pin)) e.pin = "Enter a 6-digit PIN code.";
  if (!STATES.includes(f.state)) e.state = "Choose your state.";
  if (cleanText(f.city, MAX.city).length < 2) e.city = "Enter your city.";
  if (cleanText(f.line1, MAX.line).length < 6) e.line1 = "Enter your house, street and area.";
  return e;
}
