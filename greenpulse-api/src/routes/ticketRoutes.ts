import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { validate } from "../middleware/validate";
import { createTicketSchema } from "../utils/schemas";
import { createTicket, listTickets } from "../controllers/ticketController";

export const ticketRoutes = Router();

ticketRoutes.get("/tickets", requireAuth, asyncHandler(listTickets));
ticketRoutes.post("/tickets", requireAuth, validate(createTicketSchema), asyncHandler(createTicket));
