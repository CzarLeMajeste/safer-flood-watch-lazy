import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import type { SensorReading } from "@/hooks/useSensorReadings";

const getRainLabel = (value: number): string => {
  if (value < 1500) return "Heavy Rain";
  if (value <= 3000) return "Moderate Rain";
  return "Dry / Light Drizzle";
};

interface Stats {
  totalReadings: number;
  avgWaterLevel: number;
  maxWaterLevel: number;
  minWaterLevel: number;
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  avgHumidity: number;
  normalCount: number;
  warningCount: number;
  criticalCount: number;
}

const computeStats = (data: SensorReading[]): Stats => {
  const temps = data.filter((r) => r.temperature != null).map((r) => r.temperature!);
  const hums = data.filter((r) => r.humidity != null).map((r) => r.humidity!);
  const wls = data.map((r) => r.water_level);

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  return {
    totalReadings: data.length,
    avgWaterLevel: avg(wls),
    maxWaterLevel: wls.length ? Math.max(...wls) : 0,
    minWaterLevel: wls.length ? Math.min(...wls) : 0,
    avgTemp: avg(temps),
    maxTemp: temps.length ? Math.max(...temps) : 0,
    minTemp: temps.length ? Math.min(...temps) : 0,
    avgHumidity: avg(hums),
    normalCount: data.filter((r) => r.status.toUpperCase().includes("NORMAL")).length,
    warningCount: data.filter((r) => r.status.toUpperCase().includes("WARNING")).length,
    criticalCount: data.filter((r) => r.status.toUpperCase().includes("CRITICAL") || r.status.toUpperCase().includes("EVACUATION")).length,
  };
};

export const generatePdfReport = (data: SensorReading[], from: Date, to: Date) => {
  if (!data.length) return;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const stats = computeStats(data);
  const fromStr = format(from, "MMM dd, yyyy");
  const toStr = format(to, "MMM dd, yyyy");

  // ── Header ──
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 38, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(56, 189, 248); // cyan-400
  doc.text("Project SAFER", 14, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Community IoT Flood Warning System", 14, 23);
  doc.text(`Report Period: ${fromStr}  —  ${toStr}`, 14, 30);
  doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, 14, 35);

  // ── Summary Statistics ──
  let y = 46;
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Summary Statistics", 14, y);
  y += 8;

  const statRows = [
    ["Total Readings", String(stats.totalReadings)],
    ["Water Level (avg / min / max)", `${stats.avgWaterLevel.toFixed(1)} / ${stats.minWaterLevel.toFixed(1)} / ${stats.maxWaterLevel.toFixed(1)} cm`],
    ["Temperature (avg / min / max)", `${stats.avgTemp.toFixed(1)} / ${stats.minTemp.toFixed(1)} / ${stats.maxTemp.toFixed(1)} °C`],
    ["Avg Humidity", `${stats.avgHumidity.toFixed(1)} %`],
    ["Normal Readings", String(stats.normalCount)],
    ["Warning Readings", String(stats.warningCount)],
    ["Critical / Evacuation Readings", String(stats.criticalCount)],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: statRows,
    theme: "grid",
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin: { left: 14, right: 14 },
    tableWidth: "auto",
  });

  // ── Data Table ──
  const afterStatsY = (doc as any).lastAutoTable?.finalY ?? y + 60;
  const tableY = afterStatsY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text("Sensor Readings", 14, tableY);

  const tableData = data.map((r) => [
    format(new Date(r.created_at), "MM/dd HH:mm"),
    r.water_level.toFixed(1),
    getRainLabel(r.rainfall_intensity),
    r.temperature?.toFixed(1) ?? "—",
    r.humidity?.toFixed(0) ?? "—",
    r.battery_voltage?.toFixed(2) ?? "—",
    r.status,
  ]);

  autoTable(doc, {
    startY: tableY + 4,
    head: [["Date/Time", "Water (cm)", "Rainfall", "Temp (°C)", "Humid (%)", "Battery (V)", "Status"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 28 },
      6: { cellWidth: 30 },
    },
    margin: { left: 14, right: 14 },
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.column.index === 6) {
        const val = String(hookData.cell.raw).toUpperCase();
        if (val.includes("CRITICAL") || val.includes("EVACUATION")) {
          hookData.cell.styles.textColor = [220, 38, 38];
          hookData.cell.styles.fontStyle = "bold";
        } else if (val.includes("WARNING")) {
          hookData.cell.styles.textColor = [202, 138, 4];
          hookData.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  // ── Footer on every page ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("Project SAFER • Barangay San Miguel, Bulacan", 14, pageH - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageH - 8, { align: "right" });
  }

  doc.save(`SAFER-Report_${format(from, "yyyy-MM-dd")}_to_${format(to, "yyyy-MM-dd")}.pdf`);
};
