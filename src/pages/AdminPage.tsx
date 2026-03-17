import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderOpen,
  BookOpen,
  Users,
  MessageSquare,
  AlertTriangle,
  Megaphone,
  Settings,
  Menu,
  X,
} from "lucide-react";
import AdminOverview from "./admin/AdminOverview";
import AdminCategories from "./admin/AdminCategories";
import AdminBooks from "./admin/AdminBooks";
import AdminUsers from "./admin/AdminUsers";
import AdminComments from "./admin/AdminComments";
import AdminReports from "./admin/AdminReports";
import AdminNotifications from "./admin/AdminNotifications";
import AdminSettings from "./admin/AdminSettings";

type Section =
  | "overview"
  | "categories"
  | "books"
  | "users"
  | "comments"
  | "reports"
  | "notifications"
  | "settings";

const navItems: { id: Section; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "categories", label: "Categories", icon: FolderOpen },
  { id: "books", label: "Books", icon: BookOpen },
  { id: "users", label: "Users", icon: Users },
  { id: "comments", label: "Comments", icon: MessageSquare, badge: 3 },
  { id: "reports", label: "Reports", icon: AlertTriangle, badge: 3 },
  { id: "notifications", label: "Notifications", icon: Megaphone },
  { id: "settings", label: "Settings", icon: Settings },
];

const sectionComponents: Record<Section, React.ComponentType> = {
  overview: AdminOverview,
  categories: AdminCategories,
  books: AdminBooks,
  users: AdminUsers,
  comments: AdminComments,
  reports: AdminReports,
  notifications: AdminNotifications,
  settings: AdminSettings,
};

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ActiveComponent = sectionComponents[activeSection];

  const handleNav = (id: Section) => {
    setActiveSection(id);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-full min-h-[calc(100dvh-4rem)] animate-fade-in">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:sticky top-0 md:top-auto left-0 z-50 md:z-auto h-full md:h-auto w-64 bg-card border-r border-border p-4 flex flex-col transition-transform duration-200 md:translate-x-0 shrink-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between mb-6 md:mb-4">
          <h1 className="text-lg font-serif font-bold">Admin Panel</h1>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 rounded-lg hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left",
                activeSection === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span
                  className={cn(
                    "h-5 min-w-[20px] flex items-center justify-center rounded-full text-[10px] font-bold px-1.5",
                    activeSection === item.id
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-serif font-bold">Admin</h1>
          <span className="text-sm text-muted-foreground capitalize">/ {activeSection}</span>
        </div>

        <div className="p-4 md:p-6">
          <ActiveComponent />
        </div>
      </main>
    </div>
  );
}
