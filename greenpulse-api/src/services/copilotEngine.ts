/**
 * Rule-based copilot reply generator — placeholder for a real LLM integration
 * (e.g. call the Anthropic API here with fleet context injected into the
 * prompt). Keeping this isolated in one function means swapping in a real
 * model later touches only this file, not the controller or routes.
 */
export function generateCopilotReply(message: string, context: { criticalCount: number; totalDevices: number }): string {
  const q = message.toLowerCase();

  if (q.includes("risk")) {
    return `Right now ${context.criticalCount} devices are flagged high risk out of ${context.totalDevices} tracked. Want me to open the filtered device list?`;
  }
  if (q.includes("budget") || q.includes("cost") || q.includes("quarter")) {
    return `Based on current failure predictions, I'd plan for repair and replacement costs across your ${context.criticalCount} highest-risk devices this quarter.`;
  }
  if (q.includes("office") || q.includes("location") || q.includes("failure rate")) {
    return "I can break failure rates down by office once location-level aggregation is enabled — for now, check the Devices page and filter by location.";
  }
  if (q.includes("waste") || q.includes("sustainab") || q.includes("co2")) {
    return "Check the Sustainability page for a full breakdown of e-waste prevented and CO2 avoided this year.";
  }
  return "I'm here to help you manage your device fleet smarter. Could you tell me a bit more about what you're looking for?";
}
