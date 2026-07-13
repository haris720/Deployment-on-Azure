import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  CalendarDays,
} from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { cn } from "@/components/common/UI";

const nav = [
  { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/restaurants", label: "Restaurants", icon: UtensilsCrossed },
  { to: "/admin/reservations", label: "Reservations", icon: CalendarDays },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 md:flex-row">
        <aside className="md:w-56 md:shrink-0">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Admin panel
          </p>

          <nav className="flex gap-1 overflow-x-auto md:flex-col">
            {nav.map(({ to, end, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "bg-brand text-white shadow-soft"
                      : "text-ink-soft hover:bg-stone-100 hover:text-ink",
                  )
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
