import { Activity } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

const Logo = ({ size = "md" }: LogoProps) => {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Activity className={`${sizes[size]} text-primary`} />
        <div className="absolute inset-0 blur-lg bg-primary/30" />
      </div>
      <div className="flex flex-col">
        <span className={`${textSizes[size]} font-bold gradient-text`}>
          TextileAI
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
          Market Intelligence
        </span>
      </div>
    </div>
  );
};

export default Logo;
