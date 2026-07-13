import { lazy, Suspense, type ReactNode } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import { Loader, EASE } from "@/components/common/UI";
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

/** Every page fades and rises in — navigation feels continuous, not stuttered. */
function Page({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

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

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<Loader />}>
        <Routes location={location} key={location.pathname}>
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={
                <Page>
                  <Home />
                </Page>
              }
            />
            <Route
              path="/restaurants"
              element={
                <Page>
                  <Restaurants />
                </Page>
              }
            />
            <Route
              path="/restaurants/:id"
              element={
                <Page>
                  <RestaurantDetail />
                </Page>
              }
            />
            <Route
              path="/login"
              element={
                <Page>
                  <Login />
                </Page>
              }
            />
            <Route
              path="/register"
              element={
                <Page>
                  <Register />
                </Page>
              }
            />

            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Page>
                    <Profile />
                  </Page>
                </RequireAuth>
              }
            />
            <Route
              path="/favorites"
              element={
                <RequireAuth>
                  <Page>
                    <Favorites />
                  </Page>
                </RequireAuth>
              }
            />
            <Route
              path="/lists"
              element={
                <RequireAuth>
                  <Page>
                    <Lists />
                  </Page>
                </RequireAuth>
              }
            />
            <Route
              path="/reservations"
              element={
                <RequireAuth>
                  <Page>
                    <Reservations />
                  </Page>
                </RequireAuth>
              }
            />

            <Route
              path="*"
              element={
                <Page>
                  <NotFound />
                </Page>
              }
            />
          </Route>

          <Route
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route
              path="/admin"
              element={
                <Page>
                  <AdminDashboard />
                </Page>
              }
            />
            <Route
              path="/admin/users"
              element={
                <Page>
                  <AdminUsers />
                </Page>
              }
            />
            <Route
              path="/admin/restaurants"
              element={
                <Page>
                  <AdminRestaurants />
                </Page>
              }
            />
            <Route
              path="/admin/reservations"
              element={
                <Page>
                  <AdminReservations />
                </Page>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
