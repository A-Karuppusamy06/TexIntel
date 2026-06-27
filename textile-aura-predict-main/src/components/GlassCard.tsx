import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties, useRef, MouseEvent } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  style?: CSSProperties;
}

const GlassCard = ({ children, className, hover = true, glow = false, style }: GlassCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty('--mouse-x', `${x}%`);
    cardRef.current.style.setProperty('--mouse-y', `${y}%`);
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "glass-card p-6 transition-all duration-500",
        hover && "hover-glow",
        glow && "pulse-glow animate-glow-pulse",
        className
      )}
      style={style}
      onMouseMove={handleMouseMove}
    >
      {children}
    </div>
  );
};

export default GlassCard;
