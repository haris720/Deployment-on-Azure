import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { UtensilsCrossed, ArrowRight } from "lucide-react";
import api, { apiError } from "@/api/axios";
import { useAuth } from "@/store/auth.store";
import { Button, Input, ErrorState, EASE } from "@/components/common/UI";
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
          Welcome back
        </h1>
        <p className="mt-2 text-muted">
          Log in to book tables and save your favourites.
        </p>
      </motion.div>

      {expired && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-xl bg-gold-100 p-3.5 text-sm font-medium text-gold-600"
        >
          Your session expired. Please log in again.
        </motion.p>
      )}

      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}

      {/* noValidate: the browser's own type="email" check would block
          submission before zod runs, so our messages would never show. */}
      <motion.form
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-2xl border border-line bg-surface p-7 shadow-soft"
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

        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          className="w-full"
        >
          Log in
          <ArrowRight size={16} />
        </Button>
      </motion.form>

      <p className="mt-7 text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="link-underline font-semibold text-brand"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
