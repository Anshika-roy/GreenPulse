import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAlerts, markAlertRead } from "@/api/alerts";

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts", "list"],
    queryFn: ({ signal }) => getAlerts(signal),
    staleTime: 30_000,
  });
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAlertRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts", "list"] });
    },
  });
}
