import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, Target, Settings, LogOut, Home } from "lucide-react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-card/80 border-b md:border-r border-border/50 backdrop-blur-xl">
        <div className="p-6 border-b border-border/40">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Meta Ads Manager
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard">
            <Button variant="ghost" className="w-full justify-start">
              <Home className="h-4 w-4 mr-2" /> Dashboard
            </Button>
          </Link>
          <Link to="/accounts">
            <Button variant="ghost" className="w-full justify-start">
              <BarChart3 className="h-4 w-4 mr-2" /> Ad Accounts
            </Button>
          </Link>
          <Link to="/campaigns">
            <Button variant="ghost" className="w-full justify-start">
              <Target className="h-4 w-4 mr-2" /> Campaigns
            </Button>
          </Link>
          <Link to="/team">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" /> Team
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" /> Settings
            </Button>
          </Link>
        </nav>
        <div className="p-4 border-t border-border/40">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 bg-background/95 text-foreground p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export { DashboardLayout };
