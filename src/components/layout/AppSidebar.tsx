import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Compass,
  Grid3X3,
  BookOpen,
  MessageCircle,
  Heart,
  Settings,
  HelpCircle,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const mainNav = [
  { title: "Discover", url: "/", icon: Compass },
  { title: "Category", url: "/category", icon: Grid3X3 },
  { title: "My Library", url: "/library", icon: BookOpen },
  { title: "Chats", url: "/chat", icon: MessageCircle },
  { title: "Wishlist", url: "/wishlist", icon: Heart },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, role, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const showAdmin = role === "admin" || role === "moderator";

  const secondaryNav = [
    ...(showAdmin ? [{ title: "Admin", url: "/admin", icon: ShieldCheck }] : []),
    { title: "Settings", url: "/settings", icon: Settings },
    { title: "Help", url: "/help", icon: HelpCircle },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-border bg-sidebar h-screen sticky top-0 shrink-0">
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-serif font-bold text-primary tracking-tight">
          Falsafa
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Chat with characters</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {mainNav.map((item) => {
          const isActive = item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url);
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/"}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                !isActive && "text-sidebar-foreground/70"
              )}
              activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
            >
              <item.icon className="h-[18px] w-[18px]" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 pb-4 space-y-1 border-t border-border pt-3">
        {secondaryNav.map((item) => {
          const isActive = location.pathname.startsWith(item.url);
          return (
            <NavLink
              key={item.url}
              to={item.url}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                !isActive && "text-sidebar-foreground/60"
              )}
              activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
            >
              <item.icon className="h-[18px] w-[18px]" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-destructive transition-all duration-200 w-full"
        >
          <LogOut className="h-[18px] w-[18px]" />
          <span>Logout</span>
        </button>
      </div>

      {profile && (
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/50">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-primary">
                  {profile.display_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile.display_name}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize">{role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
