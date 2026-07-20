import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import type { LoginRequest } from "@/types";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: ({ signal }) => authService.me(signal),
    enabled: authService.isAuthenticated(),
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "me"], data.user);
      navigate("/dashboard", { replace: true });
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });
}
