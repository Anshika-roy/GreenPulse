/**
 * Rule-based copilot reply generator — placeholder for a real LLM integration
 * (e.g. call the Anthropic API here with fleet context injected into the
 * prompt). Keeping this isolated in one function means swapping in a real
 * model later touches only this file, not the controller or routes.
 */
export function generateCopilotReply(message: string, context: { criticalCount: number; totalDevices: number }): string {
  const q = message.toLowerCase();

  if (q.includes("replace") || q.includes("quarter") || q.includes("budget")) {
    return `Based on telemetry degradation analysis across your ${context.totalDevices} devices, I recommend replacing or servicing ${context.criticalCount} high-risk devices this quarter. Total projected savings: ₹24.5 Lakhs.`;
  }
  if (q.includes("battery") || q.includes("battery health")) {
    return `Currently 4 devices are below 60% battery health threshold. Primary risk: MacBook Pro 16" and Dell XPS 15. We recommend scheduling battery replacements within 14 days.`;
  }
  if (q.includes("ssd") || q.includes("wear")) {
    return `Currently 5 devices exceed 75% SSD wear limits. We recommend immediate data backups and SSD maintenance for high-risk workstations.`;
  }
  if (q.includes("attention") || q.includes("how many") || q.includes("high risk")) {
    return `There are currently ${context.criticalCount} high-risk/critical devices out of ${context.totalDevices} total tracked assets needing immediate attention.`;
  }
  if (q.includes("fleet health") || q.includes("overall")) {
    return `The overall enterprise Fleet Health Score is 84/100 (up +3.2% vs last week). 31 out of ${context.totalDevices} devices are operating in optimal condition.`;
  }
  if (q.includes("waste") || q.includes("sustainab") || q.includes("co2") || q.includes("save")) {
    return `Year-to-date sustainability impact: 342 kg of e-waste prevented and 1,280 kg of CO₂ avoided by extending device lifespans. Total estimated financial savings: ₹24.5 Lakhs.`;
  }
  if (q.includes("risk")) {
    return `Right now ${context.criticalCount} devices are flagged high risk out of ${context.totalDevices} tracked. Check the Devices page and filter by Risk Level.`;
  }
  if (q.includes("office") || q.includes("location") || q.includes("failure rate")) {
    return "I can break failure rates down by office once location-level aggregation is enabled — for now, check the Devices page and filter by location.";
  }
  return "I'm here to help you manage your device fleet smarter. Could you tell me a bit more about what you're looking for?";
}
