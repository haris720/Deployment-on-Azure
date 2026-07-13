import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// A 401 means the token is missing, expired or forged. Without this,
// an expired token leaves the app "logged in" forever, showing empty
// pages and failing every write.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const onAuthPage = ["/login", "/register"].includes(
      window.location.pathname,
    );

    if (status === 401 && !onAuthPage) {
      localStorage.removeItem("token");
      window.location.href = "/login?expired=1";
    }

    return Promise.reject(error);
  },
);

/** Pulls the API's `{ message }` out of an axios error. */
export function apiError(error: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: { field: string; message: string }[] }
      | undefined;

    // The backend's zod layer returns a list of field errors.
    if (data?.errors?.length) {
      return data.errors.map((e) => `${e.field}: ${e.message}`).join(", ");
    }

    if (data?.message) return data.message;

    if (error.code === "ERR_NETWORK") {
      return "Cannot reach the server. Is the backend running?";
    }
  }

  return fallback;
}

/** Uploaded images come back as "/uploads/x.png" — relative to the API host. */
export function imageUrl(url: string) {
  const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/api\/?$/, "");
  return url.startsWith("http") ? url : `${base}${url}`;
}

export default api;
