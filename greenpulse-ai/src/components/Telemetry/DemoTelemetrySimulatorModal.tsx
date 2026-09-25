import { useState } from "react";
import { Activity, RefreshCw, X, Zap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import devicesMock from "@/mock/devices.json";
import { postTelemetry } from "@/api/telemetry";
import { Button } from "@/components/Buttons/Button";

interface DemoTelemetrySimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDeviceId?: string;
}

export function DemoTelemetrySimulatorModal({
  isOpen,
  onClose,
  defaultDeviceId,
}: DemoTelemetrySimulatorModalProps) {
  const queryClient = useQueryClient();
  const devices = devicesMock as Array<Record<string, any>>;

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(
    defaultDeviceId || devices[0]?.id || ""
  );

  const [batteryHealth, setBatteryHealth] = useState<number>(55);
  const [batteryCycles, setBatteryCycles] = useState<number>(850);
  const [ssdWear, setSsdWear] = useState<number>(78);
  const [cpuTemp, setCpuTemp] = useState<number>(92);
  const [thermalEvents, setThermalEvents] = useState<number>(4);
  const [ramUsage, setRamUsage] = useState<number>(88);
  const [storageUsage, setStorageUsage] = useState<number>(82);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentDevice = devices.find((d) => d.id === selectedDeviceId);

  function applyProfile(profile: "healthy" | "aging" | "critical") {
    if (profile === "healthy") {
      setBatteryHealth(95);
      setBatteryCycles(120);
      setSsdWear(12);
      setCpuTemp(55);
      setThermalEvents(0);
      setRamUsage(45);
      setStorageUsage(50);
    } else if (profile === "aging") {
      setBatteryHealth(72);
      setBatteryCycles(480);
      setSsdWear(42);
      setCpuTemp(72);
      setThermalEvents(1);
      setRamUsage(75);
      setStorageUsage(70);
    } else {
      setBatteryHealth(42);
      setBatteryCycles(980);
      setSsdWear(85);
      setCpuTemp(94);
      setThermalEvents(5);
      setRamUsage(92);
      setStorageUsage(89);
    }
  }

  async function handleSendTelemetry() {
    setIsSubmitting(true);
    setFeedbackMessage(null);

    const now = new Date().toISOString();
    const readings = [
      { metricType: "battery_health_percent" as const, value: batteryHealth, unit: "%", recordedAt: now },
      { metricType: "battery_cycle_count" as const, value: batteryCycles, unit: "cycles", recordedAt: now },
      { metricType: "ssd_wear_percent" as const, value: ssdWear, unit: "%", recordedAt: now },
      { metricType: "cpu_temperature_c" as const, value: cpuTemp, unit: "°C", recordedAt: now },
      { metricType: "thermal_event" as const, value: thermalEvents, unit: "count", recordedAt: now },
      { metricType: "ram_usage_percent" as const, value: ramUsage, unit: "%", recordedAt: now },
      { metricType: "storage_usage_percent" as const, value: storageUsage, unit: "%", recordedAt: now },
    ];

    try {
      await postTelemetry({
        deviceId: selectedDeviceId,
        source: "demo_simulated",
        readings,
      });

      if (currentDevice) {
        const newScore = Math.max(
          10,
          Math.min(
            100,
            Math.round(
              batteryHealth * 0.35 +
                (100 - ssdWear) * 0.35 +
                Math.max(0, 100 - (cpuTemp - 40) * 1.5) * 0.3
            )
          )
        );
        currentDevice.healthScore = newScore;
        currentDevice.riskLevel = newScore < 60 ? "high" : newScore < 80 ? "medium" : "low";
        currentDevice.lastCheckedAt = now;

        if (newScore < 60) {
          currentDevice.issue = {
            code: "HARDWARE_CRITICAL",
            label: "Critical Battery Degradation & SSD Wear Detected",
            detectedAt: now,
          };
          currentDevice.recommendedAction = {
            type: "replace",
            label: "Backup Data & Schedule Device Battery/SSD Replacement",
            etaDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          };
        } else if (newScore < 80) {
          currentDevice.issue = {
            code: "HARDWARE_WARNING",
            label: "Elevated Thermal & Battery Wear",
            detectedAt: now,
          };
          currentDevice.recommendedAction = {
            type: "schedule_service",
            label: "Schedule Preventive Thermal Maintenance",
            etaDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          };
        } else {
          currentDevice.issue = {
            code: "HEALTHY",
            label: "Optimal Operating Condition",
            detectedAt: now,
          };
          currentDevice.recommendedAction = {
            type: "monitor",
            label: "Continue Routine Monitoring",
            etaDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
          };
        }
      }

      await queryClient.invalidateQueries();

      const calculatedScore = currentDevice?.healthScore ?? 50;
      const riskStatus = currentDevice?.riskLevel.toUpperCase() ?? "HIGH";

      setFeedbackMessage(
        `✅ Live Telemetry Streamed! Device Health recalculating → New Score: ${calculatedScore}/100 (${riskStatus} RISK).`
      );
    } catch (err) {
      setFeedbackMessage(`Error sending telemetry: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-card border border-border bg-surface p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-risk-high opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-risk-high"></span>
            </span>
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-600" />
              Demo Telemetry Simulator
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-sunken hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-700 dark:text-amber-400">
          ⚠️ <strong>Hackathon Demo Note:</strong> This simulates live hardware telemetry data streams. Clearly marked as simulated telemetry (Not a native hardware OS agent).
        </div>

        <div className="mt-4 space-y-4 text-sm">
          <div>
            <label className="mb-1 block font-medium text-ink">Select Enterprise Device</label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-brand-500"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.model} ({d.assetTag}) — Current Score: {d.healthScore}/100 [{d.riskLevel.toUpperCase()}]
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-muted">Quick Profile Presets:</span>
            <button
              onClick={() => applyProfile("healthy")}
              className="rounded bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-500/20"
            >
              Healthy Profile
            </button>
            <button
              onClick={() => applyProfile("aging")}
              className="rounded bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-500/20"
            >
              Aging Profile
            </button>
            <button
              onClick={() => applyProfile("critical")}
              className="rounded bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-500/20"
            >
              Critical Risk Profile
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-4 bg-surface-sunken">
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">Battery Health</span>
                <span className="font-semibold text-ink">{batteryHealth}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={batteryHealth}
                onChange={(e) => setBatteryHealth(Number(e.target.value))}
                className="mt-1 w-full accent-brand-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">SSD Wear Level</span>
                <span className="font-semibold text-ink">{ssdWear}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={ssdWear}
                onChange={(e) => setSsdWear(Number(e.target.value))}
                className="mt-1 w-full accent-brand-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">CPU Temperature</span>
                <span className="font-semibold text-ink">{cpuTemp}°C</span>
              </div>
              <input
                type="range"
                min="35"
                max="105"
                value={cpuTemp}
                onChange={(e) => setCpuTemp(Number(e.target.value))}
                className="mt-1 w-full accent-brand-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">Thermal Events</span>
                <span className="font-semibold text-ink">{thermalEvents} events</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={thermalEvents}
                onChange={(e) => setThermalEvents(Number(e.target.value))}
                className="mt-1 w-full accent-brand-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">RAM Usage</span>
                <span className="font-semibold text-ink">{ramUsage}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={ramUsage}
                onChange={(e) => setRamUsage(Number(e.target.value))}
                className="mt-1 w-full accent-brand-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">Storage Usage</span>
                <span className="font-semibold text-ink">{storageUsage}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={storageUsage}
                onChange={(e) => setStorageUsage(Number(e.target.value))}
                className="mt-1 w-full accent-brand-600"
              />
            </div>
          </div>

          {feedbackMessage && (
            <div className="rounded-lg bg-brand-50 p-3 text-xs font-medium text-brand-800 dark:bg-brand-950 dark:text-brand-200">
              {feedbackMessage}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSendTelemetry} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Stream Telemetry...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" /> Stream Telemetry & Recalculate Score
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
