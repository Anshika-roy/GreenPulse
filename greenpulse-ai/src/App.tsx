import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { Navbar } from "@/components/Navbar/Navbar";
import { RequireAuth } from "@/components/Layout/RequireAuth";

import DashboardPage from "@/pages/Dashboard";
import DevicesPage from "@/pages/Devices";
import DeviceDetailPage from "@/pages/DeviceDetail";
import MaintenancePage from "@/pages/Maintenance";
import AlertsPage from "@/pages/Alerts";
import TicketsPage from "@/pages/Tickets";
import WarrantyPage from "@/pages/Warranty";
import ReportsPage from "@/pages/Reports";
import SustainabilityPage from "@/pages/Sustainability";
import SettingsPage from "@/pages/Settings";
import LoginPage from "@/pages/Login";

/** Route table. Sidebar and Navbar are passed into AppLayout as slots. */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout sidebar={<Sidebar />} navbar={<Navbar />} />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/device/:id" element={<DeviceDetailPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/warranty" element={<WarrantyPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/sustainability" element={<SustainabilityPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
