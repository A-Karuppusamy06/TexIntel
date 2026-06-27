import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import ParticleBackground from "@/components/ParticleBackground";
import { ArrowRight, BarChart3, Brain, Globe, TrendingUp } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Live market data from global textile exchanges",
  },
  {
    icon: Brain,
    title: "AI Predictions",
    description: "ML-powered price forecasts with 86%+ accuracy",
  },
  {
    icon: TrendingUp,
    title: "Trend Analysis",
    description: "Deep insights into market patterns and signals",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Track 47+ markets across all continents",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState<string | null>(null);

  const handleNavigate = async (path: string, buttonId: string) => {
    setIsNavigating(buttonId);
    // Small delay for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 200));
    navigate(path);
    setIsNavigating(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />

      {/* Background gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[150px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6 lg:p-8">
        <Logo size="md" />
        <Button 
          variant="neon" 
          onClick={() => handleNavigate("/auth", "signin")}
          loading={isNavigating === "signin"}
        >
          {isNavigating !== "signin" && "Sign In"}
        </Button>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20 lg:py-32">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary/30 mb-8">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-muted-foreground">Live market data</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            AI-Powered
            <br />
            <span className="gradient-text">Textile Intelligence</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Transform your textile trading with real-time market analytics, 
            AI-driven price predictions, and comprehensive trend analysis.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="gradient" 
              size="xl" 
              onClick={() => handleNavigate("/auth", "getstarted")} 
              className="gap-2"
              loading={isNavigating === "getstarted"}
            >
              {isNavigating !== "getstarted" && (
                <>
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
            <Button 
              variant="glass" 
              size="xl" 
              onClick={() => handleNavigate("/dashboard", "demo")}
              loading={isNavigating === "demo"}
            >
              {isNavigating !== "demo" && "View Demo"}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-12 mt-20 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="text-center">
            <p className="text-3xl lg:text-4xl font-bold gradient-text">₹284B</p>
            <p className="text-sm text-muted-foreground mt-1">Market Tracked</p>
          </div>
          <div className="text-center">
            <p className="text-3xl lg:text-4xl font-bold gradient-text">86%</p>
            <p className="text-sm text-muted-foreground mt-1">Prediction Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-3xl lg:text-4xl font-bold gradient-text">47+</p>
            <p className="text-sm text-muted-foreground mt-1">Global Markets</p>
          </div>
          <div className="text-center">
            <p className="text-3xl lg:text-4xl font-bold gradient-text">2.8K</p>
            <p className="text-sm text-muted-foreground mt-1">Active Users</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Comprehensive tools for textile market intelligence and decision making
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-6 hover-glow animate-slide-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto glass-card p-8 lg:p-12 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of textile professionals using AI-powered insights to make better decisions.
          </p>
          <Button 
            variant="gradient" 
            size="xl" 
            onClick={() => handleNavigate("/auth", "trial")} 
            className="gap-2"
            loading={isNavigating === "trial"}
          >
            {isNavigating !== "trial" && (
              <>
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 p-6 lg:p-8 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            © 2025 TextileAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
