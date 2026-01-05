import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { SensorReading } from "@/hooks/useSensorReadings";

interface HistoricalReportsTableProps {
  readings: SensorReading[];
  isLoading: boolean;
}

const getStatusBadgeVariant = (status: string) => {
  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus === "evacuation") return "destructive";
  if (normalizedStatus === "warning") return "warning";
  return "success";
};

const HistoricalReportsTable = ({ readings, isLoading }: HistoricalReportsTableProps) => {
  const sortedReadings = [...readings].reverse();

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Historical Reports</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 md:h-80 rounded-md border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="sticky top-0 bg-card">Time</TableHead>
                <TableHead className="sticky top-0 bg-card">Water Level</TableHead>
                <TableHead className="sticky top-0 bg-card">Rainfall</TableHead>
                <TableHead className="sticky top-0 bg-card">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : sortedReadings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No sensor readings yet
                  </TableCell>
                </TableRow>
              ) : (
                sortedReadings.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(reading.created_at), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell className="font-mono">
                      {reading.water_level.toFixed(1)} cm
                    </TableCell>
                    <TableCell className="font-mono">
                      {reading.rainfall_intensity} mm/hr
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(reading.status)}>
                        {reading.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default HistoricalReportsTable;
