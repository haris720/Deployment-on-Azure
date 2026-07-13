import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./utils";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { useAuth } from "@/store/auth.store";
import api from "@/api/axios";

vi.mock("@/api/axios", async () => {
  const actual = await vi.importActual<typeof import("@/api/axios")>(
    "@/api/axios",
  );
  return {
    ...actual,
    default: { post: vi.fn(), get: vi.fn() },
  };
});

const mockApi = api as unknown as { post: ReturnType<typeof vi.fn> };

beforeEach(() => {
  useAuth.setState({ user: null, token: null, loading: false });
  vi.clearAllMocks();
});

describe("Login", () => {
  it("shows validation errors instead of calling the API", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it("stores the token and user on success", async () => {
    const user = userEvent.setup();

    mockApi.post.mockResolvedValueOnce({
      data: {
        token: "jwt-123",
        user: { id: 1, name: "Haris", email: "h@t.com", role: "ADMIN" },
      },
    });

    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText(/email/i), "h@t.com");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(useAuth.getState().token).toBe("jwt-123");
    });

    expect(useAuth.getState().user?.role).toBe("ADMIN");
    expect(localStorage.getItem("token")).toBe("jwt-123");
  });

  it("surfaces the API's error message", async () => {
    const user = userEvent.setup();

    mockApi.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { message: "Invalid email or password" } },
    });

    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText(/email/i), "h@t.com");
    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /invalid email or password/i,
    );
    expect(useAuth.getState().token).toBeNull();
  });
});

describe("Register", () => {
  it("enforces the backend's 8-character password rule", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    await user.type(screen.getByLabelText(/^name$/i), "Haris");
    await user.type(screen.getByLabelText(/email/i), "h@t.com");
    await user.type(screen.getByLabelText(/^password$/i), "123");
    await user.type(screen.getByLabelText(/confirm password/i), "123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText(/at least 8 characters/i),
    ).toBeInTheDocument();
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it("catches mismatched passwords", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    await user.type(screen.getByLabelText(/^name$/i), "Haris");
    await user.type(screen.getByLabelText(/email/i), "h@t.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password999");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/do not match/i)).toBeInTheDocument();
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it("never sends confirmPassword to the API", async () => {
    const user = userEvent.setup();

    mockApi.post.mockResolvedValueOnce({
      data: {
        token: "t",
        user: { id: 2, name: "Ali", email: "a@t.com", role: "USER" },
      },
    });

    renderWithProviders(<Register />);

    await user.type(screen.getByLabelText(/^name$/i), "Ali");
    await user.type(screen.getByLabelText(/email/i), "a@t.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(mockApi.post).toHaveBeenCalled());

    expect(mockApi.post).toHaveBeenCalledWith("/auth/register", {
      name: "Ali",
      email: "a@t.com",
      password: "password123",
    });
  });
});
