import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import GlassCard from "./GlassCard";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  unit?: string;
}

const StatCard = ({ title, value, change, icon: Icon, unit = "" }: StatCardProps) => {
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <GlassCard className="relative overflow-hidden group stat-card-glow">
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <p className="text-4xl font-bold text-foreground tracking-tight">
              {value}
            </p>
            {unit && (
              <span className="text-base font-medium text-muted-foreground">{unit}</span>
            )}
          </div>
          <div className={cn(
            "flex items-center gap-1.5 text-sm font-medium",
            isPositive ? "text-emerald-400" : isNeutral ? "text-muted-foreground" : "text-rose-400"
          )}>
            <div className={cn(
              "flex items-center justify-center w-5 h-5 rounded-full",
              isPositive ? "bg-emerald-400/15" : isNeutral ? "bg-muted/50" : "bg-rose-400/15"
            )}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : isNeutral ? (
                <Minus className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
            </div>
            <span>{Math.abs(change).toFixed(1)}% from last week</span>
          </div>
        </div>
        <div className={cn(
          "p-3.5 rounded-2xl transition-all duration-500",
          "bg-gradient-to-br from-primary/15 to-primary/5",
          "border border-primary/20 group-hover:border-primary/40",
          "group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
        )}>
          <Icon className="h-6 w-6 text-primary transition-transform duration-500 group-hover:scale-110" />
        </div>
      </div>
      
      {/* Animated gradient bar */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-500",
        "opacity-60 group-hover:opacity-100 group-hover:h-1",
        isPositive ? "bg-gradient-to-r from-emerald-500/80 via-emerald-400 to-emerald-500/80" :
        isNeutral ? "bg-gradient-to-r from-muted/50 via-muted to-muted/50" :
        "bg-gradient-to-r from-rose-500/80 via-rose-400 to-rose-500/80"
      )} />

      {/* Subtle background glow on hover */}
      <div className={cn(
        "absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-2xl",
        isPositive ? "bg-emerald-500/5" : isNeutral ? "bg-muted/10" : "bg-rose-500/5"
      )} />
    </GlassCard>
  );
};

export default StatCard;
