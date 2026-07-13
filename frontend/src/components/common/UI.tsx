import { useId } from "react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, Inbox } from "lucide-react";

export function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

/* -------------------------------------------------------------------------- */
/* Motion presets — one vocabulary, reused, so the app feels of a piece.       */
/* -------------------------------------------------------------------------- */

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Content rises and fades in. */
export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

/** Parent of a grid: children arrive one after another, not all at once. */
export const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

/** Reveals its children as they scroll into view. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* --------------------------------- Button --------------------------------- */

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-soft hover:bg-brand-700 hover:shadow-lift hover:-translate-y-px",
  secondary:
    "bg-gold text-ink shadow-soft hover:bg-gold-300 hover:shadow-lift hover:-translate-y-px",
  outline:
    "border border-line bg-surface text-ink hover:border-brand-300 hover:bg-brand-50/60",
  ghost: "text-ink-soft hover:bg-stone-100 hover:text-ink",
  danger: "bg-red-600 text-white shadow-soft hover:bg-red-700",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
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
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold",
        // The press is what makes a button feel physical.
        "transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:translate-y-0 active:scale-[0.97]",
        "disabled:pointer-events-none disabled:opacity-55",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

/* --------------------------------- Input ---------------------------------- */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: InputProps) {
  // Fall back to a generated id: deriving it only from `name` left the label
  // unassociated on inputs without one — invisible to screen readers.
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-[13px] font-semibold tracking-wide text-ink-soft"
        >
          {label}
        </label>
      )}

      <input
        {...props}
        id={inputId}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink",
          "transition-all duration-200 outline-none placeholder:text-muted/70",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
            : "border-line focus:border-brand-400 focus:ring-4 focus:ring-brand-400/12",
          className,
        )}
      />

      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          role="alert"
          className="mt-1.5 text-xs font-medium text-red-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

/* --------------------------------- Rating --------------------------------- */

export function Rating({
  value,
  count,
  size = 15,
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
      <span className="inline-flex gap-px" aria-hidden>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width={size}
            height={size}
            viewBox="0 0 20 20"
            fill="currentColor"
            className={
              star <= Math.round(value) ? "text-gold" : "text-stone-300"
            }
          >
            <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
          </svg>
        ))}
      </span>

      <span className="tabular text-sm font-bold text-ink">
        {value.toFixed(1)}
      </span>

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

/* ----------------------------- Loading / Error ---------------------------- */

export function Loader({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 py-24 text-muted"
    >
      <span className="relative flex h-10 w-10 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand/20" />
        <Loader2 size={26} className="animate-spin text-brand" />
      </span>
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="skeleton h-48 w-full" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-3.5 w-24 rounded-full" />
        <div className="skeleton h-5 w-3/4 rounded-full" />
        <div className="skeleton h-3.5 w-1/2 rounded-full" />
        <div className="skeleton mt-4 h-10 w-full rounded-xl" />
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
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: EASE }}
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50/70 p-8 text-center"
    >
      <AlertCircle className="text-red-600" size={26} />
      <p className="text-sm font-medium text-red-800">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-surface/60 p-14 text-center"
    >
      <span className="grid h-12 w-12 place-items-center rounded-full bg-stone-100 text-muted">
        <Inbox size={22} />
      </span>
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {hint && <p className="max-w-sm text-sm text-muted">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  );
}

/* --------------------------------- Badge ---------------------------------- */

const statusStyles: Record<string, string> = {
  PENDING: "bg-gold-100 text-gold-600 ring-gold/30",
  CONFIRMED: "bg-brand-50 text-brand-700 ring-brand-300/50",
  CANCELLED: "bg-red-50 text-red-700 ring-red-300/50",
  COMPLETED: "bg-stone-100 text-stone-600 ring-stone-300/50",
  ADMIN: "bg-brand-50 text-brand-700 ring-brand-300/50",
  USER: "bg-stone-100 text-stone-600 ring-stone-300/50",
};

export function Badge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ring-1 ring-inset",
        statusStyles[value] ?? "bg-stone-100 text-stone-700 ring-stone-300/50",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {value}
    </span>
  );
}
