import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  UtensilsCrossed,
  Heart,
  BookMarked,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";
import { useAuth, isAdmin } from "@/store/auth.store";
import { Button, cn, EASE } from "@/components/common/UI";

const links = [
  { to: "/restaurants", label: "Discover", icon: UtensilsCrossed },
  { to: "/favorites", label: "Favorites", icon: Heart, auth: true },
  { to: "/lists", label: "Lists", icon: BookMarked, auth: true },
  { to: "/reservations", label: "Reservations", icon: CalendarDays, auth: true },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // The header condenses once you scroll — a small cue that gives the page
  // depth without a jarring change.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the burger on navigation, or it stays open over the new page.
  useEffect(() => setOpen(false), [location.pathname]);

  const visible = links.filter((l) => !l.auth || user);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        scrolled
          ? "border-b border-line bg-canvas/85 backdrop-blur-xl"
          : "border-b border-transparent bg-canvas/50 backdrop-blur-sm",
      )}
    >
      <nav
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300",
          scrolled ? "py-2.5" : "py-4",
        )}
      >
        <Link
          to="/"
          className="group flex items-center gap-2 text-xl font-bold text-brand"
        >
          <motion.span
            whileHover={{ rotate: -12, scale: 1.08 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
          >
            <UtensilsCrossed size={21} />
          </motion.span>
          <span className="font-display text-2xl tracking-tight">
            My Treats
          </span>
        </Link>

        {/* desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {visible.map(({ to, label }) => (
            <NavLink key={to} to={to} className="relative px-3.5 py-2">
              {({ isActive }) => (
                <>
                  {/* The pill slides between items instead of blinking. */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-brand-50"
                    />
                  )}
                  <span
                    className={cn(
                      "relative text-sm font-semibold transition-colors duration-200",
                      isActive
                        ? "text-brand-700"
                        : "text-ink-soft hover:text-brand",
                    )}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          {isAdmin(user) && (
            <NavLink
              to="/admin"
              className="ml-1 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold text-brand transition-colors duration-200 hover:bg-brand-50"
            >
              <LayoutDashboard size={15} />
              Admin
            </NavLink>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3.5 text-sm font-semibold transition-colors duration-200 hover:bg-stone-100"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 text-xs font-bold text-white shadow-soft">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                {user.name}
              </Link>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={15} />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft transition-colors duration-200 hover:bg-stone-100 hover:text-ink"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-px hover:bg-brand-700 hover:shadow-lift active:translate-y-0 active:scale-[0.97]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-xl p-2 transition-colors hover:bg-stone-100 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden border-t border-line bg-surface md:hidden"
          >
            <div className="px-4 py-3">
              {visible.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-ink-soft hover:bg-stone-100",
                    )
                  }
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}

              {isAdmin(user) && (
                <NavLink
                  to="/admin"
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-brand hover:bg-brand-50"
                >
                  <LayoutDashboard size={17} />
                  Admin
                </NavLink>
              )}

              <div className="mt-2 border-t border-line pt-2">
                {user ? (
                  <>
                    <NavLink
                      to="/profile"
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-ink-soft hover:bg-stone-100"
                    >
                      <UserIcon size={17} />
                      {user.name}
                    </NavLink>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Log out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 py-1">
                    <Link
                      to="/login"
                      className="flex-1 rounded-xl border border-line py-2.5 text-center text-sm font-semibold"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 rounded-xl bg-brand py-2.5 text-center text-sm font-semibold text-white"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
