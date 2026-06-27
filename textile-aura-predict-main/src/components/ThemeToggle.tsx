import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  collapsed?: boolean;
}

const ThemeToggle = ({ collapsed = false }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className={cn(
        "w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted/50",
        collapsed && "justify-center"
      )}
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Light Mode</span>}
        </>
      ) : (
        <>
          <Moon className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Dark Mode</span>}
        </>
      )}
    </Button>
  );
};

export default ThemeToggle;
