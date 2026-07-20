import { Navigate, useLocation } from "react-router-dom";
import { authService } from "@/services/authService";

/** Redirects to /login when there's no auth token. Wraps the AppLayout route. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
