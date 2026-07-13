import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MapPin, ArrowRight } from "lucide-react";
import { imageUrl } from "@/api/axios";
import { Rating, cn, fadeUp } from "@/components/common/UI";
import type { Restaurant } from "@/types";

function averageRating(restaurant: Restaurant) {
  const reviews = restaurant.reviews;
  if (!reviews?.length) return null;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

/* Most restaurants have no photo yet. A flat grey box reads as broken, so the
   fallback is a warm gradient picked deterministically from the id — the same
   restaurant always gets the same one, and the wall of cards looks varied. */
const covers = [
  "from-brand-700 via-brand to-brand-500",
  "from-stone-700 via-stone-600 to-stone-500",
  "from-amber-700 via-amber-600 to-amber-500",
  "from-emerald-800 via-emerald-700 to-emerald-500",
  "from-rose-800 via-rose-700 to-rose-500",
  "from-teal-800 via-teal-700 to-teal-500",
];

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
  const gradient = covers[restaurant.id % covers.length];

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition-shadow duration-300 hover:shadow-lift"
    >
      <div className="relative overflow-hidden">
        <Link
          to={`/restaurants/${restaurant.id}`}
          className="block"
          tabIndex={-1}
          aria-hidden
        >
          {cover ? (
            <img
              src={imageUrl(cover)}
              alt=""
              loading="lazy"
              className="h-48 w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
            />
          ) : (
            <div
              className={cn(
                "relative flex h-48 w-full items-center justify-center bg-gradient-to-br",
                gradient,
              )}
            >
              <span
                className="absolute inset-0 opacity-[0.15]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }}
              />
              <span className="font-display text-6xl font-semibold text-white/95 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110">
                {restaurant.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </Link>

        {/* Scrim: keeps the category chip legible over any photo. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />

        {restaurant.category && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold tracking-wide text-brand-700 shadow-soft backdrop-blur">
            {restaurant.category.name}
          </span>
        )}

        {onToggleFavorite && (
          <motion.button
            type="button"
            onClick={() => onToggleFavorite(restaurant)}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            aria-label={
              isFavorite
                ? `Remove ${restaurant.name} from favorites`
                : `Save ${restaurant.name} to favorites`
            }
            aria-pressed={isFavorite}
            className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-soft backdrop-blur"
          >
            <Heart
              size={16}
              className={cn(
                "transition-colors duration-200",
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-stone-500 hover:text-red-500",
              )}
            />
          </motion.button>
        )}
      </div>

      <div className="space-y-2 p-5">
        <Rating value={rating} size={14} showEmpty />

        <h3 className="font-display truncate text-xl font-semibold">
          <Link
            to={`/restaurants/${restaurant.id}`}
            className="outline-none transition-colors duration-200 hover:text-brand focus-visible:text-brand"
          >
            {/* Stretches the link over the whole card, so the entire surface
                is clickable without nesting interactive elements. */}
            <span className="absolute inset-0 z-0" aria-hidden />
            {restaurant.name}
          </Link>
        </h3>

        <p className="flex items-center gap-1.5 text-sm text-muted">
          <MapPin size={13} className="shrink-0" />
          {restaurant.city}
        </p>

        {restaurant.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">
            {restaurant.description}
          </p>
        )}

        <span className="relative z-10 mt-4 flex items-center justify-between rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-300 group-hover:bg-brand-700 group-hover:shadow-lift">
          Reserve a table
          <ArrowRight
            size={15}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </span>
      </div>
    </motion.article>
  );
}
