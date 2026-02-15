import { MapPin, Wifi, WifiOff, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Sensor {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  status: "online" | "offline";
  lastPing: string;
}

export const SENSORS: Sensor[] = [
  {
    id: "ESP32-001",
    name: "River Bridge Sensor",
    location: "Brgy. San Miguel Bridge",
    lat: 14.5995,
    lng: 120.9842,
    status: "online",
    lastPing: "2 min ago",
  },
  {
    id: "ESP32-002",
    name: "School Area Sensor",
    location: "Brgy. Elementary School",
    lat: 14.6012,
    lng: 120.9856,
    status: "online",
    lastPing: "1 min ago",
  },
  {
    id: "ESP32-003",
    name: "Barangay Hall Sensor",
    location: "Brgy. Hall Complex",
    lat: 14.5978,
    lng: 120.9831,
    status: "offline",
    lastPing: "15 min ago",
  },
];

interface SensorMapProps {
  selectedSensorId: string;
  onSelectSensor: (sensorId: string) => void;
}

const SensorMap = ({ selectedSensorId, onSelectSensor }: SensorMapProps) => {
  const onlineSensors = SENSORS.filter((s) => s.status === "online").length;
  const selectedSensor = SENSORS.find((s) => s.id === selectedSensorId);

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Sensor Network</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-sensor-online font-medium">{onlineSensors}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{SENSORS.length} online</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Map Area */}
        <div className="relative w-full h-48 md:h-64 rounded-lg bg-secondary/50 overflow-hidden mb-4">
          {/* Grid overlay for map effect */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--chart-grid)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--chart-grid)) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Sensor pins */}
          {SENSORS.map((sensor, index) => {
            const isSelected = sensor.id === selectedSensorId;
            return (
              <button
                key={sensor.id}
                onClick={() => onSelectSensor(sensor.id)}
                className={cn(
                  "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group cursor-pointer",
                  sensor.status === "online" && !isSelected && "sensor-pulse",
                  isSelected && "z-20 scale-125",
                )}
                style={{
                  left: `${25 + index * 25}%`,
                  top: `${30 + index * 15}%`,
                }}
                title={`${sensor.name} — ${sensor.location}`}
              >
                <div
                  className={cn(
                    "relative p-2 rounded-full transition-all duration-200",
                    isSelected
                      ? "bg-primary/30 border-2 border-primary shadow-lg shadow-primary/30 ring-2 ring-primary/20"
                      : sensor.status === "online"
                        ? "bg-sensor-online/20 border-2 border-sensor-online group-hover:bg-sensor-online/30"
                        : "bg-sensor-offline/20 border-2 border-sensor-offline group-hover:bg-sensor-offline/30",
                  )}
                >
                  <MapPin
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isSelected
                        ? "text-primary"
                        : sensor.status === "online"
                          ? "text-sensor-online"
                          : "text-sensor-offline",
                    )}
                  />
                </div>
                {/* Tooltip on hover */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-background/90 backdrop-blur-sm border border-border rounded px-2 py-0.5 text-[10px] text-foreground shadow-md">
                  {sensor.name}
                </div>
              </button>
            );
          })}

          {/* Selected location label */}
          <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground flex items-center gap-1.5">
            <Navigation className="h-3 w-3 text-primary" />
            {selectedSensor?.location ?? "Barangay San Miguel, Bulacan"}
          </div>
        </div>

        {/* Sensor list */}
        <div className="space-y-2">
          {SENSORS.map((sensor) => {
            const isSelected = sensor.id === selectedSensorId;
            return (
              <button
                key={sensor.id}
                onClick={() => onSelectSensor(sensor.id)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg w-full text-left transition-all duration-200",
                  isSelected
                    ? "bg-primary/10 border border-primary/30 ring-1 ring-primary/20"
                    : "bg-secondary/30 hover:bg-secondary/50 border border-transparent",
                )}
              >
                <div className="flex items-center gap-3">
                  {sensor.status === "online" ? (
                    <Wifi className={cn("h-4 w-4", isSelected ? "text-primary" : "text-sensor-online")} />
                  ) : (
                    <WifiOff className="h-4 w-4 text-sensor-offline" />
                  )}
                  <div>
                    <p className={cn("text-sm font-medium", isSelected && "text-primary")}>{sensor.name}</p>
                    <p className="text-xs text-muted-foreground">{sensor.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "text-xs font-medium",
                      isSelected
                        ? "text-primary"
                        : sensor.status === "online"
                          ? "text-sensor-online"
                          : "text-sensor-offline",
                    )}
                  >
                    {isSelected ? "VIEWING" : sensor.status.toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">{sensor.lastPing}</p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorMap;
