import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCurrentUser } from "@/hooks/useAuth";
import { Button } from "@/components/Buttons/Button";
import { Avatar } from "@/components/Avatar/Avatar";
import { Skeleton } from "@/components/LoadingSkeleton/Skeleton";

const profileSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  role: z.string().min(2, "Role is required"),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { data: user, isLoading } = useCurrentUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email, role: user.role });
  }, [user, reset]);

  function onSubmit(values: ProfileForm) {
    // TODO: wire to PUT /api/user once backend exists
    console.info("Profile saved (mock):", values);
  }

  if (isLoading || !user) {
    return (
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64 w-full rounded-card" />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink-muted">Manage your profile and account preferences.</p>
      </div>

      <div className="rounded-card border border-border bg-surface p-6 shadow-card">
        <div className="mb-5 flex items-center gap-3">
          <Avatar name={user.name} size="lg" />
          <div>
            <p className="text-sm font-semibold text-ink">{user.name}</p>
            <p className="text-xs text-ink-muted">{user.company.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Full name</label>
            <input {...register("name")} className="h-10 w-full rounded-lg border border-border px-3 text-sm focus:border-brand-500" />
            {errors.name && <p className="mt-1 text-xs text-risk-high">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Email</label>
            <input {...register("email")} className="h-10 w-full rounded-lg border border-border px-3 text-sm focus:border-brand-500" />
            {errors.email && <p className="mt-1 text-xs text-risk-high">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Role</label>
            <input {...register("role")} className="h-10 w-full rounded-lg border border-border px-3 text-sm focus:border-brand-500" />
            {errors.role && <p className="mt-1 text-xs text-risk-high">{errors.role.message}</p>}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit">Save changes</Button>
            {isSubmitSuccessful && <span className="text-sm text-brand-600">Saved (mock)</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
