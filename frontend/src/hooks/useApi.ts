import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/api/axios";
import { useAuth } from "@/store/auth.store";
import type {
  Category,
  DashboardStats,
  Favorite,
  Pagination,
  Rating,
  Reservation,
  ReservationStatus,
  Restaurant,
  Review,
  User,
  UserList,
} from "@/types";

/* ---------------------------------- auth --------------------------------- */

export function useProfile() {
  const token = useAuth((s) => s.token);

  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get<{ user: User }>("/auth/profile");
      return data.user;
    },
    enabled: Boolean(token),
    retry: false,
  });
}

/* ------------------------------- restaurants ------------------------------ */

export interface RestaurantFilters {
  search?: string;
  city?: string;
  categoryId?: number | "";
  page?: number;
  limit?: number;
}

export function useRestaurants(filters: RestaurantFilters = {}) {
  return useQuery({
    queryKey: ["restaurants", filters],
    queryFn: async () => {
      const { data } = await api.get<{
        restaurants: Restaurant[];
        pagination: Pagination;
      }>("/restaurants", {
        // Blank filters must not become `?city=` — the API would then
        // filter on an empty city and return nothing.
        params: {
          search: filters.search || undefined,
          city: filters.city || undefined,
          categoryId: filters.categoryId || undefined,
          page: filters.page ?? 1,
          limit: filters.limit ?? 12,
        },
      });
      return data;
    },
  });
}

export function useRestaurant(id: number) {
  return useQuery({
    queryKey: ["restaurant", id],
    queryFn: async () => {
      const { data } = await api.get<{
        restaurant: Restaurant;
        rating: Rating;
      }>(`/restaurants/${id}`);
      return data;
    },
    enabled: Number.isFinite(id),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get<{ categories: Category[] }>("/categories");
      return data.categories;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/* --------------------------------- reviews -------------------------------- */

export function useReviews(restaurantId: number) {
  return useQuery({
    queryKey: ["reviews", restaurantId],
    queryFn: async () => {
      const { data } = await api.get<{ reviews: Review[]; rating: Rating }>(
        `/reviews/restaurant/${restaurantId}`,
      );
      return data;
    },
    enabled: Number.isFinite(restaurantId),
  });
}

export function useCreateReview(restaurantId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: { rating: number; comment?: string }) => {
      const { data } = await api.post("/reviews", { restaurantId, ...body });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", restaurantId] });
      qc.invalidateQueries({ queryKey: ["restaurant", restaurantId] });
    },
  });
}

/* -------------------------------- favorites ------------------------------- */

export function useFavorites() {
  const token = useAuth((s) => s.token);

  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const { data } = await api.get<{ favorites: Favorite[] }>("/favorites");
      return data.favorites;
    },
    enabled: Boolean(token),
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      isFavorite,
    }: {
      restaurantId: number;
      isFavorite: boolean;
    }) => {
      if (isFavorite) {
        await api.delete(`/favorites/${restaurantId}`);
      } else {
        await api.post("/favorites", { restaurantId });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

/* ---------------------------------- lists --------------------------------- */

export function useLists() {
  const token = useAuth((s) => s.token);

  return useQuery({
    queryKey: ["lists"],
    queryFn: async () => {
      const { data } = await api.get<{ lists: UserList[] }>("/lists");
      return data.lists;
    },
    enabled: Boolean(token),
  });
}

export function useCreateList() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: { name: string; description?: string }) => {
      const { data } = await api.post("/lists", body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists"] }),
  });
}

export function useDeleteList() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => api.delete(`/lists/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists"] }),
  });
}

export function useAddToList() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      restaurantId,
    }: {
      listId: number;
      restaurantId: number;
    }) => api.post(`/lists/${listId}/restaurants`, { restaurantId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists"] }),
  });
}

export function useRemoveFromList() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      restaurantId,
    }: {
      listId: number;
      restaurantId: number;
    }) => api.delete(`/lists/${listId}/restaurants/${restaurantId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists"] }),
  });
}

/* ------------------------------ reservations ------------------------------ */

export function useMyReservations() {
  const token = useAuth((s) => s.token);

  return useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      const { data } = await api.get<{ reservations: Reservation[] }>(
        "/reservations/my",
      );
      return data.reservations;
    },
    enabled: Boolean(token),
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      restaurantId: number;
      reservationDate: string;
      people: number;
      specialRequest?: string;
    }) => {
      const { data } = await api.post("/reservations", body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reservations"] }),
  });
}

export function useCancelReservation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => api.put(`/reservations/${id}/cancel`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["admin", "reservations"] });
    },
  });
}

/* ---------------------------------- admin --------------------------------- */

export function useDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>("/admin/dashboard");
      return data;
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data } = await api.get<{ users: User[] }>("/admin/users");
      return data.users;
    },
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: { id: number; role: "USER" | "ADMIN" }) =>
      api.put(`/admin/users/${id}/role`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useAdminReservations() {
  return useQuery({
    queryKey: ["admin", "reservations"],
    queryFn: async () => {
      const { data } = await api.get<{ reservations: Reservation[] }>(
        "/admin/reservations",
      );
      return data.reservations;
    },
  });
}

export function useUpdateReservationStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: ReservationStatus;
    }) => api.put(`/admin/reservations/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "reservations"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useSaveRestaurant() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id?: number;
      body: Record<string, unknown>;
    }) => {
      if (id) {
        const { data } = await api.put(`/admin/restaurants/${id}`, body);
        return data;
      }
      const { data } = await api.post("/admin/restaurants", body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["restaurants"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useDeleteRestaurant() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => api.delete(`/admin/restaurants/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["restaurants"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
