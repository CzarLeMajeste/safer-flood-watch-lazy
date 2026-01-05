import { useState } from "react";
import { Bell, MessageSquare, AlertTriangle, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const ControlPanel = () => {
  const [sirenActive, setSirenActive] = useState(false);
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const [sirenDialogOpen, setSirenDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSirenActivate = () => {
    setSirenActive(true);
    setSirenDialogOpen(false);
    toast({
      title: "🚨 Siren Activated",
      description: "Emergency siren has been triggered. Community alerted.",
    });
    // Auto deactivate after 30 seconds for demo
    setTimeout(() => setSirenActive(false), 30000);
  };

  const handleSendSMS = () => {
    setSmsDialogOpen(false);
    toast({
      title: "📱 SMS Sent",
      description: "Emergency alert sent to 247 registered households via GSM module.",
    });
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">
            Official Control Panel
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Authorized Barangay Officials Only
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Siren Control */}
        <Dialog open={sirenDialogOpen} onOpenChange={setSirenDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant={sirenActive ? "destructive" : "outline"}
              className={`w-full h-14 text-base font-semibold gap-3 ${
                sirenActive
                  ? "animate-pulse"
                  : "border-alert-danger/50 text-alert-danger hover:bg-alert-danger hover:text-alert-danger-foreground"
              }`}
            >
              <Bell className={`h-5 w-5 ${sirenActive ? "animate-bounce" : ""}`} />
              {sirenActive ? "SIREN ACTIVE - Click to Stop" : "Activate Emergency Siren"}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-alert-danger">
                <AlertTriangle className="h-5 w-5" />
                Confirm Siren Activation
              </DialogTitle>
              <DialogDescription>
                This will activate the community emergency siren connected to the
                ESP32 node. The siren will alert all residents within hearing range.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setSirenDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleSirenActivate}>
                Activate Siren
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* SMS Alert */}
        <Dialog open={smsDialogOpen} onOpenChange={setSmsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-14 text-base font-semibold gap-3 border-alert-warning/50 text-alert-warning hover:bg-alert-warning hover:text-alert-warning-foreground"
            >
              <MessageSquare className="h-5 w-5" />
              Send Emergency SMS
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-alert-warning">
                <MessageSquare className="h-5 w-5" />
                Send Mass SMS Alert
              </DialogTitle>
              <DialogDescription>
                This will send an emergency SMS to all 247 registered households
                via the SIM800L GSM module. Message will include current water
                level and evacuation instructions.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 rounded-lg bg-secondary/50 text-sm">
              <p className="font-medium mb-2">Preview Message:</p>
              <p className="text-muted-foreground">
                "🚨 FLOOD ALERT - Brgy. San Miguel: Water level at 98cm (CRITICAL).
                Proceed to evacuation center at Brgy. Hall immediately. - SAFER System"
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setSmsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-alert-warning text-alert-warning-foreground hover:bg-alert-warning/90"
                onClick={handleSendSMS}
              >
                Send to All Households
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-secondary/30 text-center">
            <p className="mono-data text-2xl font-bold text-foreground">247</p>
            <p className="text-xs text-muted-foreground">Registered Households</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30 text-center">
            <p className="mono-data text-2xl font-bold text-sensor-online">3</p>
            <p className="text-xs text-muted-foreground">Active Sensors</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
