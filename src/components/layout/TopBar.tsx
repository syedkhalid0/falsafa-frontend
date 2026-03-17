import { Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadNotificationsCount } from "@/hooks/useNotifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { NotificationPanel } from "@/components/NotificationPanel";

export function TopBar() {
  const isMobile = useIsMobile();
  const { profile } = useAuth();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();

  const bellButton = (
    <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
      <Bell className="h-5 w-5 text-muted-foreground" />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-blush rounded-full" />
      )}
    </button>
  );

  return (
    <header className="hidden md:flex items-center justify-end px-6 h-14 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {isMobile ? (
          <Drawer>
            <DrawerTrigger asChild>{bellButton}</DrawerTrigger>
            <DrawerContent>
              <NotificationPanel />
            </DrawerContent>
          </Drawer>
        ) : (
          <Popover>
            <PopoverTrigger asChild>{bellButton}</PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <NotificationPanel />
            </PopoverContent>
          </Popover>
        )}

        <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted transition-colors cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-lavender-light flex items-center justify-center text-sm font-medium text-primary overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{profile?.display_name?.charAt(0)?.toUpperCase() || "U"}</span>
            )}
          </div>
          <span className="text-sm font-medium text-foreground">
            {profile?.display_name || "User"}
          </span>
        </div>
      </div>
    </header>
  );
}
