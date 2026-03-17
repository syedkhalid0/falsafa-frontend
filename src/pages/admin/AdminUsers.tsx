import { useState } from "react";
import { Ban, CheckCircle, Shield, ShieldCheck, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { Input } from "@/components/ui/input";
import { 
  useAdminUsers, 
  useUpdateUserRole, 
  useBlockUser 
} from "@/hooks/useAdmin";
import type { AdminUser, UserRoleType } from "@/hooks/useAdmin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminUsers() {
  const { data: users, isLoading } = useAdminUsers();
  const [search, setSearch] = useState("");
  const [roleDialog, setRoleDialog] = useState<AdminUser | null>(null);

  const updateRole = useUpdateUserRole();
  const blockUser = useBlockUser();

  const filtered = users?.filter(
    (u) =>
      u.display_name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
  ) || [];

  const toggleStatus = (user: AdminUser) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    blockUser.mutate({ userId: user.id, status: newStatus });
  };

  const setRole = (userId: string, role: UserRoleType) => {
    updateRole.mutate({ userId, role });
    setRoleDialog(null);
  };

  const roleBadge = (role: UserRoleType | undefined) => {
    const displayRole = role || 'user';
    const styles: Record<UserRoleType, string> = {
      admin: "bg-lavender-light text-primary",
      moderator: "bg-cream text-amber-700",
      user: "bg-muted text-muted-foreground",
    };
    return (
      <span className={cn("px-2 py-0.5 rounded-lg text-[10px] font-medium capitalize", styles[displayRole])}>
        {displayRole}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold mb-1">User Management</h2>
          <p className="text-sm text-muted-foreground">
            {users?.length || 0} users · {users?.filter((u) => u.user_roles?.role === 'admin').length || 0} admins
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((user) => (
          <div key={user.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
            <CharacterAvatar name={user.display_name} avatar={user.avatar_url} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-sm font-medium">{user.display_name}</h3>
                {roleBadge(user.user_roles?.role)}
                {user.status === "blocked" && (
                  <span className="px-2 py-0.5 rounded-lg bg-destructive/10 text-destructive text-[10px] font-medium">
                    Blocked
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {user.email || 'No email'} · Joined {new Date(user.created_at).toLocaleDateString()} · {user.books_count} books
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => setRoleDialog(user)}
                className="p-2 rounded-lg hover:bg-lavender-light text-muted-foreground hover:text-primary transition-colors"
                title="Manage role"
              >
                <ShieldCheck className="h-4 w-4" />
              </button>
              <button
                onClick={() => toggleStatus(user)}
                disabled={blockUser.isPending}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  user.status === "active"
                    ? "hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    : "hover:bg-sage-light text-muted-foreground hover:text-accent-foreground"
                )}
                title={user.status === "active" ? "Block" : "Unblock"}
              >
                {user.status === "active" ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">No users found.</p>
        )}
      </div>

      <Dialog open={!!roleDialog} onOpenChange={() => setRoleDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">Manage Role — {roleDialog?.display_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {(["user", "moderator", "admin"] as UserRoleType[]).map((role) => (
              <button
                key={role}
                onClick={() => roleDialog && setRole(roleDialog.id, role)}
                disabled={updateRole.isPending}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors text-left",
                  roleDialog?.user_roles?.role === role
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground hover:bg-muted"
                )}
              >
                <Shield className="h-4 w-4" />
                <div>
                  <p className="capitalize">{role}</p>
                  <p className={cn("text-[10px]", roleDialog?.user_roles?.role === role ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {role === "admin" && "Full access to all admin features"}
                    {role === "moderator" && "Can manage books and comments"}
                    {role === "user" && "Standard user permissions"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
