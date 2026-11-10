/**
 * Line icons used across the store: 24px viewBox, 1.5px round strokes in currentColor.
 * Every icon is decorative (aria-hidden); the button or link around it carries the label.
 */

type IconProps = { className?: string };

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const Icon = {
  Search: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  ),
  Heart: ({ className, filled }: IconProps & { filled?: boolean }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke} fill={filled ? "currentColor" : "none"}>
      <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20Z" />
    </svg>
  ),
  Close: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  ),
  Plus: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Minus: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M5 12h14" />
    </svg>
  ),
  Menu: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M3 8h18M3 13h18M9 18h12" />
    </svg>
  ),
  Chevron: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  ChevronLeft: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="m15 6-6 6 6 6" />
    </svg>
  ),
  ChevronRight: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  ),
  Check: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  ),
  Bag: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M5 8h14l-1.2 12H6.2L5 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  ),
  User: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.5 20c1.3-3.6 4.1-5.3 7.5-5.3s6.2 1.7 7.5 5.3" />
    </svg>
  ),
  Eye: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Truck: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7z" />
      <circle cx="6.5" cy="17" r="1.6" />
      <circle cx="17" cy="17" r="1.6" />
    </svg>
  ),
  Shield: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M12 3 4.5 6v5.5c0 4.5 3.2 8.2 7.5 9.5 4.3-1.3 7.5-5 7.5-9.5V6L12 3Z" />
      <path d="m8.8 12 2.2 2.2 4.2-4.4" />
    </svg>
  ),
  Leaf: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" />
      <path d="M5 19 14 10" />
    </svg>
  ),
  Flask: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M9.5 3h5M10.5 3v5.5L5 19a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2l-5.5-10.5V3" />
      <path d="M7.5 15h9" />
    </svg>
  ),
  Target: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  ),
  Filters: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M3 7h11M18 7h3M3 17h4M11 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </svg>
  ),
  Percent: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 15 6-6" />
      <circle cx="9.2" cy="9.2" r=".6" fill="currentColor" />
      <circle cx="14.8" cy="14.8" r=".6" fill="currentColor" />
    </svg>
  ),
  /** Footer address pin (square line ends, unlike the rest of the set). */
  MapPin: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  ),
};
