import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Users, BarChart3 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

      <div className="relative z-10">
        <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Meta Ads Manager
            </h1>
            <Button onClick={() => navigate("/auth")} variant="glass">
              Get Started
            </Button>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto space-y-8 animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Manage Your Meta Ads
              <span className="block mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Like a Pro
              </span>
            </h2>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful dashboard to track campaigns, monitor performance, and
              optimize your advertising strategy across Meta platforms.
            </p>

            <div className="flex gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Start Managing Ads
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
              >
                Learn More
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 hover:shadow-glow-primary transition-all duration-300">
              <div className="p-3 rounded-lg bg-primary/20 w-fit mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Real-time Analytics
              </h3>
              <p className="text-sm text-muted-foreground">
                Track your campaign performance with live data and insights.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 hover:shadow-glow-primary transition-all duration-300">
              <div className="p-3 rounded-lg bg-accent/20 w-fit mb-4">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Campaign Management
              </h3>
              <p className="text-sm text-muted-foreground">
                Create, edit, and optimize campaigns from a single dashboard.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 hover:shadow-glow-primary transition-all duration-300">
              <div className="p-3 rounded-lg bg-primary/20 w-fit mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Work together with role-based access for managers and teams.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 hover:shadow-glow-primary transition-all duration-300">
              <div className="p-3 rounded-lg bg-accent/20 w-fit mb-4">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Advanced Reporting</h3>
              <p className="text-sm text-muted-foreground">
                Generate detailed reports with charts and performance metrics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
