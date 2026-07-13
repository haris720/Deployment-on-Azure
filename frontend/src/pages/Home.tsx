import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Star, CalendarCheck, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useCategories, useRestaurants } from "@/hooks/useApi";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { CardSkeleton, ErrorState, Button } from "@/components/common/UI";
import { apiError } from "@/api/axios";

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");

  const { data: categories } = useCategories();
  const featured = useRestaurants({ limit: 6 });

  const onSearch = (e: FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (city.trim()) params.set("city", city.trim());

    navigate(`/restaurants?${params.toString()}`);
  };

  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand to-brand-600">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:py-32">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl"
          >
            Discover amazing
            <span className="block text-gold">restaurants near you</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-5 max-w-xl text-base text-brand-100 sm:text-lg"
          >
            Read honest reviews, save your favorites and reserve a table in
            seconds.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={onSearch}
            className="mx-auto mt-10 flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl sm:flex-row"
          >
            <label className="flex flex-1 items-center gap-2 px-3">
              <Search size={18} className="shrink-0 text-muted" />
              <span className="sr-only">Search restaurants</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurants or cuisine"
                className="w-full py-3 text-sm outline-none"
              />
            </label>

            <span className="hidden w-px bg-line sm:block" />

            <label className="flex flex-1 items-center gap-2 px-3">
              <MapPin size={18} className="shrink-0 text-muted" />
              <span className="sr-only">City</span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full py-3 text-sm outline-none"
              />
            </label>

            <Button type="submit" className="sm:px-8">
              Search
            </Button>
          </motion.form>
        </div>
      </section>

      {/* categories */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold">Browse by category</h2>
        <p className="mt-1 text-sm text-muted">
          Find exactly the kind of food you're craving.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {(categories ?? []).map((category) => (
            <Link
              key={category.id}
              to={`/restaurants?categoryId=${category.id}`}
              className="group rounded-xl border border-line bg-white p-5 text-center transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
            >
              <p className="font-semibold text-ink group-hover:text-brand">
                {category.name}
              </p>
              {category._count && (
                <p className="mt-1 text-xs text-muted">
                  {category._count.restaurants}{" "}
                  {category._count.restaurants === 1 ? "place" : "places"}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* featured */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Featured restaurants</h2>
            <p className="mt-1 text-sm text-muted">
              Handpicked places people are loving right now.
            </p>
          </div>

          <Link
            to="/restaurants"
            className="hidden text-sm font-semibold text-brand hover:underline sm:block"
          >
            View all →
          </Link>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.isLoading &&
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}

          {featured.isError && (
            <div className="sm:col-span-2 lg:col-span-3">
              <ErrorState
                message={apiError(featured.error)}
                onRetry={() => featured.refetch()}
              />
            </div>
          )}

          {featured.data?.restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </section>

      {/* value props */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:grid-cols-3">
          {[
            {
              icon: Star,
              title: "Honest reviews",
              text: "Ratings come from real diners — one review per person, no spam.",
            },
            {
              icon: Heart,
              title: "Save what you love",
              text: "Favorite places and organise them into your own lists.",
            },
            {
              icon: CalendarCheck,
              title: "Reserve in seconds",
              text: "Book a table and track your reservation status live.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand">
                <Icon size={22} />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
