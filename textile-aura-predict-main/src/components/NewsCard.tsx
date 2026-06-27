import { ExternalLink, Clock } from "lucide-react";
import GlassCard from "./GlassCard";

interface NewsCardProps {
  title: string;
  summary: string;
  source: string;
  date: string;
  category: string;
  imageUrl?: string;
}

const NewsCard = ({ title, summary, source, date, category }: NewsCardProps) => {
  return (
    <GlassCard className="group cursor-pointer">
      <div className="flex items-start justify-between gap-4 mb-3">
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30">
          {category}
        </span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {date}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{summary}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{source}</span>
        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </GlassCard>
  );
};

export default NewsCard;
