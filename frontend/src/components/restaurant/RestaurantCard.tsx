import { Link } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";
import { imageUrl } from "@/api/axios";
import { Rating, cn } from "@/components/common/UI";
import type { Restaurant } from "@/types";

function averageRating(restaurant: Restaurant) {
  const reviews = restaurant.reviews;
  if (!reviews?.length) return null;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export function RestaurantCard({
  restaurant,
  isFavorite = false,
  onToggleFavorite,
}: {
  restaurant: Restaurant;
  isFavorite?: boolean;
  onToggleFavorite?: (restaurant: Restaurant) => void;
}) {
  const cover = restaurant.images?.[0]?.url;
  const rating = averageRating(restaurant);

  return (
    <article className="group overflow-hidden rounded-xl border border-line bg-white transition hover:shadow-lg">
      <div className="relative">
        <Link to={`/restaurants/${restaurant.id}`}>
          {cover ? (
            <img
              src={imageUrl(cover)}
              alt={restaurant.name}
              loading="lazy"
              className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-brand-600 to-brand-900 text-3xl font-semibold text-white/90">
              {restaurant.name.charAt(0)}
            </div>
          )}
        </Link>

        {onToggleFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(restaurant)}
            aria-label={
              isFavorite
                ? `Remove ${restaurant.name} from favorites`
                : `Save ${restaurant.name} to favorites`
            }
            aria-pressed={isFavorite}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow transition hover:scale-110"
          >
            <Heart
              size={17}
              className={cn(
                isFavorite ? "fill-red-500 text-red-500" : "text-stone-500",
              )}
            />
          </button>
        )}

        {restaurant.category && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-brand">
            {restaurant.category.name}
          </span>
        )}
      </div>

      <div className="space-y-2 p-4">
        <Rating value={rating} size={14} showEmpty />

        <h3 className="truncate text-lg font-semibold text-ink">
          <Link
            to={`/restaurants/${restaurant.id}`}
            className="outline-none hover:text-brand focus-visible:text-brand"
          >
            {restaurant.name}
          </Link>
        </h3>

        <p className="flex items-center gap-1 text-sm text-muted">
          <MapPin size={13} />
          {restaurant.city}
        </p>

        {restaurant.description && (
          <p className="line-clamp-2 text-sm text-muted">
            {restaurant.description}
          </p>
        )}

        <Link
          to={`/restaurants/${restaurant.id}`}
          className="mt-3 block rounded-lg bg-brand px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-brand-800"
        >
          Reserve a table
        </Link>
      </div>
    </article>
  );
}
