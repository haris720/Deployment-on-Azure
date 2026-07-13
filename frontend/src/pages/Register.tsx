import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { UtensilsCrossed, ArrowRight } from "lucide-react";
import api, { apiError } from "@/api/axios";
import { useAuth } from "@/store/auth.store";
import { Button, Input, ErrorState, EASE } from "@/components/common/UI";
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
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="mb-8 text-center"
      >
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-lift">
          <UtensilsCrossed size={24} />
        </span>
        <h1 className="font-display mt-5 text-4xl font-semibold">
          Create your account
        </h1>
        <p className="mt-2 text-muted">
          Save favourites, write reviews and reserve tables.
        </p>
      </motion.div>

      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}

      {/* noValidate: zod owns validation here — the browser's native
          type="email" check would otherwise block submit silently. */}
      <motion.form
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-2xl border border-line bg-surface p-7 shadow-soft"
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

        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          className="w-full"
        >
          Create account
          <ArrowRight size={16} />
        </Button>
      </motion.form>

      <p className="mt-7 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="link-underline font-semibold text-brand">
          Log in
        </Link>
      </p>
    </div>
  );
}
