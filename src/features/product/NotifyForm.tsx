"use client";

import { useState } from "react";
import { useHydrated, useStore } from "@/lib/store";
import { cleanEmail } from "@/lib/validate";

/** Email sign-up for a coming-soon product. Preview store: the address is checked but not sent anywhere. */
export function NotifyForm({ slug }: { slug: string }) {
  const notify = useStore((s) => s.addNotify);
  const done = useStore((s) => s.notify.includes(slug));
  const hydrated = useHydrated();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  if (hydrated && done) return <p className="bg-off p-4 text-[1rem]">You are on the list. We will email you when it is ready.</p>;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!cleanEmail(email)) return setError("Enter an email address like name@example.com.");
        notify(slug);
      }}
    >
      <div className="flex gap-1.5">
        <label className="field flex-1" data-error={!!error}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            aria-invalid={!!error}
            aria-describedby={error ? "notify-err" : undefined}
          />
        </label>
        <button type="submit" className="btn">
          Notify me
        </button>
      </div>
      {error && (
        <p id="notify-err" className="field-error">
          {error}
        </p>
      )}
    </form>
  );
}
