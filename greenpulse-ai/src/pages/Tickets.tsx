import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, TicketIcon } from "lucide-react";
import { useTickets, useCreateTicket } from "@/hooks/useTickets";
import { Button } from "@/components/Buttons/Button";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { Skeleton } from "@/components/LoadingSkeleton/Skeleton";
import { cn } from "@/lib/utils";
import type { TicketPriority, TicketStatus } from "@/types";

const ticketSchema = z.object({
  subject: z.string().min(3, "Subject is too short"),
  description: z.string().min(10, "Please add a bit more detail"),
  priority: z.enum(["urgent", "high", "normal", "low"]),
});
type TicketForm = z.infer<typeof ticketSchema>;

const STATUS_COLOR: Record<TicketStatus, string> = {
  open: "bg-risk-high-bg text-risk-high",
  "in-progress": "bg-risk-medium-bg text-risk-medium",
  resolved: "bg-risk-low-bg text-risk-low",
  closed: "bg-border-subtle text-ink-muted",
};

const PRIORITY_COLOR: Record<TicketPriority, string> = {
  urgent: "text-risk-high",
  high: "text-risk-medium",
  normal: "text-info",
  low: "text-ink-muted",
};

export default function TicketsPage() {
  const { data: tickets, isLoading } = useTickets();
  const createTicket = useCreateTicket();
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { priority: "normal" },
  });

  function onSubmit(values: TicketForm) {
    createTicket.mutate(values, {
      onSuccess: () => {
        reset();
        setShowForm(false);
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Tickets</h1>
          <p className="mt-1 text-sm text-ink-muted">Support requests raised against devices in your fleet.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          <Plus className="h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 rounded-card border border-border bg-surface p-5 shadow-card"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Subject</label>
            <input
              {...register("subject")}
              className="h-10 w-full rounded-lg border border-border px-3 text-sm focus:border-brand-500"
              placeholder="e.g. Battery replacement request"
            />
            {errors.subject && <p className="mt-1 text-xs text-risk-high">{errors.subject.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Description</label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500"
              placeholder="Describe the issue…"
            />
            {errors.description && <p className="mt-1 text-xs text-risk-high">{errors.description.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Priority</label>
            <select {...register("priority")} className="h-10 rounded-lg border border-border px-3 text-sm focus:border-brand-500">
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" isLoading={createTicket.isPending}>
              Submit Ticket
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="rounded-card border border-border bg-surface shadow-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : !tickets || tickets.length === 0 ? (
          <EmptyState icon={TicketIcon} title="No tickets yet" actionLabel="New ticket" onAction={() => setShowForm(true)} />
        ) : (
          <div className="divide-y divide-border">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex items-start justify-between gap-4 px-4 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{ticket.subject}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">{ticket.description}</p>
                  <p className={cn("mt-1 text-xs font-medium capitalize", PRIORITY_COLOR[ticket.priority])}>
                    {ticket.priority} priority
                  </p>
                </div>
                <span className={cn("shrink-0 rounded-pill px-2.5 py-1 text-xs font-medium capitalize", STATUS_COLOR[ticket.status])}>
                  {ticket.status.replace("-", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
