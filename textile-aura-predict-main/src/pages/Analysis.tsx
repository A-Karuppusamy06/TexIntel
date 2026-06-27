import { useState } from "react";
import { Button } from "@/components/ui/button";
import PriceChart from "@/components/PriceChart";
import GlassCard from "@/components/GlassCard";
import DataLoadingState from "@/components/DataLoadingState";
import { useDatasets, calculateStats } from "@/hooks/useDatasets";
import { cn } from "@/lib/utils";

const timeframes = ["1M", "3M", "6M", "1Y", "ALL"];

const Analysis = () => {
  const { materials, isLoading, error, refresh } = useDatasets();
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("ALL");

  // Set default selected material once data is loaded
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId) || materials[0];

  // Filter data based on timeframe
  const getFilteredData = () => {
    if (!selectedMaterial) return [];
    
    const data = selectedMaterial.data;
    const now = data.length;
    
    switch (selectedTimeframe) {
      case "1M":
        return data.slice(Math.max(0, now - 1));
      case "3M":
        return data.slice(Math.max(0, now - 3));
      case "6M":
        return data.slice(Math.max(0, now - 6));
      case "1Y":
        return data.slice(Math.max(0, now - 12));
      default:
        return data;
    }
  };

  const filteredData = getFilteredData();
  const stats = calculateStats(filteredData);

  if (isLoading || error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Price Analysis</h1>
          <p className="text-muted-foreground">Deep dive into textile market trends and patterns</p>
        </div>
        <DataLoadingState isLoading={isLoading} error={error} onRetry={refresh} />
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Price Analysis</h1>
          <p className="text-muted-foreground">Deep dive into textile market trends and patterns</p>
        </div>
        <DataLoadingState 
          isLoading={false} 
          error="No materials data available. Please upload a dataset in the Admin panel." 
          onRetry={refresh} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Price Analysis</h1>
        <p className="text-muted-foreground">Deep dive into textile market trends and patterns</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <GlassCard className="flex-1 p-4">
          <p className="text-sm text-muted-foreground mb-3">Select Material</p>
          <div className="flex flex-wrap gap-2">
            {materials.map((material) => (
              <Button
                key={material.id}
                variant={selectedMaterial?.id === material.id ? "gradient" : "outline"}
                size="sm"
                onClick={() => setSelectedMaterialId(material.id)}
              >
                {material.label}
              </Button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="flex-1 p-4">
          <p className="text-sm text-muted-foreground mb-3">Timeframe</p>
          <div className="flex gap-2">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                variant={selectedTimeframe === tf ? "neon" : "ghost"}
                size="sm"
                onClick={() => setSelectedTimeframe(tf)}
              >
                {tf}
              </Button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Main Chart */}
      {selectedMaterial && (
        <PriceChart
          title={`${selectedMaterial.label} Price Analysis`}
          data={filteredData}
          color={selectedMaterial.color}
          showPrediction
        />
      )}

      {/* Stats Table */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-foreground mb-4">Statistical Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Metric</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Current</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Average</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">High</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Low</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 text-foreground">Price</td>
                <td className="py-3 px-4 text-right text-foreground font-medium">₹{stats.current.toFixed(2)}</td>
                <td className="py-3 px-4 text-right text-muted-foreground">₹{stats.average.toFixed(2)}</td>
                <td className="py-3 px-4 text-right text-green-500">₹{stats.high.toFixed(2)}</td>
                <td className="py-3 px-4 text-right text-red-500">₹{stats.low.toFixed(2)}</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 text-foreground">Data Points</td>
                <td className="py-3 px-4 text-right text-foreground font-medium">{filteredData.length}</td>
                <td className="py-3 px-4 text-right text-muted-foreground">—</td>
                <td className="py-3 px-4 text-right text-muted-foreground">—</td>
                <td className="py-3 px-4 text-right text-muted-foreground">—</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-foreground">Volatility (%)</td>
                <td className="py-3 px-4 text-right text-foreground font-medium">
                  {stats.average > 0 ? (((stats.high - stats.low) / stats.average) * 100).toFixed(1) : "0"}
                </td>
                <td className="py-3 px-4 text-right text-muted-foreground">—</td>
                <td className="py-3 px-4 text-right text-muted-foreground">—</td>
                <td className="py-3 px-4 text-right text-muted-foreground">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-foreground mb-4">Key Insights</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
              <p className="text-sm text-muted-foreground">
                {selectedMaterial && selectedMaterial.change >= 0
                  ? `Upward trend detected with ${Math.abs(selectedMaterial.change).toFixed(1)}% recent change`
                  : `Downward trend detected with ${Math.abs(selectedMaterial?.change || 0).toFixed(1)}% recent change`}
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <p className="text-sm text-muted-foreground">
                Price range: ${stats.low.toFixed(2)} - ${stats.high.toFixed(2)} over selected period
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-secondary mt-2" />
              <p className="text-sm text-muted-foreground">
                Analysis based on {filteredData.length} data points from uploaded datasets
              </p>
            </li>
          </ul>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-foreground mb-4">Market Signals</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Momentum</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      (selectedMaterial?.change || 0) >= 0 ? "bg-green-500" : "bg-red-500"
                    )} 
                    style={{ width: `${Math.min(100, Math.abs(selectedMaterial?.change || 0) * 10 + 50)}%` }}
                  />
                </div>
                <span className={cn(
                  "text-sm",
                  (selectedMaterial?.change || 0) >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {(selectedMaterial?.change || 0) >= 0 ? "Bullish" : "Bearish"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Trend</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${Math.min(100, 60 + Math.abs(selectedMaterial?.change || 0) * 5)}%` }}
                  />
                </div>
                <span className="text-sm text-primary">
                  {Math.abs(selectedMaterial?.change || 0) > 2 ? "Strong" : "Moderate"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Volatility</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full" 
                    style={{ 
                      width: `${stats.average > 0 ? Math.min(100, ((stats.high - stats.low) / stats.average) * 100) : 30}%` 
                    }}
                  />
                </div>
                <span className="text-sm text-yellow-500">
                  {stats.average > 0 && ((stats.high - stats.low) / stats.average) > 0.2 ? "High" : "Low"}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Analysis;
