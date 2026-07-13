// Mirrors the Prisma models the API returns.

export type Role = "USER" | "ADMIN";

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  _count?: { reviews: number; reservations: number };
}

export interface Category {
  id: number;
  name: string;
  _count?: { restaurants: number };
}

export interface RestaurantImage {
  id: number;
  url: string;
  restaurantId: number;
}

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  userId: number;
  restaurantId: number;
  user: Pick<User, "id" | "name">;
  restaurant?: Pick<Restaurant, "id" | "name">;
}

export interface Restaurant {
  id: number;
  name: string;
  description: string | null;
  address: string;
  city: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  openingTime: string | null;
  closingTime: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  createdAt: string;
  categoryId: number;
  category?: Category;
  images?: RestaurantImage[];
  reviews?: Review[];
}

export interface Rating {
  average: number | null;
  count: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Favorite {
  id: number;
  userId: number;
  restaurantId: number;
  restaurant: Restaurant;
}

export interface ListItem {
  id: number;
  addedAt: string;
  listId: number;
  restaurantId: number;
  restaurant: Restaurant;
}

export interface UserList {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  userId: number;
  restaurants: ListItem[];
}

export interface Reservation {
  id: number;
  reservationDate: string;
  people: number;
  specialRequest: string | null;
  status: ReservationStatus;
  createdAt: string;
  userId: number;
  restaurantId: number;
  restaurant: Restaurant;
  user?: User;
}

export interface DashboardStats {
  users: number;
  admins: number;
  restaurants: number;
  activeRestaurants: number;
  categories: number;
  reviews: number;
  reservations: number;
  pendingReservations: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
