import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Leaf } from "lucide-react";
import { useLogin } from "@/hooks/useAuth";
import { Button } from "@/components/Buttons/Button";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  function onSubmit(values: LoginForm) {
    login.mutate(values);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-4">
      <div className="w-full max-w-sm rounded-card border border-border bg-surface p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-ink">GreenPulse AI</p>
            <p className="text-xs text-ink-muted">Enterprise Device Intelligence</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Email</label>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              className="h-10 w-full rounded-lg border border-border px-3 text-sm focus:border-brand-500"
            />
            {errors.email && <p className="mt-1 text-xs text-risk-high">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Password</label>
            <input
              {...register("password")}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-10 w-full rounded-lg border border-border px-3 text-sm focus:border-brand-500"
            />
            {errors.password && <p className="mt-1 text-xs text-risk-high">{errors.password.message}</p>}
          </div>

          {login.isError && (
            <p className="rounded-lg bg-risk-high-bg px-3 py-2 text-xs text-risk-high">
              {(login.error as Error).message || "Login failed. Please try again."}
            </p>
          )}

          <Button type="submit" className="w-full" isLoading={login.isPending}>
            Sign in
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-ink-faint">
          Mock auth — any email + a password of 4+ characters will sign you in.
        </p>
      </div>
    </div>
  );
}
