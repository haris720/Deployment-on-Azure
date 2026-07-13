import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UtensilsCrossed } from "lucide-react";
import api, { apiError } from "@/api/axios";
import { useAuth } from "@/store/auth.store";
import { Button, Input, ErrorState } from "@/components/common/UI";
import type { AuthResponse } from "@/types";

const schema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type Form = z.infer<typeof schema>;

export default function Login() {
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");

  // Where the user was headed before the auth guard bounced them.
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const expired = new URLSearchParams(location.search).has("expired");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Form) => {
    setError("");

    try {
      const { data } = await api.post<AuthResponse>("/auth/login", values);
      login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(apiError(err, "Login failed"));
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <UtensilsCrossed className="mx-auto text-brand" size={34} />
        <h1 className="mt-3 text-3xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">
          Log in to book tables and save your favorites.
        </p>
      </div>

      {expired && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Your session expired. Please log in again.
        </p>
      )}

      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}

      {/* noValidate: the browser's own type="email" check would block
          submission before zod runs, so our messages would never show. */}
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-line bg-white p-6"
      >
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" loading={isSubmitting} className="w-full">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-brand hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
