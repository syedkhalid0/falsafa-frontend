import { BookOpen, Users, MessageCircle, AlertTriangle, TrendingUp, Eye, Upload, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStats } from "@/hooks/useAdmin";

const statsConfig = [
  { key: "totalBooks" as const, label: "Total Books", icon: BookOpen, color: "bg-lavender-light text-primary" },
  { key: "totalUsers" as const, label: "Total Users", icon: Users, color: "bg-sage-light text-accent-foreground" },
  { key: "activeChats" as const, label: "Active Chats", icon: MessageCircle, color: "bg-blush-light text-secondary-foreground" },
  { key: "pendingReports" as const, label: "Pending Reports", icon: AlertTriangle, color: "bg-cream text-amber-700" },
  { key: "pageViews" as const, label: "Page Views", icon: Eye, color: "bg-lavender-light text-primary" },
  { key: "uploadsToday" as const, label: "Uploads Today", icon: Upload, color: "bg-sage-light text-accent-foreground" },
  { key: "avgRating" as const, label: "Avg Rating", icon: Star, color: "bg-cream text-amber-700" },
  { key: "growth" as const, label: "Growth", icon: TrendingUp, color: "bg-blush-light text-secondary-foreground" },
];

export default function AdminOverview() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-serif font-bold mb-1">Dashboard Overview</h2>
        <p className="text-sm text-muted-foreground">Quick snapshot of your platform</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsConfig.map((stat) => {
          const value = stats?.[stat.key];
          const displayValue = stat.key === "growth" 
            ? `+${value}%` 
            : stat.key === "avgRating" 
              ? (value?.toFixed(1) || "0.0")
              : stat.key === "pageViews"
                ? value && value >= 1000 ? `${(value / 1000).toFixed(1)}k` : (value || 0)
                : stat.key === "totalUsers" && value && value >= 1000
                  ? value.toLocaleString()
                  : (value ?? 0);

          return (
            <div key={stat.key} className="p-4 rounded-2xl bg-card border border-border hover:shadow-sm transition-shadow">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-3", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold font-serif">{displayValue}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              {stat.key === "growth" && (
                <p className="text-[10px] text-primary mt-1">Monthly users</p>
              )}
              {stat.key === "avgRating" && (
                <p className="text-[10px] text-primary mt-1">Across all books</p>
              )}
              {stat.key === "uploadsToday" && stats?.pendingReports && stats.pendingReports > 0 && (
                <p className="text-[10px] text-primary mt-1">{stats.pendingReports} pending review</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-card border border-border p-4">
        <h3 className="text-sm font-semibold mb-3">Platform Activity</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm">{stats?.totalBooks || 0} books in the library</p>
              <p className="text-[10px] text-muted-foreground">Available for reading</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm">{stats?.totalUsers || 0} registered users</p>
              <p className="text-[10px] text-muted-foreground">Platform members</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm">{stats?.activeChats || 0} active conversations</p>
              <p className="text-[10px] text-muted-foreground">Character chats ongoing</p>
            </div>
          </div>
          {stats?.pendingReports && stats.pendingReports > 0 && (
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-destructive mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-destructive">{stats.pendingReports} reports need attention</p>
                <p className="text-[10px] text-muted-foreground">Pending moderation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
