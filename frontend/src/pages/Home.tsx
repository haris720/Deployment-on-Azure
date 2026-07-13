import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Star,
  CalendarCheck,
  Heart,
  ArrowRight,
} from "lucide-react";
import { useCategories, useRestaurants } from "@/hooks/useApi";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import {
  CardSkeleton,
  ErrorState,
  Button,
  Reveal,
  stagger,
  fadeUp,
  EASE,
} from "@/components/common/UI";
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
      {/* ------------------------------- hero ------------------------------- */}
      <section className="relative overflow-hidden bg-brand-950">
        {/* Layered light: two soft radial washes give the flat green depth. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 60% at 15% 0%, #0f766e 0%, transparent 60%), radial-gradient(70% 60% at 90% 20%, #159a8b 0%, transparent 55%)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden
        />

        {/* A slow drifting glow — motion you feel rather than notice. */}
        <motion.div
          aria-hidden
          className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-gold/15 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 24, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:py-32">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-brand-100 backdrop-blur"
          >
            <Star size={12} className="fill-gold text-gold" />
            Trusted reviews from real diners
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
            className="font-display mt-6 text-5xl font-semibold leading-[1.05] text-white sm:text-6xl md:text-7xl"
          >
            Discover amazing
            <span className="mt-1 block bg-gradient-to-r from-gold-300 via-gold to-gold-300 bg-clip-text text-transparent">
              restaurants near you
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.18 }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-brand-100/90 sm:text-lg"
          >
            Read honest reviews, save the places you love, and reserve a table
            in seconds.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.28 }}
            onSubmit={onSearch}
            className="mx-auto mt-10 flex max-w-2xl flex-col gap-2 rounded-2xl bg-white/95 p-2 shadow-hero backdrop-blur sm:flex-row sm:items-center"
          >
            <label className="flex flex-1 items-center gap-2.5 rounded-xl px-3 transition-colors focus-within:bg-stone-50">
              <Search size={17} className="shrink-0 text-muted" />
              <span className="sr-only">Search restaurants</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurants or cuisine"
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted/80"
              />
            </label>

            <span className="hidden h-7 w-px bg-line sm:block" />

            <label className="flex flex-1 items-center gap-2.5 rounded-xl px-3 transition-colors focus-within:bg-stone-50">
              <MapPin size={17} className="shrink-0 text-muted" />
              <span className="sr-only">City</span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted/80"
              />
            </label>

            <Button type="submit" size="lg" className="rounded-xl sm:px-8">
              Search
            </Button>
          </motion.form>
        </div>

        {/* Curved cut into the canvas — softens the block edge. */}
        <div
          className="absolute inset-x-0 bottom-0 h-12 bg-canvas"
          style={{ borderRadius: "100% 100% 0 0 / 100% 100% 0 0" }}
          aria-hidden
        />
      </section>

      {/* ---------------------------- categories ---------------------------- */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold">
            Browse by category
          </h2>
          <p className="mt-1.5 text-muted">
            Find exactly the kind of food you're craving.
          </p>
        </Reveal>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5"
        >
          {(categories ?? []).map((category) => (
            <motion.div key={category.id} variants={fadeUp}>
              <Link
                to={`/restaurants?categoryId=${category.id}`}
                className="group flex h-full flex-col justify-between rounded-2xl border border-line bg-surface p-5 text-center shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
              >
                <p className="font-display text-lg font-semibold transition-colors group-hover:text-brand">
                  {category.name}
                </p>
                {category._count && (
                  <p className="mt-1 text-xs text-muted">
                    {category._count.restaurants}{" "}
                    {category._count.restaurants === 1 ? "place" : "places"}
                  </p>
                )}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ----------------------------- featured ----------------------------- */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold">
                Featured restaurants
              </h2>
              <p className="mt-1.5 text-muted">
                Handpicked places people are loving right now.
              </p>
            </div>

            <Link
              to="/restaurants"
              className="link-underline hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-brand sm:flex"
            >
              View all
              <ArrowRight size={15} />
            </Link>
          </div>
        </Reveal>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {featured.isLoading &&
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}

          {featured.data?.restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </motion.div>

        {featured.isError && (
          <ErrorState
            message={apiError(featured.error)}
            onRetry={() => featured.refetch()}
          />
        )}
      </section>

      {/* --------------------------- value props ---------------------------- */}
      <section className="mt-20 border-y border-line bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:grid-cols-3">
          {[
            {
              icon: Star,
              title: "Honest reviews",
              text: "Ratings from real diners — one review per person, no spam.",
            },
            {
              icon: Heart,
              title: "Save what you love",
              text: "Favourite places and organise them into your own lists.",
            },
            {
              icon: CalendarCheck,
              title: "Reserve in seconds",
              text: "Book a table and track your reservation status live.",
            },
          ].map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand shadow-soft">
                  <Icon size={24} />
                </span>
                <h3 className="font-display mt-5 text-xl font-semibold">
                  {title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">
                  {text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------- CTA -------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-brand-950 px-6 py-16 text-center">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(70% 80% at 50% 0%, #0f766e 0%, transparent 65%)",
              }}
              aria-hidden
            />
            <div className="relative">
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                Hungry yet?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-brand-100/90">
                Join My Treats and book your next table in under a minute.
              </p>
              <Link to="/register" className="mt-8 inline-block">
                <Button size="lg" variant="secondary">
                  Create a free account
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
