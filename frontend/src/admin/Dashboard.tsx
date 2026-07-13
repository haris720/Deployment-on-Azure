import { Link } from "react-router-dom";
import {
  Users,
  UtensilsCrossed,
  Star,
  CalendarDays,
  Clock,
  Shield,
  Tags,
  CheckCircle2,
} from "lucide-react";
import { useDashboard } from "@/hooks/useApi";
import { Loader, ErrorState } from "@/components/common/UI";
import { apiError } from "@/api/axios";

export default function Dashboard() {
  const { data, isLoading, isError, error, refetch } = useDashboard();

  if (isLoading) return <Loader label="Loading dashboard…" />;

  if (isError || !data) {
    return <ErrorState message={apiError(error)} onRetry={() => refetch()} />;
  }

  const cards = [
    { label: "Users", value: data.users, icon: Users, to: "/admin/users" },
    { label: "Admins", value: data.admins, icon: Shield, to: "/admin/users" },
    {
      label: "Restaurants",
      value: data.restaurants,
      icon: UtensilsCrossed,
      to: "/admin/restaurants",
    },
    {
      label: "Active restaurants",
      value: data.activeRestaurants,
      icon: CheckCircle2,
      to: "/admin/restaurants",
    },
    { label: "Categories", value: data.categories, icon: Tags },
    { label: "Reviews", value: data.reviews, icon: Star },
    {
      label: "Reservations",
      value: data.reservations,
      icon: CalendarDays,
      to: "/admin/reservations",
    },
    {
      label: "Pending bookings",
      value: data.pendingReservations,
      icon: Clock,
      to: "/admin/reservations",
      highlight: data.pendingReservations > 0,
    },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">
        A live view of the whole platform.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, to, highlight }) => {
          const card = (
            <div
              className={[
                "h-full rounded-2xl border bg-surface p-5 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                highlight ? "border-gold/60 ring-1 ring-gold/25" : "border-line",
                to ? "hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift" : "",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-10 w-10 place-items-center rounded-xl",
                  highlight ? "bg-gold-100 text-gold-600" : "bg-brand-50 text-brand",
                ].join(" ")}
              >
                <Icon size={18} />
              </span>
              <p className="tabular mt-4 text-3xl font-bold">{value}</p>
              <p className="text-sm text-muted">{label}</p>
            </div>
          );

          return to ? (
            <Link key={label} to={to}>
              {card}
            </Link>
          ) : (
            <div key={label}>{card}</div>
          );
        })}
      </div>

      {data.pendingReservations > 0 && (
        <div className="mt-6 rounded-2xl border border-gold/50 bg-gold-100/70 p-6">
          <p className="font-semibold">
            {data.pendingReservations} reservation
            {data.pendingReservations === 1 ? "" : "s"} awaiting confirmation
          </p>
          <p className="mt-1 text-sm text-stone-700">
            Customers are waiting for a decision on their booking.
          </p>
          <Link
            to="/admin/reservations"
            className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Review them →
          </Link>
        </div>
      )}
    </div>
  );
}
