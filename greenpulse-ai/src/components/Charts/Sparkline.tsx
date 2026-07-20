import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import type { FleetTrendPoint } from "@/types";

interface SparklineProps {
  data: FleetTrendPoint[];
  color: string; // hex or css var, e.g. "#3E9C49"
  fillOpacity?: number;
  height?: number;
}

/** Minimal trend line used inside StatCards (Fleet Health, Critical Devices, Repair Cost) */
export function Sparkline({ data, color, height = 56 }: SparklineProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={true}
          animationDuration={600}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
