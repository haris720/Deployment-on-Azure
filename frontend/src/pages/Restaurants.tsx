import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  useCategories,
  useRestaurants,
  useFavorites,
  useToggleFavorite,
} from "@/hooks/useApi";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import {
  Button,
  CardSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/common/UI";
import { apiError } from "@/api/axios";
import { useAuth } from "@/store/auth.store";
import type { Restaurant } from "@/types";

export default function Restaurants() {
  const [params, setParams] = useSearchParams();
  const user = useAuth((s) => s.user);

  const [search, setSearch] = useState(params.get("search") ?? "");
  const [city, setCity] = useState(params.get("city") ?? "");

  const categoryId = params.get("categoryId") ?? "";
  const page = Number(params.get("page") ?? 1);

  // Keep the inputs in step when the user navigates with browser back.
  useEffect(() => {
    setSearch(params.get("search") ?? "");
    setCity(params.get("city") ?? "");
  }, [params]);

  const { data: categories } = useCategories();
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const query = useRestaurants({
    search: params.get("search") ?? "",
    city: params.get("city") ?? "",
    categoryId: categoryId ? Number(categoryId) : "",
    page,
    limit: 12,
  });

  const favoriteIds = new Set(
    (favorites ?? []).map((f) => f.restaurantId),
  );

  const update = (next: Record<string, string>) => {
    const merged = new URLSearchParams(params);

    Object.entries(next).forEach(([key, value]) => {
      if (value) merged.set(key, value);
      else merged.delete(key);
    });

    // Any filter change resets to page 1, otherwise a narrower search
    // can land the user on an empty page 3.
    if (!("page" in next)) merged.delete("page");

    setParams(merged);
  };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    update({ search, city });
  };

  const onToggleFavorite = (restaurant: Restaurant) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    toggleFavorite.mutate({
      restaurantId: restaurant.id,
      isFavorite: favoriteIds.has(restaurant.id),
    });
  };

  const hasFilters = Boolean(
    params.get("search") || params.get("city") || categoryId,
  );

  const pagination = query.data?.pagination;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Discover restaurants</h1>
      <p className="mt-1 text-sm text-muted">
        {pagination
          ? `${pagination.total} ${pagination.total === 1 ? "place" : "places"} to explore`
          : "Search, filter and find your next meal."}
      </p>

      {/* filters */}
      <form
        onSubmit={onSearch}
        className="mt-6 flex flex-col gap-3 rounded-xl border border-line bg-white p-4 md:flex-row md:items-center"
      >
        <label className="flex flex-1 items-center gap-2 rounded-lg border border-line px-3">
          <Search size={16} className="text-muted" />
          <span className="sr-only">Search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or description"
            className="w-full py-2.5 text-sm outline-none"
          />
        </label>

        <label className="flex items-center gap-2 rounded-lg border border-line px-3 md:w-48">
          <SlidersHorizontal size={16} className="text-muted" />
          <span className="sr-only">City</span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="w-full py-2.5 text-sm outline-none"
          />
        </label>

        <label className="md:w-48">
          <span className="sr-only">Category</span>
          <select
            value={categoryId}
            onChange={(e) => update({ categoryId: e.target.value })}
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none"
          >
            <option value="">All categories</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <Button type="submit">Search</Button>

        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearch("");
              setCity("");
              setParams(new URLSearchParams());
            }}
          >
            <X size={15} />
            Clear
          </Button>
        )}
      </form>

      {/* results */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {query.isLoading &&
          Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}

        {query.data?.restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            isFavorite={favoriteIds.has(restaurant.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {query.isError && (
        <ErrorState
          message={apiError(query.error)}
          onRetry={() => query.refetch()}
        />
      )}

      {query.data?.restaurants.length === 0 && (
        <EmptyState
          title="No restaurants found"
          hint="Try a different search term, city or category."
          action={
            hasFilters ? (
              <Button
                variant="outline"
                onClick={() => setParams(new URLSearchParams())}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      )}

      {/* pagination */}
      {pagination && pagination.pages > 1 && (
        <nav
          className="mt-10 flex items-center justify-center gap-2"
          aria-label="Pagination"
        >
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => update({ page: String(page - 1) })}
          >
            Previous
          </Button>

          <span className="px-3 text-sm text-muted">
            Page {pagination.page} of {pagination.pages}
          </span>

          <Button
            variant="outline"
            disabled={page >= pagination.pages}
            onClick={() => update({ page: String(page + 1) })}
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}
