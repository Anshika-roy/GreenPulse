-- CreateEnum
CREATE TYPE "TelemetryMetricType" AS ENUM ('battery_health_percent', 'battery_cycle_count', 'ssd_wear_percent', 'ssd_health_percent', 'thermal_event', 'cpu_temperature_c', 'ram_usage_percent', 'storage_usage_percent');

-- CreateEnum
CREATE TYPE "TelemetrySource" AS ENUM ('real_agent', 'demo_simulated');

-- CreateTable
CREATE TABLE "telemetry_readings" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "metricType" "TelemetryMetricType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "source" "TelemetrySource" NOT NULL DEFAULT 'demo_simulated',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telemetry_readings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "telemetry_readings_deviceId_idx" ON "telemetry_readings"("deviceId");

-- CreateIndex
CREATE INDEX "telemetry_readings_deviceId_metricType_idx" ON "telemetry_readings"("deviceId", "metricType");

-- AddForeignKey
ALTER TABLE "telemetry_readings" ADD CONSTRAINT "telemetry_readings_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
