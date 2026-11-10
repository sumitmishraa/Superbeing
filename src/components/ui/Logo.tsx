/** The Superbeing wordmark, drawn as a CSS mask (.logo-mask in globals.css) so it takes the text colour. */
export function Logo({ className = "", label = "Superbeing Nutrition" }: { className?: string; label?: string }) {
  return <span role="img" aria-label={label} className={`logo-mask ${className}`} />;
}
