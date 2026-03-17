import { NavLink } from "@/components/NavLink";
import { Compass, BookOpen, MessageCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { title: "Discover", url: "/", icon: Compass },
  { title: "Library", url: "/library", icon: BookOpen },
  { title: "Chat", url: "/chat", icon: MessageCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function BottomTabs() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.url}
            to={tab.url}
            end={tab.url === "/"}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-muted-foreground transition-all duration-200 min-w-[60px]"
            )}
            activeClassName="text-primary"
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{tab.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
