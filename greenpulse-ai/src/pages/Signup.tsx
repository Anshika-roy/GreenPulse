import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { useRegister } from "@/hooks/useAuth";
import { Button } from "@/components/Buttons/Button";

const signupSchema = z
  .object({
    companyName: z.string().min(2, "Company name must be at least 2 characters"),
    name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Enter a valid work email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const registerMutation = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  function onSubmit(values: SignupForm) {
    registerMutation.mutate({
      companyName: values.companyName,
      name: values.name,
      email: values.email,
      password: values.password,
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-4 py-8">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-ink">GreenPulse AI</p>
            <p className="text-xs text-ink-muted">Create your Enterprise Organization</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Company Name</label>
            <input
              {...register("companyName")}
              type="text"
              placeholder="e.g. Acme Corp"
              className="h-10 w-full rounded-lg border border-border px-3 text-sm focus:border-brand-500"
            />
            {errors.companyName && <p className="mt-1 text-xs text-risk-high">{errors.companyName.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Full Name</label>
            <input
              {...register("name")}
              type="text"
              placeholder="e.g. Jane Doe"
              className="h-10 w-full rounded-lg border border-border px-3 text-sm focus:border-brand-500"
            />
            {errors.name && <p className="mt-1 text-xs text-risk-high">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Work Email</label>
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
              autoComplete="new-password"
              placeholder="••••••••"
              className="h-10 w-full rounded-lg border border-border px-3 text-sm focus:border-brand-500"
            />
            {errors.password && <p className="mt-1 text-xs text-risk-high">{errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Confirm Password</label>
            <input
              {...register("confirmPassword")}
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="h-10 w-full rounded-lg border border-border px-3 text-sm focus:border-brand-500"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-risk-high">{errors.confirmPassword.message}</p>
            )}
          </div>

          {registerMutation.isError && (
            <p className="rounded-lg bg-risk-high-bg px-3 py-2 text-xs text-risk-high">
              {(registerMutation.error as Error).message || "Registration failed. Please try again."}
            </p>
          )}

          <Button type="submit" className="w-full" isLoading={registerMutation.isPending}>
            Create GreenPulse Account
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-ink-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
