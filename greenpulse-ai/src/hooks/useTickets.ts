import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ticketService } from "@/services/ticketService";
import type { CreateTicketRequest } from "@/types";

export function useTickets() {
  return useQuery({
    queryKey: ["tickets", "list"],
    queryFn: ({ signal }) => ticketService.list(signal),
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateTicketRequest) => ticketService.create(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", "list"] });
    },
  });
}
