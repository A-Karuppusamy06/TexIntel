import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PriceDataPoint {
  date: string;
  price: number;
  predicted?: number;
}

export interface MaterialData {
  id: string;
  label: string;
  data: PriceDataPoint[];
  color: string;
  unit: string;
  currentPrice: number;
  change: number;
}

export interface PredictionData {
  material: string;
  currentPrice: number;
  prediction7d: number;
  prediction15d: number;
  prediction30d: number;
  confidence: number;
}

interface DatasetRow {
  date: string;
  material: string;
  price: string;
  predicted?: string;
  [key: string]: string | undefined;
}

const MATERIAL_CONFIG: Record<string, { color: string; unit: string }> = {
  cotton: { color: "#00d4ff", unit: "tone's" },
  yarn: { color: "#8b5cf6", unit: "/kg" },
  fabric: { color: "#22c55e", unit: "/m" },
  silk: { color: "#f59e0b", unit: "/kg" },
  polyester: { color: "#ec4899", unit: "/kg" },
};

// Parse CSV content into structured data
function parseCSV(content: string): DatasetRow[] {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: DatasetRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: DatasetRow = { date: "", material: "", price: "" };

    headers.forEach((header, idx) => {
      row[header] = values[idx] || "";
    });

    if (row.date && row.material && row.price) {
      rows.push(row);
    }
  }

  return rows;
}

// Transform parsed data into material-specific chart data
function transformToMaterialData(rows: DatasetRow[]): MaterialData[] {
  const materialMap = new Map<string, PriceDataPoint[]>();

  rows.forEach((row) => {
    const material = row.material.toLowerCase();
    const price = parseFloat(row.price);
    const predicted = row.predicted ? parseFloat(row.predicted) : undefined;

    if (isNaN(price)) return;

    if (!materialMap.has(material)) {
      materialMap.set(material, []);
    }

    materialMap.get(material)!.push({
      date: row.date,
      price,
      predicted: predicted && !isNaN(predicted) ? predicted : undefined,
    });
  });

  const materials: MaterialData[] = [];

  materialMap.forEach((data, material) => {
    const config = MATERIAL_CONFIG[material] || { color: "#00d4ff", unit: "" };
    const sortedData = data.sort((a, b) => a.date.localeCompare(b.date));
    const currentPrice = sortedData[sortedData.length - 1]?.price || 0;
    const previousPrice = sortedData[sortedData.length - 2]?.price || currentPrice;
    const change = previousPrice > 0 ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;

    materials.push({
      id: material,
      label: material.charAt(0).toUpperCase() + material.slice(1),
      data: sortedData,
      color: config.color,
      unit: config.unit,
      currentPrice,
      change,
    });
  });

  return materials;
}

// Generate AI predictions based on historical data
function generatePredictions(materials: MaterialData[]): PredictionData[] {
  return materials.map((material) => {
    const currentPrice = material.currentPrice;
    const data = material.data;

    // Calculate average trend
    let avgTrend = 0;
    if (data.length >= 2) {
      const recentData = data.slice(-6);
      for (let i = 1; i < recentData.length; i++) {
        avgTrend += (recentData[i].price - recentData[i - 1].price) / recentData[i - 1].price;
      }
      avgTrend /= recentData.length - 1;
    }

    // Project future prices with volatility
    const volatility = 0.02;
    const prediction7d = currentPrice * (1 + avgTrend * 0.25 + volatility * Math.random());
    const prediction15d = currentPrice * (1 + avgTrend * 0.5 + volatility * 1.5 * Math.random());
    const prediction30d = currentPrice * (1 + avgTrend + volatility * 2 * Math.random());

    // Calculate confidence based on data consistency
    const variance = data.length > 5 ? 
      data.slice(-5).reduce((acc, d, i, arr) => {
        if (i === 0) return 0;
        return acc + Math.abs(d.price - arr[i-1].price) / arr[i-1].price;
      }, 0) / 4 : 0.1;
    
    const confidence = Math.max(60, Math.min(95, Math.round(85 - variance * 100)));

    return {
      material: material.label,
      currentPrice: Math.round(currentPrice * 100) / 100,
      prediction7d: Math.round(prediction7d * 100) / 100,
      prediction15d: Math.round(prediction15d * 100) / 100,
      prediction30d: Math.round(prediction30d * 100) / 100,
      confidence,
    };
  });
}

// Calculate statistics for a dataset
export function calculateStats(data: PriceDataPoint[]) {
  if (data.length === 0) {
    return { current: 0, average: 0, high: 0, low: 0 };
  }

  const prices = data.map((d) => d.price);
  const current = prices[prices.length - 1];
  const average = prices.reduce((a, b) => a + b, 0) / prices.length;
  const high = Math.max(...prices);
  const low = Math.min(...prices);

  return {
    current: Math.round(current * 100) / 100,
    average: Math.round(average * 100) / 100,
    high: Math.round(high * 100) / 100,
    low: Math.round(low * 100) / 100,
  };
}

export function useDatasets() {
  const [materials, setMaterials] = useState<MaterialData[]>([]);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDatasets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch the latest processed price dataset (preferred)
      let { data: datasets, error: dbError } = await supabase
        .from("datasets")
        .select("*")
        .eq("type", "price")
        .eq("status", "completed")
        .order("processed_at", { ascending: false })
        .limit(1);

      // If no completed dataset exists (e.g. status may still be pending/processing),
      // fall back to the latest dataset record so UI can at least show something.
      if ((!datasets || datasets.length === 0) && !dbError) {
        const fallback = await supabase
          .from("datasets")
          .select("*")
          .eq("type", "price")
          .in("status", ["completed", "processing", "pending"])
          .order("created_at", { ascending: false })
          .limit(1);

        datasets = fallback.data;
        dbError = fallback.error;
      }

      if (dbError) {
        console.error("Database error:", dbError);
        setError("Failed to fetch dataset information");
        setIsLoading(false);
        return;
      }

      if (!datasets || datasets.length === 0) {
        setMaterials([]);
        setPredictions([]);
        setError("No processed datasets available. Please upload a dataset in the Admin panel.");
        setIsLoading(false);
        return;
      }

      const latestDataset = datasets[0];
      
      // Download the file content from storage
      const { data: fileData, error: storageError } = await supabase.storage
        .from("datasets")
        .download(latestDataset.file_path);

      if (storageError) {
        console.error("Storage error:", storageError);
        setError("Failed to download dataset file");
        setIsLoading(false);
        return;
      }

      const content = await fileData.text();
      const rows = parseCSV(content);

      if (rows.length === 0) {
        setError("Dataset is empty or has invalid format");
        setIsLoading(false);
        return;
      }

      const materialData = transformToMaterialData(rows);
      const predictionData = generatePredictions(materialData);

      setMaterials(materialData);
      setPredictions(predictionData);
      setLastUpdated(new Date(latestDataset.processed_at || latestDataset.created_at));
      setError(null);
    } catch (err) {
      console.error("Error fetching datasets:", err);
      setError("An unexpected error occurred while loading data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  // Subscribe to realtime updates for datasets table
  useEffect(() => {
    const channel = supabase
      .channel("datasets-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "datasets",
        },
        (payload) => {
          console.log("Dataset changed:", payload);
          // Refetch when a dataset is processed
          if (payload.new && (payload.new as { status: string }).status === "processed") {
            fetchDatasets();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDatasets]);

  const refresh = useCallback(async () => {
    await fetchDatasets();
  }, [fetchDatasets]);

  return {
    materials,
    predictions,
    isLoading,
    error,
    lastUpdated,
    refresh,
  };
}
