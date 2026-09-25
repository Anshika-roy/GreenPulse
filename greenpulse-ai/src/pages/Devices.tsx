import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDevices } from "@/hooks/useDevices";
import { DeviceTable } from "@/components/DeviceTable/DeviceTable";
import { DeviceTableToolbar } from "@/components/DeviceTable/DeviceTableToolbar";
import type { Device, DeviceCategory, DeviceListParams, RiskLevel } from "@/types";

import { Plus } from "lucide-react";
import { Button } from "@/components/Buttons/Button";
import { AddDeviceModal } from "@/components/DeviceModal/AddDeviceModal";

const PAGE_SIZE = 10;

export default function DevicesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel | "all">("all");
  const [category, setCategory] = useState<DeviceCategory | "all">("all");
  const [sortBy, setSortBy] = useState<DeviceListParams["sortBy"]>("health");
  const [sortDir, setSortDir] = useState<DeviceListParams["sortDir"]>("asc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data, isLoading, refetch } = useDevices({
    page,
    pageSize: PAGE_SIZE,
    search,
    riskLevel,
    category,
    sortBy,
    sortDir,
  });

  function handleSortChange(key: NonNullable<DeviceListParams["sortBy"]>) {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setRiskLevel("all");
    setCategory("all");
    setPage(1);
  }

  function handleDeviceAction(device: Device) {
    navigate(`/device/${device.id}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Devices Directory</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {data?.total ?? "—"} devices enrolled across your enterprise fleet.
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Device
        </Button>
      </div>

      <div className="rounded-card border border-border bg-surface shadow-card">
        <DeviceTableToolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          riskLevel={riskLevel}
          onRiskLevelChange={(v) => {
            setRiskLevel(v);
            setPage(1);
          }}
          category={category}
          onCategoryChange={(v) => {
            setCategory(v);
            setPage(1);
          }}
        />

        <DeviceTable
          devices={data?.data ?? []}
          total={data?.total ?? 0}
          page={page}
          pageSize={PAGE_SIZE}
          sortBy={sortBy}
          sortDir={sortDir}
          isLoading={isLoading}
          onPageChange={setPage}
          onSortChange={handleSortChange}
          onDeviceAction={handleDeviceAction}
          onDeviceSupport={(d) => navigate(`/tickets?deviceId=${d.id}`)}
          onDeviceMenu={handleDeviceAction}
          emptyActionLabel="Clear filters"
          onEmptyAction={resetFilters}
        />
      </div>

      <AddDeviceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
