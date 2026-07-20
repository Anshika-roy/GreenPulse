import { useQuery } from "@tanstack/react-query";
import { getSustainabilityReport } from "@/api/sustainability";

export function useSustainability() {
  return useQuery({
    queryKey: ["sustainability", "report"],
    queryFn: ({ signal }) => getSustainabilityReport(signal),
    staleTime: 60_000,
  });
}
