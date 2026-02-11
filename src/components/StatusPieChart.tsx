import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { SensorReading } from "@/hooks/useSensorReadings";

interface StatusPieChartProps {
  data: SensorReading[];
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  Advisory: "hsl(var(--alert-safe, 142 71% 45%))",
  Warning: "hsl(var(--alert-warning, 45 93% 47%))",
  Evacuation: "hsl(var(--alert-danger, 0 84% 60%))",
};

const RAINFALL_COLORS = [
  "hsl(142, 71%, 45%)",
  "hsl(45, 93%, 47%)",
  "hsl(0, 84%, 60%)",
];

const StatusPieChart = ({ data, isLoading }: StatusPieChartProps) => {
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((r) => {
      const s = r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase();
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  const rainfallData = useMemo(() => {
    let heavy = 0, moderate = 0, dry = 0;
    data.forEach((r) => {
      if (r.rainfall_intensity < 1500) heavy++;
      else if (r.rainfall_intensity <= 3000) moderate++;
      else dry++;
    });
    return [
      { name: "Heavy Rain", value: heavy },
      { name: "Moderate Rain", value: moderate },
      { name: "Dry / Light", value: dry },
    ].filter((d) => d.value > 0);
  }, [data]);

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          Loading chart data...
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          No sensor readings in the last 30 days
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Status Distribution */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">
            Status Distribution (30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 md:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {statusData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] || "hsl(var(--muted))"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value} readings`, "Count"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Rainfall Distribution */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">
            Rainfall Distribution (30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 md:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rainfallData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {rainfallData.map((_, index) => (
                    <Cell key={index} fill={RAINFALL_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value} readings`, "Count"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusPieChart;
