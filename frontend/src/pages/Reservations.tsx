import { Link } from "react-router-dom";
import { CalendarDays, Users, MessageSquare, MapPin } from "lucide-react";
import { useMyReservations, useCancelReservation } from "@/hooks/useApi";
import {
  Badge,
  Button,
  Loader,
  EmptyState,
  ErrorState,
} from "@/components/common/UI";
import { apiError } from "@/api/axios";

export default function Reservations() {
  const { data, isLoading, isError, error, refetch } = useMyReservations();
  const cancel = useCancelReservation();

  if (isLoading) return <Loader label="Loading your reservations…" />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Your reservations</h1>
      <p className="mt-1 text-sm text-muted">
        Track every booking and its status.
      </p>

      {isError && (
        <div className="mt-8">
          <ErrorState message={apiError(error)} onRetry={() => refetch()} />
        </div>
      )}

      {data?.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="No reservations yet"
            hint="Find a restaurant and request a table — it takes seconds."
            action={
              <Link to="/restaurants">
                <Button>Find a restaurant</Button>
              </Link>
            }
          />
        </div>
      )}

      <div className="mt-8 space-y-4">
        {data?.map((reservation) => {
          const when = new Date(reservation.reservationDate);
          const cancellable =
            reservation.status === "PENDING" ||
            reservation.status === "CONFIRMED";

          return (
            <article
              key={reservation.id}
              className="rounded-xl border border-line bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">
                    <Link
                      to={`/restaurants/${reservation.restaurantId}`}
                      className="hover:text-brand"
                    >
                      {reservation.restaurant.name}
                    </Link>
                  </h2>

                  <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
                    <MapPin size={13} />
                    {reservation.restaurant.city}
                  </p>
                </div>

                <Badge value={reservation.status} />
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <CalendarDays size={15} className="text-brand" />
                  <div>
                    <dt className="sr-only">Date</dt>
                    <dd>
                      {when.toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      <span className="block text-xs text-muted">
                        {when.toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </dd>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users size={15} className="text-brand" />
                  <div>
                    <dt className="sr-only">Party size</dt>
                    <dd>
                      {reservation.people}{" "}
                      {reservation.people === 1 ? "person" : "people"}
                    </dd>
                  </div>
                </div>

                {reservation.specialRequest && (
                  <div className="flex items-center gap-2">
                    <MessageSquare size={15} className="text-brand" />
                    <div className="min-w-0">
                      <dt className="sr-only">Special request</dt>
                      <dd className="truncate">{reservation.specialRequest}</dd>
                    </div>
                  </div>
                )}
              </dl>

              {cancellable && (
                <div className="mt-4 border-t border-line pt-4">
                  <Button
                    variant="outline"
                    loading={
                      cancel.isPending && cancel.variables === reservation.id
                    }
                    onClick={() => {
                      if (confirm("Cancel this reservation?")) {
                        cancel.mutate(reservation.id);
                      }
                    }}
                  >
                    Cancel reservation
                  </Button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
