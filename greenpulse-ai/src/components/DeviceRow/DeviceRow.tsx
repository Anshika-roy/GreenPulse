import { Laptop, Monitor, Server, Smartphone, Printer, CalendarDays, MoreVertical, LifeBuoy } from "lucide-react";
import { Link } from "react-router-dom";
import { RiskBadge } from "@/components/Badges/RiskBadge";
import { ActionBadge } from "@/components/Badges/ActionBadge";
import { HealthBar } from "@/components/ProgressBar/HealthBar";
import { ConfidenceBar } from "@/components/ProgressBar/ConfidenceBar";
import type { Device, DeviceCategory } from "@/types";
import { formatEta } from "@/services/deviceService";

const CATEGORY_ICON: Record<DeviceCategory, React.ElementType> = {
  laptop: Laptop,
  desktop: Server,
  monitor: Monitor,
  printer: Printer,
  mobile: Smartphone,
  server: Server,
};

interface DeviceRowProps {
  device: Device;
  onRecommendationClick?: (device: Device) => void;
  onSupportClick?: (device: Device) => void;
  onMenuClick?: (device: Device) => void;
}

export function DeviceRow({ device, onRecommendationClick, onSupportClick, onMenuClick }: DeviceRowProps) {
  const Icon = CATEGORY_ICON[device.category];

  return (
    <tr className="group border-b border-border last:border-0 hover:bg-surface-sunken">
      <td className="px-4 py-4">
        <Link to={`/device/${device.id}`} className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-sunken text-ink-muted">
            <Icon className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-ink">{device.model}</span>
            <span className="block truncate text-xs text-ink-muted">{device.assetTag}</span>
          </span>
        </Link>
      </td>

      <td className="px-4 py-4">
        <HealthBar value={device.healthScore} riskLevel={device.riskLevel} />
      </td>

      <td className="px-4 py-4">
        <RiskBadge level={device.riskLevel} />
      </td>

      <td className="px-4 py-4 text-sm text-ink">{device.issue.label}</td>

      <td className="px-4 py-4">
        <ConfidenceBar value={device.aiConfidence} />
      </td>

      <td className="px-4 py-4">
        <ActionBadge
          recommendation={device.recommendation}
          onClick={() => onRecommendationClick?.(device)}
        />
      </td>

      <td className="px-4 py-4">
        <span className="flex items-center gap-1.5 text-sm text-ink-muted">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatEta(device.recommendation.etaDate)}
        </span>
      </td>

      <td className="px-4 py-4">
        <button
          type="button"
          aria-label={`Get support for ${device.model}`}
          onClick={() => onSupportClick?.(device)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint opacity-0 transition-opacity hover:bg-surface hover:text-brand-600 group-hover:opacity-100"
        >
          <LifeBuoy className="h-4 w-4" />
        </button>
      </td>

      <td className="px-2 py-4">
        <button
          type="button"
          aria-label={`More actions for ${device.model}`}
          onClick={() => onMenuClick?.(device)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-surface hover:text-ink"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
