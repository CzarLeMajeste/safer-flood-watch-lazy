import { MapPin, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Sensor {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  status: "online" | "offline";
  lastPing: string;
}

const sensors: Sensor[] = [
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

const SensorMap = () => {
  const onlineSensors = sensors.filter((s) => s.status === "online").length;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Sensor Network</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-sensor-online font-medium">{onlineSensors}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{sensors.length} online</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Map Placeholder */}
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
          {sensors.map((sensor, index) => (
            <div
              key={sensor.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                sensor.status === "online" ? "sensor-pulse" : ""
              }`}
              style={{
                left: `${25 + index * 25}%`,
                top: `${30 + index * 15}%`,
              }}
            >
              <div
                className={`relative p-2 rounded-full ${
                  sensor.status === "online"
                    ? "bg-sensor-online/20 border-2 border-sensor-online"
                    : "bg-sensor-offline/20 border-2 border-sensor-offline"
                }`}
              >
                <MapPin
                  className={`h-4 w-4 ${
                    sensor.status === "online"
                      ? "text-sensor-online"
                      : "text-sensor-offline"
                  }`}
                />
              </div>
            </div>
          ))}

          {/* Map label */}
          <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground">
            Barangay San Miguel, Bulacan
          </div>
        </div>

        {/* Sensor list */}
        <div className="space-y-2">
          {sensors.map((sensor) => (
            <div
              key={sensor.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {sensor.status === "online" ? (
                  <Wifi className="h-4 w-4 text-sensor-online" />
                ) : (
                  <WifiOff className="h-4 w-4 text-sensor-offline" />
                )}
                <div>
                  <p className="text-sm font-medium">{sensor.name}</p>
                  <p className="text-xs text-muted-foreground">{sensor.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-xs font-medium ${
                    sensor.status === "online"
                      ? "text-sensor-online"
                      : "text-sensor-offline"
                  }`}
                >
                  {sensor.status.toUpperCase()}
                </p>
                <p className="text-xs text-muted-foreground">{sensor.lastPing}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorMap;
