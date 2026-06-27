import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import GlassCard from "./GlassCard";

interface DataPoint {
  date: string;
  price: number;
  predicted?: number;
}

interface PriceChartProps {
  title: string;
  data: DataPoint[];
  color?: string;
  showPrediction?: boolean;
}

const PriceChart = ({ title, data, color = "#00d4ff", showPrediction = false }: PriceChartProps) => {
  // Generate unique gradient IDs
  const gradientId = `gradient-${color.replace('#', '')}`;
  const predictionGradientId = 'gradient-prediction';

  return (
    <GlassCard className="h-[380px] group">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground tracking-tight">{title}</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ background: color, boxShadow: `0 0 8px ${color}40` }} 
            />
            <span className="text-muted-foreground font-medium">Actual</span>
          </div>
          {showPrediction && (
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full bg-secondary" 
                style={{ boxShadow: '0 0 8px hsl(265 89% 62% / 0.4)' }} 
              />
              <span className="text-muted-foreground font-medium">Predicted</span>
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="50%" stopColor={color} stopOpacity={0.1} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            {showPrediction && (
              <linearGradient id={predictionGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            )}
            {/* Glow filter for lines */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid 
            strokeDasharray="4 4" 
            stroke="hsl(228 25% 15% / 0.4)" 
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="hsl(228 25% 25%)"
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 11, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis
            stroke="hsl(228 25% 25%)"
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 11, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `₹${value}`}
            dx={-5}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(228 28% 8% / 0.95)",
              border: "1px solid hsl(228 25% 20%)",
              borderRadius: "12px",
              boxShadow: "0 8px 32px hsl(228 30% 2% / 0.6), 0 0 0 1px hsl(192 100% 50% / 0.1)",
              backdropFilter: "blur(12px)",
              padding: "12px 16px",
            }}
            labelStyle={{ color: "hsl(215 20% 65%)", fontSize: 12, marginBottom: 6 }}
            itemStyle={{ fontSize: 13, fontWeight: 600, padding: "2px 0" }}
            formatter={(value: number, name: string) => [
              `₹${value.toFixed(2)}`, 
              name === "price" ? "Actual" : "Predicted"
            ]}
            cursor={{ stroke: 'hsl(192 100% 50% / 0.2)', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            name="price"
            animationDuration={1500}
            animationEasing="ease-out"
            dot={false}
            activeDot={{ 
              r: 5, 
              fill: color, 
              stroke: 'hsl(228 28% 6%)', 
              strokeWidth: 2,
              filter: 'url(#glow)'
            }}
          />
          {showPrediction && (
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="6 4"
              fill={`url(#${predictionGradientId})`}
              name="predicted"
              animationDuration={1800}
              animationEasing="ease-out"
              dot={false}
              activeDot={{ 
                r: 4, 
                fill: '#8b5cf6', 
                stroke: 'hsl(228 28% 6%)', 
                strokeWidth: 2 
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
};

export default PriceChart;
