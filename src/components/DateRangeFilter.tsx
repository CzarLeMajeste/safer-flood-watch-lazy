import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { SensorReading } from "@/hooks/useSensorReadings";
import { generatePdfReport } from "@/lib/generatePdfReport";

const getRainLabel = (value: number): string => {
  if (value < 1500) return "Heavy Rain";
  if (value <= 3000) return "Moderate Rain";
  return "Dry / Light Drizzle";
};

const exportToCsv = (data: SensorReading[], from: Date, to: Date) => {
  if (!data.length) return;
  const header = "Date/Time,Water Level (cm),Rainfall Condition,Temperature (°C),Humidity (%),Battery Voltage,Status";
  const rows = data.map((r) =>
    [
      new Date(r.created_at).toLocaleString(),
      r.water_level,
      getRainLabel(r.rainfall_intensity),
      r.temperature ?? "",
      r.humidity ?? "",
      r.battery_voltage ?? "",
      r.status,
    ].join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sensor-data_${format(from, "yyyy-MM-dd")}_to_${format(to, "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

interface DateRangeFilterProps {
  from: Date;
  to: Date;
  onChange: (range: { from: Date; to: Date }) => void;
  data?: SensorReading[];
}

const DateRangeFilter = ({ from, to, onChange, data = [] }: DateRangeFilterProps) => {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const presets = [
    { label: "24h", days: 1 },
    { label: "7d", days: 7 },
    { label: "14d", days: 14 },
    { label: "30d", days: 30 },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Preset buttons */}
      {presets.map((p) => (
        <Button
          key={p.label}
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() =>
            onChange({
              from: new Date(Date.now() - p.days * 24 * 60 * 60 * 1000),
              to: new Date(),
            })
          }
        >
          {p.label}
        </Button>
      ))}

      <div className="h-4 w-px bg-border mx-1" />

      {/* From date */}
      <Popover open={fromOpen} onOpenChange={setFromOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("text-xs justify-start gap-1.5")}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {format(from, "MMM dd, yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={from}
            onSelect={(d) => {
              if (d) {
                onChange({ from: d, to });
                setFromOpen(false);
              }
            }}
            disabled={(date) => date > to || date > new Date()}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      <span className="text-xs text-muted-foreground">to</span>

      {/* To date */}
      <Popover open={toOpen} onOpenChange={setToOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("text-xs justify-start gap-1.5")}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {format(to, "MMM dd, yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={to}
            onSelect={(d) => {
              if (d) {
                onChange({ from, to: d });
                setToOpen(false);
              }
            }}
            disabled={(date) => date < from || date > new Date()}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      <div className="h-4 w-px bg-border mx-1" />

      <Button
        variant="outline"
        size="sm"
        className="text-xs gap-1.5"
        onClick={() => exportToCsv(data, from, to)}
        disabled={!data.length}
      >
        <Download className="h-3.5 w-3.5" />
        Export CSV
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="text-xs gap-1.5"
        onClick={() => generatePdfReport(data, from, to)}
        disabled={!data.length}
      >
        <FileText className="h-3.5 w-3.5" />
        PDF Report
      </Button>
    </div>
  );
};

export default DateRangeFilter;
