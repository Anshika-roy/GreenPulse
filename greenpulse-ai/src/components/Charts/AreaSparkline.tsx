import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import type { FleetTrendPoint } from "@/types";

/** Filled-area trend used for Repair Cost card to match the reference's soft blue fill */
export function AreaSparkline({
  data,
  color,
  height = 56,
}: {
  data: FleetTrendPoint[];
  color: string;
  height?: number;
}) {
  const gradientId = `area-${color.replace("#", "")}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          isAnimationActive={true}
          animationDuration={600}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
