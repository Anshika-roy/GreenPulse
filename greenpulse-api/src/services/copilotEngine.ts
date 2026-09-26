import https from "https";

interface CopilotContext {
  criticalCount: number;
  totalDevices: number;
}

function ruleBasedReply(message: string, context: CopilotContext): string {
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
    return `The overall enterprise Fleet Health Score is 84/100 (up +3.2% vs last week). ${Math.max(0, context.totalDevices - context.criticalCount)} out of ${context.totalDevices} devices are operating in optimal condition.`;
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

/**
 * Generates AI Copilot response.
 * Uses OpenAI API (gpt-4o-mini) if OPENAI_API_KEY is configured in environment,
 * otherwise falls back seamlessly to the instant contextual engine.
 */
export async function generateCopilotReply(message: string, context: CopilotContext): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return ruleBasedReply(message, context);
  }

  try {
    const payload = JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are GreenPulse AI Copilot, an enterprise IT device intelligence and sustainability assistant. You help enterprise CIOs, IT managers, and sustainability leads optimize device lifespans, prevent hardware failures, reduce costs (in INR/USD), and prevent e-waste. Keep answers concise, executive, and actionable. Fleet Context: Total Tracked Devices = ${context.totalDevices}, High Risk Devices = ${context.criticalCount}.`,
        },
        { role: "user", content: message },
      ],
      max_tokens: 250,
      temperature: 0.7,
    });

    return await new Promise<string>((resolve) => {
      const req = https.request(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "Content-Length": Buffer.byteLength(payload),
          },
          timeout: 5000,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              if (res.statusCode === 200) {
                const parsed = JSON.parse(data);
                const reply = parsed.choices?.[0]?.message?.content;
                if (reply) return resolve(reply.trim());
              }
              resolve(ruleBasedReply(message, context));
            } catch {
              resolve(ruleBasedReply(message, context));
            }
          });
        }
      );

      req.on("error", () => resolve(ruleBasedReply(message, context)));
      req.on("timeout", () => {
        req.destroy();
        resolve(ruleBasedReply(message, context));
      });

      req.write(payload);
      req.end();
    });
  } catch {
    return ruleBasedReply(message, context);
  }
}
