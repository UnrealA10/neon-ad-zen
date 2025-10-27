import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Megaphone, 
  Users, 
  Settings,
  LogOut,
  TrendingUp
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Campaigns", url: "/campaigns", icon: TrendingUp },
  { title: "Ad Accounts", url: "/accounts", icon: Megaphone },
  { title: "Team", url: "/team", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  return (
    <Sidebar className="border-r border-border/50 bg-sidebar/95 backdrop-blur-sm">
      <SidebarContent>
        <div className="p-6 mb-4">
          <h2 className={`font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent transition-opacity ${!open && "opacity-0"}`}>
            Meta Ads
          </h2>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={open ? "" : "sr-only"}>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                          isActive
                            ? "bg-primary/20 text-primary border border-primary/30 shadow-glow-primary"
                            : "hover:bg-muted/50 text-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {open && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <button className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left hover:bg-destructive/10 text-destructive transition-all duration-300">
                    <LogOut className="h-5 w-5" />
                    {open && <span className="font-medium">Logout</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
