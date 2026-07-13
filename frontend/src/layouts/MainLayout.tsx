import { Link, Outlet } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";
import { Navbar } from "@/components/common/Navbar";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 text-brand">
            <UtensilsCrossed size={20} />
            <span className="font-display text-2xl font-semibold">
              My Treats
            </span>
          </p>
          <p className="mt-2 text-sm text-muted">
            Discover and book the best restaurants near you.
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Explore</p>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <Link to="/restaurants" className="link-underline hover:text-brand">
                All restaurants
              </Link>
            </li>
            <li>
              <Link to="/favorites" className="link-underline hover:text-brand">
                Favorites
              </Link>
            </li>
            <li>
              <Link to="/lists" className="link-underline hover:text-brand">
                My lists
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Account</p>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <Link to="/login" className="link-underline hover:text-brand">
                Log in
              </Link>
            </li>
            <li>
              <Link to="/register" className="link-underline hover:text-brand">
                Sign up
              </Link>
            </li>
            <li>
              <Link to="/reservations" className="link-underline hover:text-brand">
                My reservations
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Contact</p>
          <p className="text-sm text-muted">Islamabad, Pakistan</p>
          <p className="text-sm text-muted">hello@mytreats.example</p>
        </div>
      </div>

      <div className="border-t border-line py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} My Treats. All rights reserved.
      </div>
    </footer>
  );
}

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
