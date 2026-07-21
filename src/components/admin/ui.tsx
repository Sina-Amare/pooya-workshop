"use client";

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/* Small, consistent form primitives for the admin panel. */

export function Field({
  label,
  hint,
  children,
  required,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2 text-[0.88rem] font-semibold text-ink">
        {label}
        {required && <span className="text-copper">*</span>}
        {hint && <span className="text-[0.75rem] font-normal text-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-[0.95rem] text-ink placeholder:text-muted/60 transition-colors focus:border-copper focus:outline-none focus-visible:outline-none";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={4}
      {...props}
      className={`${inputClass} leading-7 ${props.className ?? ""}`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${inputClass} ${props.className ?? ""}`}>
      {props.children}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-3.5 text-start transition-colors hover:border-line-strong"
    >
      <span>
        <span className="block text-[0.92rem] font-semibold">{label}</span>
        {description && (
          <span className="mt-0.5 block text-[0.78rem] text-muted">{description}</span>
        )}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-copper" : "bg-ink/20"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
            checked ? "start-[1.375rem]" : "start-0.5"
          }`}
        />
      </span>
    </button>
  );
}

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-espresso text-bone hover:bg-espresso-2 disabled:opacity-50 disabled:hover:bg-espresso",
  secondary:
    "border border-line-strong bg-surface text-ink hover:border-copper/60 hover:text-copper disabled:opacity-50",
  danger:
    "border border-[#c8574a]/40 bg-surface text-[#a03325] hover:bg-[#a03325] hover:text-white disabled:opacity-50",
  ghost: "text-muted hover:text-ink disabled:opacity-40",
};

export function Button({
  variant = "primary",
  busy,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || busy}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[0.92rem] font-semibold transition-colors ${variants[variant]} ${props.className ?? ""}`}
    >
      {busy && <Spinner />}
      {children}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className ?? ""}`}
      aria-hidden
    />
  );
}

export function Card({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6 ${className ?? ""}`}
    >
      {(title || action) && (
        <header className="mb-5 flex items-center justify-between gap-4">
          {title && <h2 className="font-display text-lg font-bold">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
