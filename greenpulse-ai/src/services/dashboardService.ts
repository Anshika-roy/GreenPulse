import { getDashboardSummary } from "@/api/dashboard";

export const dashboardService = {
  async fetchSummary(signal?: AbortSignal) {
    return getDashboardSummary(signal);
  },
};

/** Format an INR lakhs figure the way the UI expects: "₹3.2 Lakhs" */
export function formatLakhs(amountInrLakhs: number): string {
  return `₹${amountInrLakhs.toFixed(1)} Lakhs`;
}

/** Format a raw rupee amount into lakhs display, e.g. 320000 -> "₹3.2 Lakhs" */
export function formatInrAsLakhs(amountInr: number): string {
  return formatLakhs(amountInr / 100000);
}
