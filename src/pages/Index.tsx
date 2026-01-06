import { Droplets, CloudRain, Activity, Thermometer, Droplet } from "lucide-react";
import Header from "@/components/Header";
import AlertBanner from "@/components/AlertBanner";
import DataCard from "@/components/DataCard";
import WaterLevelChart from "@/components/WaterLevelChart";
import EnvironmentalChart from "@/components/EnvironmentalChart";
import HistoricalReportsTable from "@/components/HistoricalReportsTable";
import BroadcastAlertPanel from "@/components/BroadcastAlertPanel";
import SmsQueueHistory from "@/components/SmsQueueHistory";
import { useSensorReadings } from "@/hooks/useSensorReadings";
import { useAuth } from "@/hooks/useAuth";

const getStatusLevel = (status: string | undefined): "advisory" | "warning" | "evacuation" => {
  if (!status) return "advisory";
  const normalized = status.toLowerCase();
  if (normalized === "evacuation") return "evacuation";
  if (normalized === "warning") return "warning";
  return "advisory";
};

const getCardStatus = (status: string | undefined): "normal" | "warning" | "critical" | "humid" => {
  if (!status) return "normal";
  const normalized = status.toLowerCase();
  if (normalized === "evacuation") return "critical";
  if (normalized === "warning") return "warning";
  return "normal";
};

// Rain sensor interpretation (lower value = more wet)
const getRainStatus = (value: number | undefined): { label: string; status: "normal" | "warning" | "critical" } => {
  if (value === undefined) return { label: "--", status: "normal" };
  if (value < 1500) return { label: "Heavy Rain", status: "critical" };
  if (value <= 3000) return { label: "Moderate Rain", status: "warning" };
  return { label: "Dry / Light Drizzle", status: "normal" };
};

// Humidity status (>90% = high moisture)
const getHumidityStatus = (value: number | undefined): "normal" | "humid" => {
  if (value === undefined) return "normal";
  return value > 90 ? "humid" : "normal";
};

const getAlertMessage = (status: string | undefined, waterLevel: number | undefined): string => {
  if (!status) return "Awaiting sensor data...";
  const normalized = status.toLowerCase();
  if (normalized === "evacuation") {
    return `CRITICAL: Water level at ${waterLevel?.toFixed(1) ?? "N/A"}cm. Evacuate immediately!`;
  }
  if (normalized === "warning") {
    return `Warning: Water level at ${waterLevel?.toFixed(1) ?? "N/A"}cm. Monitor conditions closely.`;
  }
  return "All systems normal. Conditions are safe.";
};

const Index = () => {
  const { latestReading, historicalData, isLoading } = useSensorReadings();
  const { user, isAdmin, isLoading: authLoading } = useAuth();

  const status = latestReading?.status;
  const statusLevel = getStatusLevel(status);
  const cardStatus = getCardStatus(status);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Admin Broadcast Panel */}
        {isAdmin && user && (
          <section className="animate-fade-in space-y-4">
            <BroadcastAlertPanel userId={user.id} />
            <SmsQueueHistory />
          </section>
        )}

        {/* Alert Banner */}
        <section className="animate-fade-in">
          <AlertBanner
            level={statusLevel}
            message={getAlertMessage(status, latestReading?.water_level)}
            lastUpdated={
              latestReading
                ? new Date(latestReading.created_at).toLocaleString()
                : "No data yet"
            }
          />
        </section>

        {/* Real-Time Data Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <DataCard
              title="Water Level"
              value={latestReading?.water_level?.toFixed(1) ?? "--"}
              unit="cm"
              icon={Droplets}
              status={cardStatus}
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <DataCard
              title="Rainfall Condition"
              value={getRainStatus(latestReading?.rainfall_intensity).label}
              unit=""
              icon={CloudRain}
              status={getRainStatus(latestReading?.rainfall_intensity).status}
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <DataCard
              title="Temperature"
              value={latestReading?.temperature?.toFixed(1) ?? "--"}
              unit="°C"
              icon={Thermometer}
              status={latestReading?.temperature && latestReading.temperature > 35 ? "warning" : "normal"}
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <DataCard
              title="Humidity"
              value={latestReading?.humidity?.toFixed(0) ?? "--"}
              unit="%"
              icon={Droplet}
              status={getHumidityStatus(latestReading?.humidity)}
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <DataCard
              title="System Status"
              value={latestReading?.status ?? "Offline"}
              unit=""
              icon={Activity}
              status={cardStatus}
            />
          </div>
        </section>

        {/* Historical Chart */}
        <section className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <WaterLevelChart data={historicalData} isLoading={isLoading} />
        </section>

        {/* Environmental Conditions Chart */}
        <section className="animate-fade-in" style={{ animationDelay: "0.45s" }}>
          <EnvironmentalChart data={historicalData} isLoading={isLoading} />
        </section>

        {/* Historical Reports Table */}
        <section className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <HistoricalReportsTable readings={historicalData} isLoading={isLoading} />
        </section>

        {/* Footer */}
        <footer className="pt-4 pb-6 text-center text-xs text-muted-foreground border-t border-border/50">
          <p>
            Project SAFER • Powered by ESP32 IoT Nodes & SIM800L GSM • 
            <span className="text-primary"> Barangay San Miguel, Bulacan</span>
          </p>
          <p className="mt-1 opacity-75">
            Community-driven disaster preparedness through technology
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
