import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NewsCard from "@/components/NewsCard";
import GlassCard from "@/components/GlassCard";
import { marketNews } from "@/data/sampleData";
import { useState } from "react";
import { toast } from "sonner";

const categories = ["All", "Cotton", "Yarn", "Sustainability", "Technology", "Trade"];

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubscribe = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSubscribing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Successfully subscribed to the newsletter!");
    setEmail("");
    setIsSubscribing(false);
  };

  const filteredNews = marketNews.filter((news) => {
    const matchesCategory = selectedCategory === "All" || news.category === selectedCategory;
    const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Market News</h1>
        <p className="text-muted-foreground">Stay informed with the latest textile industry updates</p>
      </div>

      {/* Search and Filter */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "gradient" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Featured News */}
      {filteredNews.length > 0 && (
        <GlassCard className="relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-bl-lg">
            Featured
          </div>
          <div className="pt-4">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30">
              {filteredNews[0].category}
            </span>
            <h2 className="text-2xl font-bold text-foreground mt-4 mb-3">
              {filteredNews[0].title}
            </h2>
            <p className="text-muted-foreground mb-4">{filteredNews[0].summary}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{filteredNews[0].source}</span>
              <span className="text-sm text-muted-foreground">{filteredNews[0].date}</span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.slice(1).map((news) => (
          <NewsCard key={news.id} {...news} />
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No news found matching your criteria</p>
        </div>
      )}

      {/* Newsletter Signup */}
      <GlassCard className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">Stay Updated</h3>
        <p className="text-muted-foreground mb-6">
          Get daily market intelligence delivered to your inbox
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <Input 
            placeholder="Enter your email" 
            className="flex-1" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
          <Button variant="gradient" onClick={handleSubscribe} loading={isSubscribing}>
            {isSubscribing ? "Subscribing..." : "Subscribe"}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};

export default News;
