import { Link } from "react-router-dom";
import { Mail, Shield, CalendarDays, Heart, BookMarked } from "lucide-react";
import { useAuth } from "@/store/auth.store";
import {
  useFavorites,
  useLists,
  useMyReservations,
} from "@/hooks/useApi";
import { Badge, Button } from "@/components/common/UI";

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: favorites } = useFavorites();
  const { data: lists } = useLists();
  const { data: reservations } = useMyReservations();

  if (!user) return null;

  const stats = [
    {
      label: "Favorites",
      value: favorites?.length ?? 0,
      icon: Heart,
      to: "/favorites",
    },
    { label: "Lists", value: lists?.length ?? 0, icon: BookMarked, to: "/lists" },
    {
      label: "Reservations",
      value: reservations?.length ?? 0,
      icon: CalendarDays,
      to: "/reservations",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Your profile</h1>

      <section className="mt-6 rounded-xl border border-line bg-white p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-brand text-2xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </span>

          <div>
            <p className="text-xl font-semibold">{user.name}</p>

            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <Mail size={14} />
              {user.email}
            </p>

            <p className="mt-2 flex items-center gap-1.5 text-sm">
              <Shield size={14} className="text-brand" />
              <Badge value={user.role} />
            </p>
          </div>
        </div>

        {user.createdAt && (
          <p className="mt-5 border-t border-line pt-4 text-xs text-muted">
            Member since{" "}
            {new Date(user.createdAt).toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="rounded-xl border border-line bg-white p-5 transition hover:border-brand hover:shadow-sm"
          >
            <Icon size={18} className="text-brand" />
            <p className="mt-3 text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted">{label}</p>
          </Link>
        ))}
      </div>

      {user.role === "ADMIN" && (
        <Link to="/admin" className="mt-6 block">
          <Button className="w-full">Open the admin panel</Button>
        </Link>
      )}

      <Button variant="outline" className="mt-4 w-full" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}
