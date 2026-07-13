import { Link } from "react-router-dom";
import { useFavorites, useToggleFavorite } from "@/hooks/useApi";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import {
  Button,
  CardSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/common/UI";
import { apiError } from "@/api/axios";

export default function Favorites() {
  const { data, isLoading, isError, error, refetch } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Your favorites</h1>
      <p className="mt-1 text-sm text-muted">
        {data?.length
          ? `${data.length} saved ${data.length === 1 ? "place" : "places"}`
          : "Places you save appear here."}
      </p>

      {isError && (
        <div className="mt-8">
          <ErrorState message={apiError(error)} onRetry={() => refetch()} />
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}

        {data?.map((favorite) => (
          <RestaurantCard
            key={favorite.id}
            restaurant={favorite.restaurant}
            isFavorite
            onToggleFavorite={() =>
              toggleFavorite.mutate({
                restaurantId: favorite.restaurantId,
                isFavorite: true,
              })
            }
          />
        ))}
      </div>

      {data?.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="No favorites yet"
            hint="Tap the heart on any restaurant to save it here."
            action={
              <Link to="/restaurants">
                <Button>Browse restaurants</Button>
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}
