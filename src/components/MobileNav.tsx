import { cn } from "@/lib/utils";
import { MessageSquare, LayoutDashboard, Brain } from "lucide-react";

interface MobileNavProps {
  view: "steps" | "chat";
  onViewChange: (view: "steps" | "chat") => void;
}

const MobileNav = ({ view, onViewChange }: MobileNavProps) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary/95 backdrop-blur-xl border-t border-border z-50">
      <div className="flex">
        <button
          onClick={() => onViewChange("steps")}
          className={cn(
            "flex-1 flex flex-col items-center py-3 gap-1 transition-colors",
            view === "steps" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Analyse</span>
        </button>
        <button
          onClick={() => onViewChange("chat")}
          className={cn(
            "flex-1 flex flex-col items-center py-3 gap-1 transition-colors",
            view === "chat" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium">Édouard</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNav;
