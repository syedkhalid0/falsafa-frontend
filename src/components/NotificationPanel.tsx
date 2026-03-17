import { Check, Trash2, MessageCircle, BookOpen, Info } from "lucide-react";
import { useNotifications, useMarkNotificationRead, useClearAllNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/types/database";

const typeIcons: Record<NotificationType, typeof MessageCircle> = {
  chat: MessageCircle,
  book: BookOpen,
  system: Info,
  moderation: Info,
  review: BookOpen,
};

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export function NotificationPanel() {
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const clearAll = useClearAllNotifications();

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const handleToggleRead = (id: string, isRead: boolean) => {
    if (isRead) {
      return;
    }
    markRead.mutate(id);
  };

  return (
    <div className="flex flex-col max-h-[70vh] md:max-h-[420px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-serif font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-medium bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {notifications.length > 0 && (
          <button
            onClick={() => clearAll.mutate()}
            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Clear all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Info className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          notifications.map((n) => {
            const Icon = typeIcons[n.type] || Info;
            const isRead = !!n.read_at;
            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 transition-colors",
                  !isRead && "bg-lavender-light/40"
                )}
              >
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm leading-tight", !isRead ? "font-medium text-foreground" : "text-muted-foreground")}>
                    {n.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">{formatTimestamp(n.created_at)}</p>
                </div>
                {!isRead && (
                  <button
                    onClick={() => handleToggleRead(n.id, isRead)}
                    className="p-1.5 rounded-lg transition-colors shrink-0 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    aria-label="Mark read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
