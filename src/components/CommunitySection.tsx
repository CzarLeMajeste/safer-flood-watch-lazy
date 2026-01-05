import { useState } from "react";
import { Users, Wrench, MessageCircle, Plus, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface LogEntry {
  id: string;
  type: "feedback" | "maintenance";
  user: string;
  message: string;
  timestamp: string;
}

const initialLogs: LogEntry[] = [
  {
    id: "1",
    type: "maintenance",
    user: "Juan Dela Cruz",
    message: "Cleaned solar panel on ESP32-001 at River Bridge. Battery now charging properly.",
    timestamp: "Today, 2:30 PM",
  },
  {
    id: "2",
    type: "feedback",
    user: "Maria Santos",
    message: "Water level reading seems accurate. Compared with manual measurement at the bridge.",
    timestamp: "Today, 10:15 AM",
  },
  {
    id: "3",
    type: "maintenance",
    user: "Pedro Reyes",
    message: "Replaced antenna on ESP32-003. Signal strength improved but still intermittent.",
    timestamp: "Yesterday, 4:45 PM",
  },
  {
    id: "4",
    type: "feedback",
    user: "Ana Garcia",
    message: "SMS alert received during last week's heavy rain. Very helpful for preparation!",
    timestamp: "3 days ago",
  },
];

const CommunitySection = () => {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("feedback");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!newMessage.trim()) return;

    const newLog: LogEntry = {
      id: Date.now().toString(),
      type: activeTab as "feedback" | "maintenance",
      user: "Community Member",
      message: newMessage,
      timestamp: "Just now",
    };

    setLogs([newLog, ...logs]);
    setNewMessage("");
    toast({
      title: "✓ Submitted",
      description: `Your ${activeTab === "feedback" ? "feedback" : "maintenance log"} has been recorded.`,
    });
  };

  const filteredLogs = logs.filter((log) => log.type === activeTab);

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Community Hub</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Help maintain our early warning system
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="feedback" className="gap-2 text-sm">
              <MessageCircle className="h-4 w-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="gap-2 text-sm">
              <Wrench className="h-4 w-4" />
              Maintenance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="mt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Share your feedback about the system accuracy, suggestions, or report issues..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-20 bg-secondary/30 border-border/50 resize-none"
                />
                <Button
                  onClick={handleSubmit}
                  size="sm"
                  className="w-full gap-2"
                  disabled={!newMessage.trim()}
                >
                  <Plus className="h-4 w-4" />
                  Submit Feedback
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="mt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Log sensor maintenance activities: cleaning, repairs, battery checks..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-20 bg-secondary/30 border-border/50 resize-none"
                />
                <Button
                  onClick={handleSubmit}
                  size="sm"
                  className="w-full gap-2"
                  disabled={!newMessage.trim()}
                >
                  <Plus className="h-4 w-4" />
                  Log Maintenance
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Logs */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Activity
          </h4>
          <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-dark pr-1">
            {filteredLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{log.user}</span>
                  <span className="text-xs text-muted-foreground">
                    {log.timestamp}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {log.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunitySection;
