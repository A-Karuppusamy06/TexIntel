import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "card" | "text" | "chart" | "stat";
}

const LoadingSkeleton = ({ className, variant = "card" }: LoadingSkeletonProps) => {
  if (variant === "stat") {
    return (
      <div className={cn("glass-card p-6 animate-pulse", className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 w-24 bg-muted/60 rounded shimmer" />
            <div className="h-10 w-32 bg-muted/60 rounded shimmer" />
            <div className="h-4 w-36 bg-muted/60 rounded shimmer" />
          </div>
          <div className="h-14 w-14 bg-muted/60 rounded-2xl shimmer" />
        </div>
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div className={cn("glass-card p-6 h-[380px] animate-pulse", className)}>
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-48 bg-muted/60 rounded shimmer" />
          <div className="flex gap-4">
            <div className="h-4 w-16 bg-muted/60 rounded shimmer" />
            <div className="h-4 w-16 bg-muted/60 rounded shimmer" />
          </div>
        </div>
        <div className="flex-1 flex items-end gap-2 h-[280px]">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-muted/40 rounded-t shimmer"
              style={{ height: `${Math.random() * 60 + 20}%`, animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div className={cn("space-y-2 animate-pulse", className)}>
        <div className="h-4 w-full bg-muted/60 rounded shimmer" />
        <div className="h-4 w-4/5 bg-muted/60 rounded shimmer" />
        <div className="h-4 w-3/5 bg-muted/60 rounded shimmer" />
      </div>
    );
  }

  return (
    <div className={cn("glass-card p-6 animate-pulse", className)}>
      <div className="space-y-4">
        <div className="h-6 w-1/3 bg-muted/60 rounded shimmer" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted/60 rounded shimmer" />
          <div className="h-4 w-4/5 bg-muted/60 rounded shimmer" />
          <div className="h-4 w-3/5 bg-muted/60 rounded shimmer" />
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
