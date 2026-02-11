import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangeFilterProps {
  from: Date;
  to: Date;
  onChange: (range: { from: Date; to: Date }) => void;
}

const DateRangeFilter = ({ from, to, onChange }: DateRangeFilterProps) => {
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
    </div>
  );
};

export default DateRangeFilter;
