import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Heart,
  CalendarDays,
  Star,
} from "lucide-react";
import {
  useRestaurant,
  useReviews,
  useCreateReview,
  useFavorites,
  useToggleFavorite,
  useCreateReservation,
} from "@/hooks/useApi";
import {
  Button,
  Input,
  Loader,
  ErrorState,
  Rating,
  cn,
} from "@/components/common/UI";
import { apiError, imageUrl } from "@/api/axios";
import { useAuth } from "@/store/auth.store";

function ReviewForm({ restaurantId }: { restaurantId: number }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const createReview = useCreateReview(restaurantId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating < 1) {
      setError("Pick a star rating first");
      return;
    }

    try {
      await createReview.mutateAsync({
        rating,
        comment: comment.trim() || undefined,
      });
      setRating(0);
      setComment("");
    } catch (err) {
      // The API allows only one review per person per restaurant.
      setError(apiError(err, "Could not post your review"));
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-line bg-white p-5"
    >
      <p className="font-semibold">Write a review</p>

      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            aria-pressed={rating === star}
            className="p-0.5 transition hover:scale-110"
          >
            <Star
              size={26}
              className={cn(
                star <= rating
                  ? "fill-gold text-gold"
                  : "text-stone-300",
              )}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="How was the food and service?"
        className="mt-3 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <Button
        type="submit"
        loading={createReview.isPending}
        className="mt-3 w-full sm:w-auto"
      >
        Post review
      </Button>
    </form>
  );
}

function ReservationForm({ restaurantId }: { restaurantId: number }) {
  const [date, setDate] = useState("");
  const [people, setPeople] = useState(2);
  const [specialRequest, setSpecialRequest] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const createReservation = useCreateReservation();

  // The API rejects past dates; don't even let the picker offer them.
  const minDate = new Date(Date.now() + 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDone(false);

    const when = new Date(date);

    if (!date || Number.isNaN(when.getTime())) {
      setError("Pick a date and time");
      return;
    }

    if (when.getTime() <= Date.now()) {
      setError("The reservation date must be in the future");
      return;
    }

    try {
      await createReservation.mutateAsync({
        restaurantId,
        reservationDate: new Date(date).toISOString(),
        people,
        specialRequest: specialRequest.trim() || undefined,
      });

      setDone(true);
      setDate("");
      setSpecialRequest("");
    } catch (err) {
      setError(apiError(err, "Could not create the reservation"));
    }
  };

  return (
    // noValidate: the picker's `min` makes the browser silently refuse to
    // submit an out-of-range date, so neither our message nor the API's
    // would ever appear. We validate here and let the server have the
    // final say.
    <form
      noValidate
      onSubmit={submit}
      className="sticky top-24 rounded-xl border border-line bg-white p-5 shadow-sm"
    >
      <p className="flex items-center gap-2 font-semibold">
        <CalendarDays size={18} className="text-brand" />
        Reserve a table
      </p>

      <div className="mt-4 space-y-3">
        <Input
          label="Date & time"
          type="datetime-local"
          min={minDate}
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <Input
          label="People"
          type="number"
          min={1}
          max={50}
          required
          value={people}
          onChange={(e) => setPeople(Number(e.target.value))}
        />

        <div>
          <label
            htmlFor="specialRequest"
            className="mb-1.5 block text-sm font-medium"
          >
            Special request
          </label>
          <textarea
            id="specialRequest"
            rows={2}
            maxLength={500}
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
            placeholder="Window seat, birthday…"
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {done && (
        <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          Reservation requested. Track it under{" "}
          <Link to="/reservations" className="font-semibold underline">
            My reservations
          </Link>
          .
        </p>
      )}

      <Button
        type="submit"
        loading={createReservation.isPending}
        className="mt-4 w-full"
      >
        Request reservation
      </Button>

      <p className="mt-2 text-center text-xs text-muted">
        The restaurant confirms your booking.
      </p>
    </form>
  );
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const restaurantId = Number(id);
  const user = useAuth((s) => s.user);

  const { data, isLoading, isError, error, refetch } =
    useRestaurant(restaurantId);
  const reviews = useReviews(restaurantId);
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) return <Loader label="Loading restaurant…" />;

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message={apiError(error)} onRetry={() => refetch()} />
      </div>
    );
  }

  const { restaurant, rating } = data;
  const images = restaurant.images ?? [];
  const isFavorite = (favorites ?? []).some(
    (f) => f.restaurantId === restaurant.id,
  );

  const alreadyReviewed = (reviews.data?.reviews ?? []).some(
    (r) => r.userId === user?.id,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* gallery */}
      <div className="overflow-hidden rounded-2xl">
        {images.length > 0 ? (
          <>
            <img
              src={imageUrl(images[activeImage].url)}
              alt={restaurant.name}
              className="h-64 w-full object-cover sm:h-96"
            />

            {images.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto">
                {images.map((image, i) => (
                  <button
                    key={image.id}
                    onClick={() => setActiveImage(i)}
                    aria-label={`Image ${i + 1}`}
                    className={cn(
                      "h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2",
                      i === activeImage ? "border-brand" : "border-transparent",
                    )}
                  >
                    <img
                      src={imageUrl(image.url)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-64 items-center justify-center bg-gradient-to-br from-brand-600 to-brand-900 text-6xl font-bold text-white/90 sm:h-80">
            {restaurant.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              {restaurant.category && (
                <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand">
                  {restaurant.category.name}
                </span>
              )}

              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                {restaurant.name}
              </h1>

              <div className="mt-2">
                <Rating value={rating.average} count={rating.count} size={18} />
              </div>
            </div>

            {user && (
              <Button
                variant={isFavorite ? "secondary" : "outline"}
                onClick={() =>
                  toggleFavorite.mutate({
                    restaurantId: restaurant.id,
                    isFavorite,
                  })
                }
                loading={toggleFavorite.isPending}
              >
                <Heart
                  size={16}
                  className={cn(isFavorite && "fill-current")}
                />
                {isFavorite ? "Saved" : "Save"}
              </Button>
            )}
          </div>

          {restaurant.description && (
            <section className="mt-6">
              <h2 className="text-lg font-semibold">About</h2>
              <p className="mt-2 leading-relaxed text-muted">
                {restaurant.description}
              </p>
            </section>
          )}

          <section className="mt-6 grid gap-3 rounded-xl border border-line bg-white p-5 sm:grid-cols-2">
            <p className="flex items-start gap-2 text-sm">
              <MapPin size={16} className="mt-0.5 shrink-0 text-brand" />
              <span>
                {restaurant.address}
                <span className="block text-muted">{restaurant.city}</span>
              </span>
            </p>

            {(restaurant.openingTime || restaurant.closingTime) && (
              <p className="flex items-start gap-2 text-sm">
                <Clock size={16} className="mt-0.5 shrink-0 text-brand" />
                <span>
                  {restaurant.openingTime ?? "—"} to{" "}
                  {restaurant.closingTime ?? "—"}
                </span>
              </p>
            )}

            {restaurant.phone && (
              <p className="flex items-center gap-2 text-sm">
                <Phone size={16} className="shrink-0 text-brand" />
                <a href={`tel:${restaurant.phone}`} className="hover:underline">
                  {restaurant.phone}
                </a>
              </p>
            )}

            {restaurant.website && (
              <p className="flex items-center gap-2 text-sm">
                <Globe size={16} className="shrink-0 text-brand" />
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="truncate hover:underline"
                >
                  {restaurant.website}
                </a>
              </p>
            )}
          </section>

          {/* reviews */}
          <section className="mt-8">
            <h2 className="text-lg font-semibold">
              Reviews{" "}
              {reviews.data && (
                <span className="text-muted">({reviews.data.rating.count})</span>
              )}
            </h2>

            <div className="mt-4 space-y-4">
              {user && !alreadyReviewed && (
                <ReviewForm restaurantId={restaurant.id} />
              )}

              {user && alreadyReviewed && (
                <p className="rounded-lg bg-stone-100 p-3 text-sm text-muted">
                  You've already reviewed this restaurant.
                </p>
              )}

              {!user && (
                <p className="rounded-lg bg-stone-100 p-3 text-sm text-muted">
                  <Link to="/login" className="font-semibold text-brand">
                    Log in
                  </Link>{" "}
                  to write a review.
                </p>
              )}

              {reviews.data?.reviews.length === 0 && (
                <p className="text-sm text-muted">
                  No reviews yet — be the first.
                </p>
              )}

              {reviews.data?.reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-line bg-white p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-white">
                      {review.user.name.charAt(0).toUpperCase()}
                    </span>

                    <div>
                      <p className="text-sm font-semibold">
                        {review.user.name}
                      </p>
                      <p className="text-xs text-muted">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span className="ml-auto">
                      <Rating value={review.rating} size={14} />
                    </span>
                  </div>

                  {review.comment && (
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {review.comment}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* booking */}
        <aside>
          {user ? (
            <ReservationForm restaurantId={restaurant.id} />
          ) : (
            <div className="sticky top-24 rounded-xl border border-line bg-white p-5 text-center">
              <CalendarDays className="mx-auto text-brand" size={22} />
              <p className="mt-3 font-semibold">Reserve a table</p>
              <p className="mt-1 text-sm text-muted">
                Log in to book at {restaurant.name}.
              </p>
              <Link to="/login">
                <Button className="mt-4 w-full">Log in to reserve</Button>
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
