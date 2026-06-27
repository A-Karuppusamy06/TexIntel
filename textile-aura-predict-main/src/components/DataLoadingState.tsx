import { Loader2, AlertCircle, Database } from "lucide-react";
import GlassCard from "./GlassCard";
import { Button } from "./ui/button";

interface DataLoadingStateProps {
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const DataLoadingState = ({ isLoading, error, onRetry }: DataLoadingStateProps) => {
  if (isLoading) {
    return (
      <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Loading Market Data</h3>
        <p className="text-muted-foreground max-w-md">
          Fetching the latest textile price data from uploaded datasets...
        </p>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 rounded-full bg-destructive/10 border border-destructive/20 mb-6">
          {error.includes("No processed datasets") ? (
            <Database className="h-10 w-10 text-muted-foreground" />
          ) : (
            <AlertCircle className="h-10 w-10 text-destructive" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {error.includes("No processed datasets") ? "No Data Available" : "Error Loading Data"}
        </h3>
        <p className="text-muted-foreground max-w-md mb-6">{error}</p>
        {onRetry && (
          <Button variant="neon" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </GlassCard>
    );
  }

  return null;
};

export default DataLoadingState;
