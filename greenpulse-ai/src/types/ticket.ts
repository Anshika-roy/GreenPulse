export type TicketStatus = "open" | "in-progress" | "resolved" | "closed";
export type TicketPriority = "urgent" | "high" | "normal" | "low";

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  deviceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  priority: TicketPriority;
  deviceId?: string;
}
