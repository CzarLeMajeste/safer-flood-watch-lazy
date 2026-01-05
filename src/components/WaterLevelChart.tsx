import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { SensorReading } from "@/hooks/useSensorReadings";

interface WaterLevelChartProps {
  data: SensorReading[];
  isLoading: boolean;
}

const WARNING_LEVEL = 80;
const CRITICAL_LEVEL = 100;

const WaterLevelChart = ({ data, isLoading }: WaterLevelChartProps) => {
  const chartData = data.map((reading) => ({
    time: format(new Date(reading.created_at), "HH:mm"),
    level: reading.water_level,
  }));

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <CardTitle className="text-lg font-semibold">
            Water Level Trend (24h)
          </CardTitle>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-alert-warning rounded" />
              <span className="text-muted-foreground">Warning (80cm)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-alert-danger rounded" />
              <span className="text-muted-foreground">Critical (100cm)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 md:h-80 w-full">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Loading chart data...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No sensor readings in the last 24 hours
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--chart-grid))"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 140]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}cm`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => [`${value} cm`, "Water Level"]}
                />
                <ReferenceLine
                  y={WARNING_LEVEL}
                  stroke="hsl(var(--alert-warning))"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                />
                <ReferenceLine
                  y={CRITICAL_LEVEL}
                  stroke="hsl(var(--alert-danger))"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                />
                <Line
                  type="monotone"
                  dataKey="level"
                  stroke="hsl(var(--chart-water))"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "hsl(var(--chart-water))",
                    stroke: "hsl(var(--background))",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterLevelChart;
