import { useState } from "react";
import { CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { 
  useAdminComments, 
  useUpdateCommentStatus, 
  useDeleteComment 
} from "@/hooks/useAdmin";
import type { ContentStatus } from "@/types/database";

export default function AdminComments() {
  const { data: comments, isLoading } = useAdminComments();
  const updateStatus = useUpdateCommentStatus();
  const deleteComment = useDeleteComment();
  const [filter, setFilter] = useState<ContentStatus | "all">("all");

  const filtered = comments?.filter((c) => filter === "all" || c.status === filter) || [];

  const handleUpdateStatus = (commentId: string, status: ContentStatus) => {
    updateStatus.mutate({ commentId, status });
  };

  const handleDelete = (commentId: string) => {
    deleteComment.mutate(commentId);
  };

  const filters: { id: ContentStatus | "all"; label: string }[] = [
    { id: "all", label: `All (${comments?.length || 0})` },
    { id: "pending", label: `Pending (${comments?.filter((c) => c.status === "pending").length || 0})` },
    { id: "approved", label: `Approved (${comments?.filter((c) => c.status === "approved").length || 0})` },
    { id: "rejected", label: `Rejected (${comments?.filter((c) => c.status === "rejected").length || 0})` },
    { id: "hidden", label: `Hidden (${comments?.filter((c) => c.status === "hidden").length || 0})` },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-serif font-bold mb-1">Comment Moderation</h2>
        <p className="text-sm text-muted-foreground">
          {comments?.filter((c) => c.status === "pending").length || 0} comments need review
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors",
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((comment) => (
          <div key={comment.id} className="p-4 rounded-2xl bg-card border border-border space-y-2">
            <div className="flex items-center gap-2">
              <CharacterAvatar 
                name={comment.profiles?.display_name || 'Unknown'} 
                avatar={null} 
                size="sm" 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {comment.profiles?.display_name || 'Unknown User'}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-lg text-[10px] font-medium capitalize",
                    comment.status === "approved" && "bg-sage-light text-accent-foreground",
                    comment.status === "pending" && "bg-cream text-amber-700",
                    comment.status === "rejected" && "bg-destructive/10 text-destructive",
                    comment.status === "hidden" && "bg-muted text-muted-foreground"
                  )}>
                    {comment.status}
                  </span>
                  {comment.reports_count > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-destructive/10 text-destructive text-[10px] font-medium">
                      {comment.reports_count} reports
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  on "{comment.books?.title || 'Unknown Book'}" · {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground pl-8">{comment.content}</p>

            <div className="flex gap-1 pl-8">
              {comment.status === "pending" && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(comment.id, "approved")}
                    disabled={updateStatus.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-sage-light text-accent-foreground hover:opacity-80 transition-opacity disabled:opacity-50"
                  >
                    <CheckCircle className="h-3 w-3" /> Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(comment.id, "rejected")}
                    disabled={updateStatus.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-destructive/10 text-destructive hover:opacity-80 transition-opacity disabled:opacity-50"
                  >
                    <XCircle className="h-3 w-3" /> Reject
                  </button>
                </>
              )}
              {(comment.status === "approved" || comment.status === "hidden") && (
                <button
                  onClick={() => handleUpdateStatus(comment.id, "hidden")}
                  disabled={updateStatus.isPending}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-muted text-muted-foreground hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  Hide
                </button>
              )}
              <button
                onClick={() => handleDelete(comment.id)}
                disabled={deleteComment.isPending}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">No comments match this filter.</p>
        )}
      </div>
    </div>
  );
}
