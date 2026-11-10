import { Icon } from "./icons";

/**
 * Form field with the label inside the box (.field in globals.css) and an error line below.
 * The error's id is `${id}-err`, so inputs can point aria-describedby at it.
 */
export function Field({
  id,
  label,
  error,
  className = "",
  children,
  chevron,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
  /** Draws a dropdown chevron, for <select> fields. */
  chevron?: boolean;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field" data-error={!!error}>
        <span>{label}</span>
        {children}
        {chevron && <Icon.Chevron className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />}
      </label>
      {error && (
        <p id={`${id}-err`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
