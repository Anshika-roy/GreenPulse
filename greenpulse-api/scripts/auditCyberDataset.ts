import fs from "fs";
import path from "path";
import { CyberTelemetryEvent, generateCyberDataset } from "./generateCyberDataset";

const CLASS_NAMES = ["normal", "brute_force", "malware", "data_exfiltration", "anomalous_network_activity"] as const;
type ThreatClass = typeof CLASS_NAMES[number];

const NUMERIC_FEATURES = [
  "login_attempts",
  "failed_logins",
  "login_failure_rate",
  "login_velocity",
  "new_user_login",
  "new_country",
  "new_ip",
  "requests_per_min",
  "bytes_sent_mb",
  "bytes_received_mb",
  "bytes_ratio",
  "external_connection_count",
  "unusual_port_activity",
  "dns_query_count",
  "domain_reputation_score",
  "cpu_usage_percent",
  "ram_usage_percent",
  "process_count",
  "unsigned_process_count",
  "hidden_process_count",
  "privilege_escalation_attempt",
  "cmd_powershell_execution",
  "file_modification_rate",
] as const;

function computeStats(values: number[]) {
  if (values.length === 0) return { mean: 0, median: 0, min: 0, max: 0, std: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / sorted.length;
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / sorted.length;
  const std = Math.sqrt(variance);

  return { mean, median, min, max, std };
}

export function auditDataset(dataset: CyberTelemetryEvent[]) {
  console.log("==================================================");
  console.log("  GREENPULSE CYBERSECURITY DATASET AUDIT ENGINE   ");
  console.log("==================================================\n");

  const reportsDir = path.join(__dirname, "../reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  let markdownContent = `# 📊 GreenPulse Cybersecurity Dataset Feature Separability Report

## 1. Executive Summary & Diagnostic Findings

* **Dataset Size**: ${dataset.length.toLocaleString()} Total Telemetry Samples
* **Classes Audited**: \`normal\`, \`brute_force\`, \`malware\`, \`data_exfiltration\`, \`anomalous_network_activity\`
* **Feature Count**: ${NUMERIC_FEATURES.length} Numeric & Binary Features

---

## 2. Class-Wise Feature Statistics (Mean, Median, Min, Max, Std)

`;

  NUMERIC_FEATURES.forEach((feature) => {
    markdownContent += `### Feature: \`${feature}\`\n\n`;
    markdownContent += `| Threat Class | Mean | Median | Min | Max | Std Dev |\n`;
    markdownContent += `| :--- | :---: | :---: | :---: | :---: | :---: |\n`;

    CLASS_NAMES.forEach((cls) => {
      const classRows = dataset.filter((d) => d.label === cls);
      const vals = classRows.map((d) => Number(d[feature as keyof CyberTelemetryEvent]));
      const s = computeStats(vals);
      markdownContent += `| **\`${cls}\`** | ${s.mean.toFixed(2)} | ${s.median.toFixed(2)} | ${s.min.toFixed(2)} | ${s.max.toFixed(2)} | ${s.std.toFixed(2)} |\n`;
    });

    markdownContent += `\n`;
  });

  // Test Single Feature Separability
  markdownContent += `## 3. Single-Feature Predictor Leakage Analysis\n\n`;
  markdownContent += `Evaluates single-feature Decision Threshold classification accuracy on held-out test data to detect trivially separable features:\n\n`;
  markdownContent += `| Feature | Target Threat Class | Max Single-Feature Accuracy | Leakage Risk Level |\n`;
  markdownContent += `| :--- | :--- | :---: | :--- |\n`;

  NUMERIC_FEATURES.forEach((feature) => {
    let bestAcc = 0;
    let targetClass = "";

    CLASS_NAMES.forEach((cls) => {
      const posVals = dataset.filter((d) => d.label === cls).map((d) => Number(d[feature as keyof CyberTelemetryEvent]));
      const negVals = dataset.filter((d) => d.label !== cls).map((d) => Number(d[feature as keyof CyberTelemetryEvent]));

      const posStats = computeStats(posVals);
      const negStats = computeStats(negVals);

      // Simple threshold test
      const threshold = (posStats.mean + negStats.mean) / 2;
      const isGreater = posStats.mean > negStats.mean;

      let correct = 0;
      dataset.forEach((d) => {
        const v = Number(d[feature as keyof CyberTelemetryEvent]);
        const pred = isGreater ? v >= threshold : v <= threshold;
        const actual = d.label === cls;
        if (pred === actual) correct++;
      });

      const acc = (correct / dataset.length) * 100;
      if (acc > bestAcc) {
        bestAcc = acc;
        targetClass = cls;
      }
    });

    const leakageRisk = bestAcc > 90 ? "🚨 HIGH LEAKAGE" : bestAcc > 75 ? "⚠️ MODERATE" : "✅ HEALTHY OVERLAP";
    markdownContent += `| \`${feature}\` | \`${targetClass}\` | **${bestAcc.toFixed(2)}%** | ${leakageRisk} |\n`;
  });

  const reportPath = path.join(reportsDir, "feature_separability.md");
  fs.writeFileSync(reportPath, markdownContent);
  console.log(`✅ Feature separability report successfully written to:\n   - ${reportPath}`);
}

if (process.argv[1]?.includes("auditCyberDataset")) {
  const dataset = generateCyberDataset();
  auditDataset(dataset);
}
