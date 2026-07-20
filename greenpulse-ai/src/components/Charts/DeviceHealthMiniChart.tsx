import { Line, LineChart, ResponsiveContainer } from "recharts";

/** Tiny inline chart usable on the Device Detail page to show recent health history */
export function DeviceHealthMiniChart({ history, color }: { history: number[]; color: string }) {
  const data = history.map((value, i) => ({ i, value }));
  return (
    <ResponsiveContainer width="100%" height={80}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
