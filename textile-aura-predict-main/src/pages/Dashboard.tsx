import { Layers, TrendingUp, Sparkles, BarChart3, Activity, Database } from "lucide-react";
import StatCard from "@/components/StatCard";
import PriceChart from "@/components/PriceChart";
import DataLoadingState from "@/components/DataLoadingState";
import GlassCard from "@/components/GlassCard";
import { useDatasets } from "@/hooks/useDatasets";
import { formatDistanceToNow } from "date-fns";

const ICONS = [Layers, TrendingUp, BarChart3, Sparkles];

const Dashboard = () => {
  const { materials, isLoading, error, lastUpdated, refresh } = useDatasets();

  if (isLoading || error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="relative">
          <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-primary via-secondary to-transparent rounded-full" />
          <div className="pl-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
              Market Dashboard
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Real-time textile market intelligence and analytics
            </p>
          </div>
        </div>
        <DataLoadingState isLoading={isLoading} error={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with gradient accent */}
      <div className="relative">
        <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-primary via-secondary to-transparent rounded-full" />
        <div className="pl-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
            Market Dashboard
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Real-time textile market intelligence and analytics
          </p>
        </div>
      </div>

      {/* Stats Grid with staggered animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {materials.slice(0, 4).map((material, index) => (
          <div key={material.id} className={`animate-slide-up stagger-${index + 1}`}>
            <StatCard
              title={`${material.label} Price`}
              value={`₹${material.currentPrice.toFixed(2)}`}
              change={material.change}
              icon={ICONS[index % ICONS.length]}
              unit={material.unit}
            />
          </div>
        ))}
        {materials.length === 0 && (
          <div className="col-span-full">
            <GlassCard className="p-8 text-center">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No material data available</p>
            </GlassCard>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      {materials.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {materials.slice(0, 2).map((material) => (
              <PriceChart
                key={material.id}
                title={`${material.label} Price Trend (${material.unit})`}
                data={material.data}
                color={material.color}
                showPrediction
              />
            ))}
          </div>

          {materials.length > 2 && (
            <div className="grid grid-cols-1 gap-6">
              <PriceChart
                title={`${materials[2].label} Price Trend (${materials[2].unit})`}
                data={materials[2].data}
                color={materials[2].color}
                showPrediction
              />
            </div>
          )}
        </>
      )}

      {/* Market Summary with enhanced styling */}
      <GlassCard className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground tracking-tight">Market Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="group p-5 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/50 hover:border-primary/30 transition-all duration-500">
            <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Materials Tracked</p>
            <p className="text-3xl font-bold text-foreground tracking-tight">{materials.length}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-sm font-medium text-emerald-400">Active monitoring</p>
            </div>
          </div>
          <div className="group p-5 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/50 hover:border-primary/30 transition-all duration-500">
            <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Data Points</p>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {materials.reduce((acc, m) => acc + m.data.length, 0)}
            </p>
            <div className="flex items-center gap-1.5 mt-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="text-sm font-medium text-muted-foreground">From uploaded datasets</p>
            </div>
          </div>
          <div className="group p-5 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/50 hover:border-primary/30 transition-all duration-500">
            <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Last Updated</p>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {lastUpdated ? formatDistanceToNow(lastUpdated, { addSuffix: true }) : "N/A"}
            </p>
            <div className="flex items-center gap-1.5 mt-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-sm font-medium text-primary">Dataset processing</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Dashboard;
