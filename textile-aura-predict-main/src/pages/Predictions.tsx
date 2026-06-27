import { useState } from "react";
import { Brain, Info, RefreshCw } from "lucide-react";
import PredictionCard from "@/components/PredictionCard";
import GlassCard from "@/components/GlassCard";
import DataLoadingState from "@/components/DataLoadingState";
import { Button } from "@/components/ui/button";
import { useDatasets } from "@/hooks/useDatasets";
import { toast } from "sonner";

const Predictions = () => {
  const { predictions, isLoading, error, lastUpdated, refresh } = useDatasets();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    toast.success("Predictions refreshed from latest dataset");
    setIsRefreshing(false);
  };

  if (isLoading || error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">AI Predictions</h1>
            <p className="text-muted-foreground">Machine learning powered price forecasts</p>
          </div>
        </div>
        <DataLoadingState isLoading={isLoading} error={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Predictions</h1>
          <p className="text-muted-foreground">Machine learning powered price forecasts</p>
        </div>
        <Button variant="neon" className="gap-2" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Predictions"}
        </Button>
      </div>

      {/* AI Info Card */}
      <GlassCard className="border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Powered by Advanced Machine Learning
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Our AI models analyze historical data from admin-uploaded datasets to generate accurate price predictions.
              Predictions are automatically updated when new datasets are processed.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">LSTM Neural Networks</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Ensemble Models</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-muted-foreground">Dataset-Driven Updates</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Predictions Grid */}
      {predictions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {predictions.map((prediction) => (
            <PredictionCard key={prediction.material} {...prediction} />
          ))}
        </div>
      ) : (
        <DataLoadingState
          isLoading={false}
          error="No predictions available. Please upload a dataset in the Admin panel."
          onRetry={refresh}
        />
      )}

      {/* Methodology Section */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Prediction Methodology</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-2">Data Sources</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Admin-uploaded price datasets</li>
              <li>• Historical price archives</li>
              <li>• Processed CSV data</li>
              <li>• Real-time database updates</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">Model Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Trend analysis</li>
              <li>• Volatility calculation</li>
              <li>• Moving averages</li>
              <li>• Confidence scoring</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">Update Frequency</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• On dataset upload</li>
              <li>• Manual refresh available</li>
              <li>• Real-time sync</li>
              <li>• Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : "N/A"}</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Predictions;
