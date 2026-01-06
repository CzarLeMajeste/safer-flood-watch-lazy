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
  Legend,
} from "recharts";
import { SensorReading } from "@/hooks/useSensorReadings";

interface EnvironmentalChartProps {
  data: SensorReading[];
  isLoading: boolean;
}

const EnvironmentalChart = ({ data, isLoading }: EnvironmentalChartProps) => {
  const chartData = data.map((reading) => ({
    time: format(new Date(reading.created_at), "HH:mm"),
    temperature: reading.temperature,
    humidity: reading.humidity,
  }));

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <CardTitle className="text-lg font-semibold">
            Environmental Conditions (24h)
          </CardTitle>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-orange-500 rounded" />
              <span className="text-muted-foreground">Temperature (°C)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-blue-500 rounded" />
              <span className="text-muted-foreground">Humidity (%)</span>
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
                  yAxisId="temp"
                  orientation="left"
                  domain={[0, 50]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}°C`}
                />
                <YAxis
                  yAxisId="humidity"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number, name: string) => [
                    name === "temperature" ? `${value}°C` : `${value}%`,
                    name === "temperature" ? "Temperature" : "Humidity"
                  ]}
                />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperature"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#f97316",
                    stroke: "hsl(var(--background))",
                    strokeWidth: 2,
                  }}
                />
                <Line
                  yAxisId="humidity"
                  type="monotone"
                  dataKey="humidity"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#3b82f6",
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

export default EnvironmentalChart;
