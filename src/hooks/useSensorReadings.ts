import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SensorReading {
  id: number;
  created_at: string;
  water_level: number;
  rainfall_intensity: number;
  status: string;
  battery_voltage: number | null;
}

export const useSensorReadings = () => {
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [historicalData, setHistoricalData] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // Fetch latest reading
      const { data: latest, error: latestError } = await supabase
        .from("sensor_readings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestError) throw latestError;
      setLatestReading(latest);

      // Fetch last 24 hours of data
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data: historical, error: historicalError } = await supabase
        .from("sensor_readings")
        .select("*")
        .gte("created_at", twentyFourHoursAgo.toISOString())
        .order("created_at", { ascending: true });

      if (historicalError) throw historicalError;
      setHistoricalData(historical || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("sensor-readings-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sensor_readings",
        },
        (payload) => {
          const newReading = payload.new as SensorReading;
          setLatestReading(newReading);
          setHistoricalData((prev) => [...prev, newReading]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { latestReading, historicalData, isLoading, error, refetch: fetchData };
};
