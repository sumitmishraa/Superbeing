"use client";

import { useState } from "react";
import { cleanEmail } from "@/lib/validate";
import { Field } from "@/components/ui";

/** Contact form with inline errors. Preview store: nothing is sent; it shows a thank-you instead. */

const TOPICS = ["A question about a label", "An order or delivery", "Monthly deliveries", "Partnerships and clinics", "Something else"];

type Form = { name: string; email: string; topic: string; order: string; message: string };

function validate(f: Form): Partial<Record<keyof Form, string>> {
  const errors: Partial<Record<keyof Form, string>> = {};
  if (f.name.trim().length < 2) errors.name = "Enter your name.";
  if (!cleanEmail(f.email)) errors.email = "Enter an email like name@example.com.";
  if (f.message.trim().length < 10) errors.message = "Tell us a little more, at least a sentence.";
  return errors;
}

export function ContactForm() {
  const [f, setF] = useState<Form>({ name: "", email: "", topic: TOPICS[0], order: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [sent, setSent] = useState(false);

  if (sent)
    return (
      <div className="bg-off p-6 sm:p-8" role="status">
        <p className="h-section">Thank you, {f.name.split(" ")[0]}.</p>
        <p className="mt-3 max-w-[44ch] text-[1rem] leading-snug">Your note is in. We will reply to {f.email}.</p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setF({ ...f, message: "", order: "" });
          }}
          className="btn mt-6"
        >
          Send another
        </button>
      </div>
    );

  /** Props that wire one input to the form state and its error message. */
  const bind = (k: keyof Form) => ({
    id: `c-${k}`,
    value: f[k],
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `c-${k}-err` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setF({ ...f, [k]: e.target.value });
      if (errors[k]) setErrors({ ...errors, [k]: "" });
    },
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const found = validate(f);
        setErrors(found);
        const first = Object.keys(found)[0];
        if (first) return document.getElementById(`c-${first}`)?.focus();
        setSent(true);
      }}
    >
      <div className="grid gap-1.5 sm:grid-cols-2">
        <Field id="c-name" label="Name" error={errors.name}>
          <input {...bind("name")} autoComplete="name" />
        </Field>
        <Field id="c-email" label="E-mail" error={errors.email}>
          <input {...bind("email")} type="email" autoComplete="email" />
        </Field>
        <Field id="c-topic" label="Topic" chevron>
          <select {...bind("topic")}>
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field id="c-order" label="Order number (optional)">
          <input {...bind("order")} className="tnum uppercase" />
        </Field>
        <Field id="c-message" label="Message" error={errors.message} className="sm:col-span-2">
          <textarea {...bind("message")} rows={5} className="resize-y" />
        </Field>
      </div>
      <button type="submit" className="btn mt-6 w-full">
        Send
      </button>
    </form>
  );
}
