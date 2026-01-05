import { Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Project <span className="text-primary">SAFER</span>
              <span className="hidden md:inline text-muted-foreground font-normal">
                : Community IoT Flood Warning
              </span>
            </h1>
            <p className="text-xs text-muted-foreground sm:hidden">
              Community IoT Flood Warning
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-sensor-online/10 border border-sensor-online/30">
            <span className="w-2 h-2 rounded-full bg-sensor-online animate-pulse" />
            <span className="text-xs font-medium text-sensor-online">System Online</span>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
