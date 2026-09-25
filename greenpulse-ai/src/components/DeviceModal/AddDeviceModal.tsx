import { useState } from "react";
import { Check, Copy, ShieldAlert, Laptop, X, KeyRound } from "lucide-react";
import { apiRequest } from "@/lib/apiClient";
import { Button } from "@/components/Buttons/Button";

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EnrollmentResult {
  device: {
    id: string;
    model: string;
    assetTag: string;
    category: string;
    enrollmentStatus: string;
  };
  agentToken: string;
}

export function AddDeviceModal({ isOpen, onClose, onSuccess }: AddDeviceModalProps) {
  const [name, setName] = useState("");
  const [deviceType, setDeviceType] = useState("laptop");
  const [serialNumber, setSerialNumber] = useState("");
  const [location, setLocation] = useState("");
  const [ownerName, setOwnerName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollmentResult, setEnrollmentResult] = useState<EnrollmentResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const mockToken = `gp_agent_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const res = await apiRequest<EnrollmentResult>("/devices/enroll", {
        method: "POST",
        body: { name, deviceType, serialNumber, location, ownerName },
        mockResolver: () => ({
          device: {
            id: `dev-${Date.now()}`,
            model: name,
            assetTag: serialNumber ? serialNumber.toUpperCase() : `GP-DEV-${Math.floor(1000 + Math.random() * 9000)}`,
            category: deviceType,
            enrollmentStatus: "ENROLLED",
          },
          agentToken: mockToken,
        }),
      });

      setEnrollmentResult(res);
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg((err as Error).message || "Enrollment failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCopyToken() {
    if (enrollmentResult?.agentToken) {
      navigator.clipboard.writeText(enrollmentResult.agentToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function handleModalClose() {
    setEnrollmentResult(null);
    setName("");
    setSerialNumber("");
    setLocation("");
    setOwnerName("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-card border border-border bg-surface p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <Laptop className="h-5 w-5 text-brand-600" />
            {enrollmentResult ? "Device Enrolled Successfully" : "Enroll New Enterprise Device"}
          </h2>
          <button onClick={handleModalClose} className="rounded-lg p-1 text-ink-muted hover:bg-surface-sunken hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        {enrollmentResult ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-800 dark:text-emerald-300">
              <p className="font-semibold text-base">✅ Device Registered!</p>
              <p className="mt-1 text-xs">
                <strong>Model:</strong> {enrollmentResult.device.model} ({enrollmentResult.device.assetTag})
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-sunken p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink uppercase tracking-wide flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4 text-brand-600" />
                  Agent Device Token
                </span>
                <button
                  onClick={handleCopyToken}
                  className="flex items-center gap-1 rounded bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-700"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy Token"}
                </button>
              </div>

              <div className="rounded border border-border bg-surface p-2.5 font-mono text-xs text-brand-700 dark:text-brand-300 break-all select-all">
                {enrollmentResult.agentToken}
              </div>

              <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded border border-amber-500/20">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Important:</strong> Save this token now. It is shown only once during enrollment.
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-ink-muted">Configure your target device agent (.env):</p>
              <pre className="rounded-lg border border-border bg-surface-sunken p-3 font-mono text-xs text-ink overflow-x-auto">
{`GREENPULSE_API_URL=${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}
GREENPULSE_DEVICE_TOKEN=${enrollmentResult.agentToken}`}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleModalClose}>Done & Close</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
            {errorMsg && (
              <div className="rounded bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-700 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="mb-1 block font-medium text-ink">Device Name / Model *</label>
              <input
                type="text"
                required
                placeholder="e.g. Anshika-MacBook-Pro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block font-medium text-ink">Device Category</label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-brand-500"
                >
                  <option value="laptop">Laptop</option>
                  <option value="desktop">Desktop</option>
                  <option value="server">Server</option>
                  <option value="monitor">Monitor</option>
                  <option value="printer">Printer</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium text-ink">Asset Tag / Serial No.</label>
                <input
                  type="text"
                  placeholder="e.g. GP-LAP-105"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block font-medium text-ink">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Building A, Floor 3"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-brand-500"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-ink">Owner Name</label>
                <input
                  type="text"
                  placeholder="e.g. Anshika Roy"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <Button type="button" variant="secondary" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enrolling..." : "+ Enroll & Generate Token"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
