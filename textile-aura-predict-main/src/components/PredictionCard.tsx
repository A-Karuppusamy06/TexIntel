import { Brain, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import GlassCard from "./GlassCard";
import { cn } from "@/lib/utils";

interface PredictionCardProps {
  material: string;
  currentPrice: number;
  prediction7d: number;
  prediction15d: number;
  prediction30d: number;
  confidence: number;
}

const PredictionCard = ({
  material,
  currentPrice,
  prediction7d,
  prediction15d,
  prediction30d,
  confidence,
}: PredictionCardProps) => {
  const getPriceChange = (predicted: number) => {
    return ((predicted - currentPrice) / currentPrice) * 100;
  };

  const predictions = [
    { days: 7, price: prediction7d },
    { days: 15, price: prediction15d },
    { days: 30, price: prediction30d },
  ];

  return (
    <GlassCard glow className="relative">
      <div className="absolute top-0 right-0 m-4">
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/20 border border-secondary/30">
          <Sparkles className="h-3 w-3 text-secondary" />
          <span className="text-xs text-secondary font-medium">{confidence}% confidence</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">{material}</h3>
          <p className="text-sm text-muted-foreground">AI Price Forecast</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-1">Current Price</p>
        <p className="text-3xl font-bold text-foreground">₹{currentPrice.toFixed(2)}</p>
      </div>

      <div className="space-y-4">
        {predictions.map(({ days, price }) => {
          const change = getPriceChange(price);
          const isPositive = change > 0;

          return (
            <div
              key={days}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-white/5"
            >
              <span className="text-sm text-muted-foreground">{days} Day Forecast</span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-foreground">
                  ₹{price.toFixed(2)}
                </span>
                <div
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                    isPositive
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {change > 0 ? "+" : ""}
                  {change.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default PredictionCard;
