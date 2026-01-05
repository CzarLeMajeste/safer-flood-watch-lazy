import { useState } from "react";
import { AlertTriangle, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BroadcastAlertPanelProps {
  userId: string;
}

const BroadcastAlertPanel = ({ userId }: BroadcastAlertPanelProps) => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleBroadcast = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message to broadcast.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    const { error } = await supabase.from("sms_queue").insert({
      message_body: message.trim(),
      status: "pending",
      triggered_by: userId,
    });

    setIsSending(false);

    if (error) {
      toast({
        title: "Broadcast Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Alert Queued!",
        description: "SMS alert has been queued for broadcast to all registered households.",
      });
      setMessage("");
    }
  };

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-lg text-destructive">Broadcast Alert Panel</CardTitle>
        </div>
        <CardDescription>
          Send emergency SMS alerts to all registered community members.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter your emergency message here... (e.g., 'EVACUATION NOTICE: Water levels critical. Please evacuate to designated areas immediately.')"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[100px] resize-none"
        />
        <Button
          onClick={handleBroadcast}
          disabled={isSending || !message.trim()}
          variant="destructive"
          className="w-full gap-2"
          size="lg"
        >
          <Send className="h-4 w-4" />
          {isSending ? "SENDING..." : "SEND TO ALL"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          This will queue the message for immediate SMS broadcast via ESP32 + SIM800L.
        </p>
      </CardContent>
    </Card>
  );
};

export default BroadcastAlertPanel;
