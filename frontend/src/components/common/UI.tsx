import { useId } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { Loader2, AlertCircle, Inbox } from "lucide-react";

export function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

/* --------------------------------- Button -------------------------------- */

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-800 shadow-sm",
  secondary: "bg-gold text-ink hover:bg-amber-400 shadow-sm",
  outline: "border border-line bg-white text-ink hover:bg-stone-50",
  ghost: "text-ink hover:bg-stone-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Button({
  variant = "primary",
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

/* --------------------------------- Input --------------------------------- */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  // Fall back to a generated id. Deriving it only from `name` left the
  // label unassociated on any input without one (the admin dialog, the
  // booking form) — invisible to screen readers and to getByLabel.
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          {label}
        </label>
      )}

      <input
        {...props}
        id={inputId}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm outline-none transition",
          "placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20",
          error ? "border-red-500" : "border-line",
          className,
        )}
      />

      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/* --------------------------------- Rating -------------------------------- */

export function Rating({
  value,
  count,
  size = 16,
  showEmpty = true,
}: {
  value: number | null;
  count?: number;
  size?: number;
  showEmpty?: boolean;
}) {
  if (value === null) {
    return showEmpty ? (
      <span className="text-xs text-muted">No reviews yet</span>
    ) : null;
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width={size}
            height={size}
            viewBox="0 0 20 20"
            className={star <= Math.round(value) ? "text-gold" : "text-stone-300"}
            fill="currentColor"
          >
            <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
          </svg>
        ))}
      </span>

      <span className="text-sm font-semibold text-ink">{value.toFixed(1)}</span>

      {count !== undefined && (
        <span className="text-xs text-muted">
          ({count} {count === 1 ? "review" : "reviews"})
        </span>
      )}

      <span className="sr-only">
        Rated {value.toFixed(1)} out of 5
        {count !== undefined ? ` from ${count} reviews` : ""}
      </span>
    </span>
  );
}

/* ---------------------------- Loading / Error ---------------------------- */

export function Loader({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 py-20 text-muted"
    >
      <Loader2 size={28} className="animate-spin text-brand" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="h-44 animate-pulse bg-stone-200" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-stone-200" />
      </div>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-8 text-center"
    >
      <AlertCircle className="text-red-600" size={26} />
      <p className="text-sm text-red-800">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line bg-white p-12 text-center">
      <Inbox className="text-muted" size={28} />
      <p className="font-semibold text-ink">{title}</p>
      {hint && <p className="max-w-sm text-sm text-muted">{hint}</p>}
      {action}
    </div>
  );
}

/* --------------------------------- Badge --------------------------------- */

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-stone-200 text-stone-700",
  ADMIN: "bg-brand-100 text-brand-900",
  USER: "bg-stone-100 text-stone-600",
};

export function Badge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        statusStyles[value] ?? "bg-stone-100 text-stone-700",
      )}
    >
      {value}
    </span>
  );
}
