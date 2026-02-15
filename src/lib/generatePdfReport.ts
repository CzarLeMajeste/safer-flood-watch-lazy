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
  heavyRainCount: number;
  moderateRainCount: number;
  dryCount: number;
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
    heavyRainCount: data.filter((r) => r.rainfall_intensity < 1500).length,
    moderateRainCount: data.filter((r) => r.rainfall_intensity >= 1500 && r.rainfall_intensity <= 3000).length,
    dryCount: data.filter((r) => r.rainfall_intensity > 3000).length,
  };
};

/* ── Mini chart helpers ── */

const drawLineChart = (
  doc: jsPDF,
  x: number, y: number, w: number, h: number,
  values: number[],
  label: string,
  unit: string,
  color: [number, number, number],
) => {
  if (!values.length) return;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 6;

  // Background
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(x, y, w, h, 3, 3, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(label, x + pad, y + 10);

  // Chart area
  const cx = x + pad + 6;
  const cy = y + 16;
  const cw = w - pad * 2 - 6;
  const ch = h - 28;

  // Y-axis labels
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(`${max.toFixed(1)}${unit}`, x + pad, cy + 3);
  doc.text(`${min.toFixed(1)}${unit}`, x + pad, cy + ch);

  // Grid lines
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  for (let i = 0; i <= 4; i++) {
    const gy = cy + (ch * i) / 4;
    doc.line(cx, gy, cx + cw, gy);
  }

  // Sample down if too many points
  const maxPts = 80;
  const sampled = values.length > maxPts
    ? Array.from({ length: maxPts }, (_, i) => values[Math.floor((i / maxPts) * values.length)])
    : values;

  // Draw line
  doc.setDrawColor(...color);
  doc.setLineWidth(0.6);
  const pts = sampled.map((v, i) => ({
    px: cx + (i / (sampled.length - 1 || 1)) * cw,
    py: cy + ch - ((v - min) / range) * ch,
  }));

  for (let i = 1; i < pts.length; i++) {
    doc.line(pts[i - 1].px, pts[i - 1].py, pts[i].px, pts[i].py);
  }

  // Area fill
  doc.setFillColor(color[0], color[1], color[2]);
  doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
  doc.moveTo(pts[0].px, cy + ch);
  for (const p of pts) doc.lineTo(p.px, p.py);
  doc.lineTo(pts[pts.length - 1].px, cy + ch);
  doc.fill();
  doc.setGState(new (doc as any).GState({ opacity: 1 }));
};

const drawPieChart = (
  doc: jsPDF,
  cx: number, cy: number, r: number,
  slices: { label: string; value: number; color: [number, number, number] }[],
  title: string,
) => {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (!total) return;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(title, cx - r, cy - r - 4);

  let startAngle = -Math.PI / 2;
  for (const sl of slices) {
    if (!sl.value) continue;
    const sweep = (sl.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sweep;

    // Draw filled arc using small line segments
    doc.setFillColor(...sl.color);
    const steps = Math.max(16, Math.ceil(sweep * 20));
    const pathX = [cx];
    const pathY = [cy];
    for (let i = 0; i <= steps; i++) {
      const a = startAngle + (sweep * i) / steps;
      pathX.push(cx + r * Math.cos(a));
      pathY.push(cy + r * Math.sin(a));
    }
    // Draw as triangle fan
    for (let i = 1; i < pathX.length - 1; i++) {
      doc.triangle(cx, cy, pathX[i], pathY[i], pathX[i + 1], pathY[i + 1], "F");
    }

    startAngle = endAngle;
  }

  // Legend
  let ly = cy + r + 8;
  doc.setFontSize(7);
  for (const sl of slices) {
    if (!sl.value) continue;
    doc.setFillColor(...sl.color);
    doc.rect(cx - r, ly, 3, 3, "F");
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    const pct = ((sl.value / total) * 100).toFixed(0);
    doc.text(`${sl.label}: ${sl.value} (${pct}%)`, cx - r + 5, ly + 2.5);
    ly += 5;
  }
};

/* ── Executive analysis text ── */

const buildAnalysis = (stats: Stats, from: Date, to: Date): string[] => {
  const lines: string[] = [];
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000));

  lines.push(
    `During the ${days}-day monitoring period (${format(from, "MMM dd")} – ${format(to, "MMM dd, yyyy")}), ` +
    `${stats.totalReadings} sensor readings were recorded.`
  );

  // Water level assessment
  if (stats.maxWaterLevel > 0) {
    const trend = stats.avgWaterLevel > (stats.maxWaterLevel * 0.6) ? "elevated" : "within acceptable range";
    lines.push(
      `Water levels averaged ${stats.avgWaterLevel.toFixed(1)} cm (range: ${stats.minWaterLevel.toFixed(1)}–${stats.maxWaterLevel.toFixed(1)} cm), ` +
      `which is ${trend}.`
    );
  }

  // Alert distribution
  const alertTotal = stats.normalCount + stats.warningCount + stats.criticalCount;
  if (alertTotal > 0) {
    const critPct = ((stats.criticalCount / alertTotal) * 100).toFixed(1);
    const warnPct = ((stats.warningCount / alertTotal) * 100).toFixed(1);
    if (stats.criticalCount > 0) {
      lines.push(
        `⚠ ${stats.criticalCount} critical/evacuation-level alerts (${critPct}%) were triggered during this period, ` +
        `requiring immediate community attention.`
      );
    }
    if (stats.warningCount > 0) {
      lines.push(
        `${stats.warningCount} warning-level alerts (${warnPct}%) were recorded, indicating periods of heightened risk.`
      );
    }
    if (stats.criticalCount === 0 && stats.warningCount === 0) {
      lines.push("All readings remained at normal status throughout the period — no alerts were triggered.");
    }
  }

  // Rainfall
  if (stats.heavyRainCount > 0) {
    lines.push(
      `Heavy rainfall was detected in ${stats.heavyRainCount} readings (${((stats.heavyRainCount / stats.totalReadings) * 100).toFixed(0)}%), ` +
      `which correlates with elevated water levels.`
    );
  }

  // Environmental
  if (stats.avgTemp > 0) {
    lines.push(
      `Environmental conditions: average temperature ${stats.avgTemp.toFixed(1)}°C ` +
      `(${stats.minTemp.toFixed(1)}–${stats.maxTemp.toFixed(1)}°C), ` +
      `average humidity ${stats.avgHumidity.toFixed(0)}%.`
    );
  }

  // Recommendation
  if (stats.criticalCount > 0) {
    lines.push(
      "Recommendation: Review evacuation preparedness and ensure early-warning communication channels are active."
    );
  } else if (stats.warningCount > 0) {
    lines.push(
      "Recommendation: Continue monitoring and verify drainage infrastructure is clear."
    );
  } else {
    lines.push(
      "Recommendation: Maintain routine monitoring schedule. System is operating normally."
    );
  }

  return lines;
};

/* ── Main export ── */

export const generatePdfReport = (data: SensorReading[], from: Date, to: Date) => {
  if (!data.length) return;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const stats = computeStats(data);
  const fromStr = format(from, "MMM dd, yyyy");
  const toStr = format(to, "MMM dd, yyyy");

  // ── Header ──
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 38, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(56, 189, 248);
  doc.text("Project SAFER", 14, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text("Executive Summary Report", 14, 23);
  doc.text(`Report Period: ${fromStr}  —  ${toStr}`, 14, 30);
  doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, 14, 35);

  // ── Key Metrics Row ──
  let y = 46;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text("Key Metrics", 14, y);
  y += 6;

  const metricRows = [
    ["Total Readings", String(stats.totalReadings)],
    ["Water Level (avg / min / max)", `${stats.avgWaterLevel.toFixed(1)} / ${stats.minWaterLevel.toFixed(1)} / ${stats.maxWaterLevel.toFixed(1)} cm`],
    ["Temperature (avg / min / max)", `${stats.avgTemp.toFixed(1)} / ${stats.minTemp.toFixed(1)} / ${stats.maxTemp.toFixed(1)} °C`],
    ["Avg Humidity", `${stats.avgHumidity.toFixed(1)} %`],
    ["Normal / Warning / Critical", `${stats.normalCount} / ${stats.warningCount} / ${stats.criticalCount}`],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: metricRows,
    theme: "grid",
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin: { left: 14, right: 14 },
    tableWidth: "auto",
  });

  y = (doc as any).lastAutoTable?.finalY ?? y + 40;
  y += 8;

  // ── Charts ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text("Trend Analysis", 14, y);
  y += 6;

  const chartW = (pageWidth - 14 * 2 - 6) / 2;
  const chartH = 50;

  // Water Level Chart
  drawLineChart(doc, 14, y, chartW, chartH,
    data.map((r) => r.water_level),
    "Water Level Trend", " cm", [14, 165, 233]);

  // Temperature Chart
  const tempData = data.filter((r) => r.temperature != null).map((r) => r.temperature!);
  drawLineChart(doc, 14 + chartW + 6, y, chartW, chartH,
    tempData, "Temperature Trend", "°C", [249, 115, 22]);

  y += chartH + 8;

  // Humidity chart
  const humData = data.filter((r) => r.humidity != null).map((r) => r.humidity!);
  drawLineChart(doc, 14, y, chartW, chartH,
    humData, "Humidity Trend", "%", [34, 197, 94]);

  // Pie charts – status distribution
  const pieR = 16;
  const pieCx = 14 + chartW + 6 + chartW / 2;
  const pieCy = y + chartH / 2 + 4;
  drawPieChart(doc, pieCx - 24, pieCy, pieR, [
    { label: "Normal", value: stats.normalCount, color: [34, 197, 94] },
    { label: "Warning", value: stats.warningCount, color: [234, 179, 8] },
    { label: "Critical", value: stats.criticalCount, color: [239, 68, 68] },
  ], "Alert Distribution");

  y += chartH + 12;

  // ── Executive Analysis ──
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text("Executive Analysis", 14, y);
  y += 6;

  doc.setFillColor(248, 250, 252);
  const analysisLines = buildAnalysis(stats, from, to);
  const analysisText = analysisLines.join("\n\n");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const splitLines = doc.splitTextToSize(analysisText, pageWidth - 28);
  const textBlockH = splitLines.length * 4.2 + 8;
  doc.roundedRect(14, y, pageWidth - 28, textBlockH, 2, 2, "F");
  doc.text(splitLines, 18, y + 6);

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

  doc.save(`SAFER-Executive-Report_${format(from, "yyyy-MM-dd")}_to_${format(to, "yyyy-MM-dd")}.pdf`);
};
