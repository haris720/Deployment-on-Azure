import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UtensilsCrossed } from "lucide-react";
import api, { apiError } from "@/api/axios";
import { useAuth } from "@/store/auth.store";
import { Button, Input, ErrorState } from "@/components/common/UI";
import type { AuthResponse } from "@/types";

// Mirrors the backend's registerSchema, so the user sees the rule
// before a round trip. The server still enforces it independently.
const schema = z
  .object({
    name: z.string().trim().min(3, "Name must be at least 3 characters"),
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Form = z.infer<typeof schema>;

export default function Register() {
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ name, email, password }: Form) => {
    setError("");

    try {
      // confirmPassword is a UI-only field — the API rejects unknown keys.
      const { data } = await api.post<AuthResponse>("/auth/register", {
        name,
        email,
        password,
      });

      login(data);
      navigate("/", { replace: true });
    } catch (err) {
      setError(apiError(err, "Registration failed"));
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <UtensilsCrossed className="mx-auto text-brand" size={34} />
        <h1 className="mt-3 text-3xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted">
          Save favorites, write reviews and reserve tables.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}

      {/* noValidate: zod owns validation here — the browser's native
          type="email" check would otherwise block submit silently. */}
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-line bg-white p-6"
      >
        <Input
          label="Name"
          autoComplete="name"
          placeholder="Haris"
          error={errors.name?.message}
          {...register("name")}
        />

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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" loading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
