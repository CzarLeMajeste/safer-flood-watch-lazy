import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DataCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  status?: "normal" | "warning" | "critical" | "humid";
}

const statusColors = {
  normal: "text-alert-safe",
  warning: "text-alert-warning",
  critical: "text-alert-danger",
  humid: "text-blue-500",
};

const statusBgColors = {
  normal: "border-alert-safe/30 bg-alert-safe/5",
  warning: "border-alert-warning/30 bg-alert-warning/5",
  critical: "border-alert-danger/30 bg-alert-danger/5 animate-pulse",
  humid: "border-blue-500/30 bg-blue-500/5",
};

const DataCard = ({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  status = "normal",
}: DataCardProps) => {
  return (
    <Card className={`data-card backdrop-blur-sm hover:border-primary/30 transition-all duration-300 ${statusBgColors[status]}`}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                trend === "up"
                  ? "text-alert-danger"
                  : trend === "down"
                  ? "text-alert-safe"
                  : "text-muted-foreground"
              }`}
            >
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {trend === "stable" && "→"}
              {trendValue}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className={`mono-data text-3xl md:text-4xl font-bold ${statusColors[status]}`}>
              {value}
            </span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataCard;
