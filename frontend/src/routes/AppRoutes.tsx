import { lazy, Suspense, type ReactNode } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import { Loader } from "@/components/common/UI";
import { useAuth, isAdmin } from "@/store/auth.store";

// Route-level code splitting: the admin panel and detail pages are not
// downloaded until a user actually navigates to them.
const Home = lazy(() => import("@/pages/Home"));
const Restaurants = lazy(() => import("@/pages/Restaurants"));
const RestaurantDetail = lazy(() => import("@/pages/RestaurantDetail"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Profile = lazy(() => import("@/pages/Profile"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const Lists = lazy(() => import("@/pages/Lists"));
const Reservations = lazy(() => import("@/pages/Reservations"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const AdminDashboard = lazy(() => import("@/admin/Dashboard"));
const AdminUsers = lazy(() => import("@/admin/Users"));
const AdminRestaurants = lazy(() => import("@/admin/Restaurants"));
const AdminReservations = lazy(() => import("@/admin/Reservations"));

/** Requires a logged-in user; remembers where they were headed. */
function RequireAuth({ children }: { children: ReactNode }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  // While the stored token is being validated we must not redirect,
  // or a refresh on /favorites would bounce a logged-in user to /login.
  if (loading) return <Loader label="Checking your session…" />;

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/** Requires an ADMIN. The API enforces this too — this is just UX. */
function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader label="Checking your session…" />;

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin(user)) return <Navigate to="/" replace />;

  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurants/:id" element={<RestaurantDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route
              path="/favorites"
              element={
                <RequireAuth>
                  <Favorites />
                </RequireAuth>
              }
            />
            <Route
              path="/lists"
              element={
                <RequireAuth>
                  <Lists />
                </RequireAuth>
              }
            />
            <Route
              path="/reservations"
              element={
                <RequireAuth>
                  <Reservations />
                </RequireAuth>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Route>

          <Route
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/restaurants" element={<AdminRestaurants />} />
            <Route path="/admin/reservations" element={<AdminReservations />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
