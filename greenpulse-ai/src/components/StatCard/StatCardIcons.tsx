import { HeartPulse, ShieldAlert, Wallet, Leaf, Cloud } from "lucide-react";

export const FleetHealthIcon = () => (
  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
    <HeartPulse className="h-4 w-4" />
  </span>
);

export const CriticalDevicesIcon = () => (
  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-risk-high-bg text-risk-high">
    <ShieldAlert className="h-4 w-4" />
  </span>
);

export const RepairCostIcon = () => (
  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-info-bg text-info">
    <Wallet className="h-4 w-4" />
  </span>
);

export const EwasteIcon = () => (
  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
    <Leaf className="h-3.5 w-3.5" />
  </span>
);

export const Co2Icon = () => (
  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-info-bg text-info">
    <Cloud className="h-3.5 w-3.5" />
  </span>
);
