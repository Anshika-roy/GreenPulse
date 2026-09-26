import fs from "fs";
import path from "path";

/**
 * GreenPulse AI — Realistic Overlapping 10,000 Sample Cybersecurity Telemetry Generator (v2.0)
 * 
 * Target Distribution (10,000 total):
 * - 3,000 normal
 * - 1,750 brute_force
 * - 1,750 malware
 * - 1,750 data_exfiltration
 * - 1,750 anomalous_network_activity
 */

export interface CyberTelemetryEvent {
  // Device Information
  event_id: string;
  device_id: string;
  device_type: "laptop" | "desktop" | "workstation" | "server";
  os: "Windows" | "Linux" | "macOS";
  os_version: string;
  device_age_days: number;

  // Authentication Activity
  login_attempts: number;
  failed_logins: number;
  successful_logins: number;
  login_failure_rate: number;
  login_velocity: number;
  new_user_login: number; // 0 or 1
  new_country: number;    // 0 or 1
  new_ip: number;         // 0 or 1

  // Network Activity
  requests_per_min: number;
  bytes_sent_mb: number;
  bytes_received_mb: number;
  bytes_ratio: number;
  external_connection_count: number;
  unusual_port_activity: number; // 0 or 1
  dns_query_count: number;
  domain_reputation_score: number; // 0.0 to 10.0

  // Process & System Activity
  cpu_usage_percent: number;
  ram_usage_percent: number;
  process_count: number;
  unsigned_process_count: number;
  hidden_process_count: number;
  privilege_escalation_attempt: number; // 0 or 1
  cmd_powershell_execution: number;     // 0 or 1
  file_modification_rate: number;

  // Label & Security Metadata
  label: "normal" | "brute_force" | "malware" | "data_exfiltration" | "anomalous_network_activity";
  attack_type: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  reason: string;
  recommended_action: string;
}

class SeededRandom {
  private seed: number;
  constructor(seed: number = 20260926) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
  gaussian(mean: number, std: number): number {
    const u1 = Math.max(1e-15, this.next());
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * std;
  }
  choice<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

export function generateCyberDataset(): CyberTelemetryEvent[] {
  const rng = new SeededRandom(101);
  const dataset: CyberTelemetryEvent[] = [];

  const deviceTypes: ("laptop" | "desktop" | "workstation" | "server")[] = ["laptop", "desktop", "workstation", "server"];
  const osOptions: ("Windows" | "Linux" | "macOS")[] = ["Windows", "Linux", "macOS"];
  const osVersions: Record<string, string[]> = {
    Windows: ["Windows 11 23H2", "Windows 10 22H2", "Windows Server 2022"],
    Linux: ["Ubuntu 22.04 LTS", "Debian 12", "RHEL 9.3"],
    macOS: ["macOS Sonoma 14.4", "macOS Ventura 13.6"],
  };

  const addSamples = (
    count: number,
    label: "normal" | "brute_force" | "malware" | "data_exfiltration" | "anomalous_network_activity"
  ) => {
    for (let i = 0; i < count; i++) {
      const os = rng.choice(osOptions);
      const os_version = rng.choice(osVersions[os]);
      const device_type = rng.choice(deviceTypes);
      const device_id = `DEV-${rng.int(10000, 99999)}`;
      const event_id = `EVT-${dataset.length + 100001}`;
      const device_age_days = rng.int(10, 1800);

      // BASE OVERLAPPING FEATURES (Realistic continuous distribution)
      let attempts = rng.int(1, 12);
      let failed = rng.int(0, Math.min(attempts, 3));
      let success = Math.max(1, attempts - failed);
      let velocity = Math.max(0.1, rng.gaussian(1.5, 1.2));
      let new_user = rng.next() < 0.12 ? 1 : 0;
      let new_country = rng.next() < 0.05 ? 1 : 0;
      let new_ip = rng.next() < 0.2 ? 1 : 0;

      let req_per_min = Math.max(5, rng.gaussian(35, 25));
      let bytes_sent = Math.max(0.2, rng.gaussian(12, 18));
      let bytes_recv = Math.max(1.0, rng.gaussian(45, 35));
      let ext_conns = Math.max(1, Math.round(rng.gaussian(8, 6)));
      let unusual_port = rng.next() < 0.15 ? 1 : 0;
      let dns_queries = Math.max(10, Math.round(rng.gaussian(80, 60)));
      let domain_rep = Math.min(10, Math.max(1, rng.gaussian(8.2, 1.5)));

      let cpu = Math.min(100, Math.max(5, rng.gaussian(38, 22)));
      let ram = Math.min(100, Math.max(15, rng.gaussian(52, 20)));
      let proc_count = Math.max(30, Math.round(rng.gaussian(110, 45)));
      let unsigned_procs = rng.next() < 0.2 ? rng.int(1, 3) : 0;
      let hidden_procs = rng.next() < 0.08 ? 1 : 0;
      let priv_esc = rng.next() < 0.05 ? 1 : 0;
      let cmd_pwsh = rng.next() < 0.3 ? 1 : 0; // 30% normal admin script usage
      let file_mod_rate = Math.max(0.1, rng.gaussian(4.5, 6.0));

      let attack_type = "N/A";
      let severity: "Low" | "Medium" | "High" | "Critical" = "Low";
      let reason = "Routine enterprise hardware & authentication telemetry baseline.";
      let recommended_action = "Routine monitoring; no action required.";

      // REALISTIC OVERLAPPING ATTACK CLASS DISTRIBUTIONS
      if (label === "normal") {
        // Normal workload spikes (e.g., builds, backups, admin scripts)
        if (rng.next() < 0.15) {
          cpu = rng.range(75, 98); // High CPU load for rendering/compilation
          ram = rng.range(70, 95);
        }
        if (rng.next() < 0.1) {
          bytes_sent = rng.range(80, 350); // Large legitimate cloud backup
        }
        if (rng.next() < 0.12) {
          failed = rng.int(2, 6); // Forgotten password typos
          attempts = failed + 1;
        }
      } else if (label === "brute_force") {
        // Slow-spray to aggressive brute force (overlapping login ranges)
        attempts = rng.int(8, 90);
        failed = rng.int(Math.floor(attempts * 0.45), attempts - 1);
        success = Math.max(0, attempts - failed);
        velocity = rng.range(3.5, 45.0);
        new_user = rng.next() < 0.5 ? 1 : 0;
        new_ip = rng.next() < 0.65 ? 1 : 0;
        new_country = rng.next() < 0.35 ? 1 : 0; // 35% from known VPN/country
        attack_type = rng.choice(["Credential Stuffing", "RDP Brute Force", "Password Spray"]);
        severity = failed > 35 ? "Critical" : "High";
        reason = `Elevated authentication failures (${failed}/${attempts} logins) detected from remote address.`;
        recommended_action = "Enforce rate limiting, require MFA, and review authentication logs.";
      } else if (label === "malware") {
        // Stealthy spyware to high-activity malware
        cpu = rng.range(45, 96);
        ram = rng.range(55, 94);
        proc_count = rng.int(120, 380);
        unsigned_procs = rng.next() < 0.65 ? rng.int(1, 6) : 0; // 35% malware uses LOLBins (signed tools)
        hidden_procs = rng.next() < 0.45 ? rng.int(1, 4) : 0;
        priv_esc = rng.next() < 0.4 ? 1 : 0;
        cmd_pwsh = rng.next() < 0.7 ? 1 : 0;
        file_mod_rate = rng.range(12.0, 180.0);
        attack_type = rng.choice(["Ransomware Payload", "Trojan Backdoor", "Stealth Spyware"]);
        severity = priv_esc === 1 || file_mod_rate > 90 ? "Critical" : "High";
        reason = `Elevated system activity with process anomalies (${unsigned_procs} unsigned binaries, ${hidden_procs} hidden PIDs).`;
        recommended_action = "Isolate endpoint, kill unverified processes, and execute full EDR scan.";
      } else if (label === "data_exfiltration") {
        // Slow exfiltration (40MB) to large dumps (1.2GB)
        bytes_sent = rng.range(35.0, 1200.0);
        bytes_recv = rng.range(5.0, 60.0);
        ext_conns = rng.int(8, 45);
        unusual_port = rng.next() < 0.55 ? 1 : 0;
        dns_queries = rng.int(150, 1400);
        domain_rep = rng.range(2.5, 6.5); // Overlaps with moderate reputation domains
        attack_type = rng.choice(["DNS Tunneling", "HTTPS Exfiltration", "Staging Spill"]);
        severity = bytes_sent > 500 ? "Critical" : "High";
        reason = `High outbound data ratio (${Math.round(bytes_sent)} MB sent) to external domain (Reputation: ${domain_rep.toFixed(1)}).`;
        recommended_action = "Block destination IP/domain, audit DLP alerts, and inspect outbound TLS sessions.";
      } else if (label === "anomalous_network_activity") {
        // Reconnaissance to C2 beaconing
        req_per_min = rng.range(65.0, 480.0);
        ext_conns = rng.int(20, 110);
        unusual_port = rng.next() < 0.6 ? 1 : 0;
        dns_queries = rng.int(220, 1100);
        domain_rep = rng.range(4.0, 7.2);
        attack_type = rng.choice(["Port Scanning / Recon", "C2 Beaconing", "Botnet Activity"]);
        severity = req_per_min > 250 ? "High" : "Medium";
        reason = `Unusual request frequency (${Math.round(req_per_min)} req/min) across ${ext_conns} external socket connections.`;
        recommended_action = "Verify firewall ACLs, inspect open network ports, and monitor endpoint socket bindings.";
      }

      const login_failure_rate = Number((failed / Math.max(1, attempts)).toFixed(4));
      const bytes_ratio = Number((bytes_sent / (bytes_recv + 0.01)).toFixed(4));

      dataset.push({
        event_id,
        device_id,
        device_type,
        os,
        os_version,
        device_age_days,

        login_attempts: attempts,
        failed_logins: failed,
        successful_logins: success,
        login_failure_rate,
        login_velocity: Number(velocity.toFixed(2)),
        new_user_login: new_user,
        new_country,
        new_ip,

        requests_per_min: Number(req_per_min.toFixed(2)),
        bytes_sent_mb: Number(bytes_sent.toFixed(2)),
        bytes_received_mb: Number(bytes_recv.toFixed(2)),
        bytes_ratio,
        external_connection_count: ext_conns,
        unusual_port_activity: unusual_port,
        dns_query_count: dns_queries,
        domain_reputation_score: Number(domain_rep.toFixed(2)),

        cpu_usage_percent: Number(cpu.toFixed(2)),
        ram_usage_percent: Number(ram.toFixed(2)),
        process_count: proc_count,
        unsigned_process_count: unsigned_procs,
        hidden_process_count: hidden_procs,
        privilege_escalation_attempt: priv_esc,
        cmd_powershell_execution: cmd_pwsh,
        file_modification_rate: Number(file_mod_rate.toFixed(2)),

        label,
        attack_type,
        severity,
        reason,
        recommended_action,
      });
    }
  };

  addSamples(3000, "normal");
  addSamples(1750, "brute_force");
  addSamples(1750, "malware");
  addSamples(1750, "data_exfiltration");
  addSamples(1750, "anomalous_network_activity");

  return dataset;
}

export function exportDatasetToFiles() {
  console.log("==================================================");
  console.log("  GREENPULSE CYBERSECURITY 10K DATASET GENERATOR  ");
  console.log("==================================================");

  const dataset = generateCyberDataset();

  const datasetDir = path.join(__dirname, "../datasets");
  if (!fs.existsSync(datasetDir)) {
    fs.mkdirSync(datasetDir, { recursive: true });
  }

  const jsonPath = path.join(datasetDir, "cyber_telemetry_10k.json");
  fs.writeFileSync(jsonPath, JSON.stringify(dataset, null, 2));
  console.log(`✅ Saved Hard JSON Dataset (10,000 records): ${jsonPath}`);

  const csvHeaders = Object.keys(dataset[0]).join(",");
  const csvRows = dataset.map((row) =>
    Object.values(row)
      .map((val) => (typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val))
      .join(",")
  );

  const csvPath = path.join(datasetDir, "cyber_telemetry_10k.csv");
  fs.writeFileSync(csvPath, [csvHeaders, ...csvRows].join("\n"));
  console.log(`✅ Saved Hard CSV Dataset (10,000 records): ${csvPath}`);

  const dist: Record<string, number> = {};
  dataset.forEach((d) => {
    dist[d.label] = (dist[d.label] || 0) + 1;
  });

  console.log("\n📊 HARD DATASET CLASS DISTRIBUTION SUMMARY:");
  Object.entries(dist).forEach(([cls, count]) => {
    console.log(`   - ${cls.padEnd(28)}: ${count} samples (${((count / dataset.length) * 100).toFixed(1)}%)`);
  });
}

if (process.argv[1]?.includes("generateCyberDataset")) {
  exportDatasetToFiles();
}
