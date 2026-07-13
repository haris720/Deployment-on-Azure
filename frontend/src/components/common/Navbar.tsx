import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
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
import { Button, cn } from "@/components/common/UI";

const links = [
  { to: "/restaurants", label: "Discover", icon: UtensilsCrossed },
  { to: "/favorites", label: "Favorites", icon: Heart, auth: true },
  { to: "/lists", label: "Lists", icon: BookMarked, auth: true },
  { to: "/reservations", label: "Reservations", icon: CalendarDays, auth: true },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const visible = links.filter((l) => !l.auth || user);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-brand"
          onClick={() => setOpen(false)}
        >
          <UtensilsCrossed size={22} />
          My Treats
        </Link>

        {/* desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {visible.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-brand-50 text-brand"
                    : "text-ink hover:bg-stone-100",
                )
              }
            >
              {label}
            </NavLink>
          ))}

          {isAdmin(user) && (
            <NavLink
              to="/admin"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-brand hover:bg-brand-50"
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
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-stone-100"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                {user.name}
              </Link>

              <Button variant="ghost" onClick={handleLogout}>
                <LogOut size={15} />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-stone-100"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 hover:bg-stone-100 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* mobile */}
      {open && (
        <div className="border-t border-line bg-white px-4 py-3 md:hidden">
          {visible.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-stone-100"
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}

          {isAdmin(user) && (
            <NavLink
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-brand hover:bg-brand-50"
            >
              <LayoutDashboard size={16} />
              Admin
            </NavLink>
          )}

          <div className="mt-2 border-t border-line pt-2">
            {user ? (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-stone-100"
                >
                  <UserIcon size={16} />
                  {user.name}
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-1 py-1">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-line py-2 text-center text-sm font-semibold"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg bg-brand py-2 text-center text-sm font-semibold text-white"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
