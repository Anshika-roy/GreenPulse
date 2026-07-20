import { createTicket, getTickets } from "@/api/tickets";

export const ticketService = {
  async list(signal?: AbortSignal) {
    return getTickets(signal);
  },
  async create(req: Parameters<typeof createTicket>[0]) {
    return createTicket(req);
  },
};
