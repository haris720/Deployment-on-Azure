import { useState } from "react";
import { Check, X, CalendarDays, Users } from "lucide-react";
import {
  useAdminReservations,
  useUpdateReservationStatus,
} from "@/hooks/useApi";
import {
  Badge,
  Button,
  Loader,
  EmptyState,
  ErrorState,
} from "@/components/common/UI";
import { apiError } from "@/api/axios";
import type { ReservationStatus } from "@/types";

const FILTERS: (ReservationStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
];

export default function AdminReservations() {
  const { data, isLoading, isError, error, refetch } = useAdminReservations();
  const updateStatus = useUpdateReservationStatus();
  const [filter, setFilter] = useState<ReservationStatus | "ALL">("ALL");
  const [actionError, setActionError] = useState("");

  if (isLoading) return <Loader label="Loading reservations…" />;

  if (isError) {
    return <ErrorState message={apiError(error)} onRetry={() => refetch()} />;
  }

  const reservations = (data ?? []).filter(
    (r) => filter === "ALL" || r.status === filter,
  );

  const setStatus = async (id: number, status: ReservationStatus) => {
    setActionError("");
    try {
      await updateStatus.mutateAsync({ id, status });
    } catch (err) {
      setActionError(apiError(err, "Could not update the status"));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Reservations</h1>
      <p className="mt-1 text-sm text-muted">
        Confirm or decline customer bookings.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            aria-pressed={filter === status}
            className={[
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              filter === status
                ? "bg-brand text-white"
                : "border border-line bg-white text-muted hover:border-brand",
            ].join(" ")}
          >
            {status === "ALL" ? "All" : status}
            {status !== "ALL" && (
              <span className="ml-1.5 opacity-70">
                {(data ?? []).filter((r) => r.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {actionError && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </p>
      )}

      {reservations.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No reservations"
            hint={
              filter === "ALL"
                ? "No one has booked a table yet."
                : `No ${filter.toLowerCase()} reservations.`
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {reservations.map((reservation) => {
            const when = new Date(reservation.reservationDate);

            return (
              <article
                key={reservation.id}
                className="rounded-xl border border-line bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold">
                      {reservation.restaurant.name}
                    </h2>

                    <p className="mt-0.5 text-sm text-muted">
                      {reservation.user?.name} · {reservation.user?.email}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={14} className="text-brand" />
                        {when.toLocaleDateString()}{" "}
                        {when.toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Users size={14} className="text-brand" />
                        {reservation.people}
                      </span>
                    </div>

                    {reservation.specialRequest && (
                      <p className="mt-2 rounded-lg bg-stone-100 px-3 py-2 text-sm text-muted">
                        “{reservation.specialRequest}”
                      </p>
                    )}
                  </div>

                  <Badge value={reservation.status} />
                </div>

                {reservation.status === "PENDING" && (
                  <div className="mt-4 flex gap-2 border-t border-line pt-4">
                    <Button
                      onClick={() => setStatus(reservation.id, "CONFIRMED")}
                      loading={
                        updateStatus.isPending &&
                        updateStatus.variables?.id === reservation.id
                      }
                    >
                      <Check size={15} />
                      Confirm
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setStatus(reservation.id, "CANCELLED")}
                    >
                      <X size={15} />
                      Decline
                    </Button>
                  </div>
                )}

                {reservation.status === "CONFIRMED" && (
                  <div className="mt-4 border-t border-line pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStatus(reservation.id, "COMPLETED")}
                    >
                      Mark as completed
                    </Button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
