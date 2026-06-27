import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import {
  LayoutDashboard,
  TrendingUp,
  Brain,
  Newspaper,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: TrendingUp, label: "Price Analysis", path: "/analysis" },
  { icon: Brain, label: "AI Predictions", path: "/predictions" },
  { icon: Newspaper, label: "Market News", path: "/news" },
  { icon: Settings, label: "Admin Panel", path: "/admin" },
];

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar = ({ onLogout }: SidebarProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen glass-card border-r border-border flex flex-col z-50 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 border-b border-border flex items-center justify-between">
        {!collapsed && <Logo size="sm" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                isActive
                  ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <ThemeToggle collapsed={collapsed} />
        <Button
          variant="ghost"
          onClick={onLogout}
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
