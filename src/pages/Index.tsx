import { Droplets, CloudRain, Thermometer } from "lucide-react";
import Header from "@/components/Header";
import AlertBanner from "@/components/AlertBanner";
import DataCard from "@/components/DataCard";
import SensorMap from "@/components/SensorMap";
import WaterLevelChart from "@/components/WaterLevelChart";
import ControlPanel from "@/components/ControlPanel";
import CommunitySection from "@/components/CommunitySection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Alert Banner */}
        <section className="animate-fade-in">
          <AlertBanner
            level="warning"
            message="Water level approaching critical threshold. Monitor conditions closely."
            lastUpdated="Jan 5, 2026 - 3:42 PM"
          />
        </section>

        {/* Real-Time Data Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ animationDelay: "0.1s" }}>
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <DataCard
              title="Water Level"
              value={98}
              unit="cm"
              icon={Droplets}
              trend="up"
              trendValue="+12cm/hr"
              status="warning"
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <DataCard
              title="Rainfall Intensity"
              value={23.5}
              unit="mm/hr"
              icon={CloudRain}
              trend="stable"
              trendValue="steady"
              status="normal"
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <DataCard
              title="Temperature"
              value={27}
              unit="°C"
              icon={Thermometer}
              trend="down"
              trendValue="-2°C"
              status="normal"
            />
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Chart - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <WaterLevelChart />
          </div>
          
          {/* Sensor Map */}
          <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <SensorMap />
          </div>
        </section>

        {/* Control Panel & Community Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <ControlPanel />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.7s" }}>
            <CommunitySection />
          </div>
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
