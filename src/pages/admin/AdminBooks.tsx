import { useState } from "react";
import { CheckCircle, XCircle, Trash2, Eye, EyeOff, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useBooks } from "@/hooks/useBooks";
import { db } from "@/lib/supabase";
import type { BookStatus as DBBookStatus } from "@/types/database";

type BookStatus = "approved" | "pending" | "rejected" | "disabled";

export default function AdminBooks() {
  const { data: booksData, isLoading, refetch } = useBooks();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<BookStatus | "all">("all");

  const filtered = booksData?.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.author?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchFilter = filterStatus === "all" || b.status === (filterStatus as DBBookStatus);
    return matchSearch && matchFilter;
  }) || [];

  const updateStatus = async (id: string, status: BookStatus) => {
    const { error } = await db
      .from("books")
      .update({ status: status as DBBookStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to update book status", variant: "destructive" });
      return;
    }

    refetch();
    toast({
      title:
        status === "approved"
          ? "Book approved"
          : status === "rejected"
            ? "Book rejected"
            : status === "disabled"
              ? "Book disabled"
              : "Book enabled",
    });
  };

  const deleteBook = async (id: string) => {
    const { error } = await db
      .from("books")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete book", variant: "destructive" });
      return;
    }

    refetch();
    toast({ title: "Book deleted" });
  };

  const statusBadge = (status: DBBookStatus) => {
    const styles: Record<string, string> = {
      approved: "bg-sage-light text-accent-foreground",
      pending: "bg-cream text-amber-700",
      rejected: "bg-destructive/10 text-destructive",
      disabled: "bg-muted text-muted-foreground",
      draft: "bg-muted text-muted-foreground",
    };
    return (
      <span className={cn("px-2 py-0.5 rounded-lg text-[10px] font-medium capitalize", styles[status] || styles.draft)}>
        {status}
      </span>
    );
  };

  const statusFilters: { id: BookStatus | "all"; label: string }[] = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "disabled", label: "Disabled" },
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
        <h2 className="text-xl font-serif font-bold mb-1">Book Management</h2>
        <p className="text-sm text-muted-foreground">
          {booksData?.length || 0} total books · {booksData?.filter((b) => b.status === "pending").length || 0} pending
          review
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or author..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {statusFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors",
                filterStatus === f.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((book) => (
          <div key={book.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
            <div className="w-10 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
              {book.cover_image_url ? (
                <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[8px]">
                  No cover
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-sm font-medium line-clamp-1">{book.title}</h3>
                {statusBadge(book.status)}
              </div>
              <p className="text-xs text-muted-foreground">
                {book.author || "Unknown"} · {book.categories?.name || "Uncategorized"} ·{" "}
                {book.price === 0 ? "Free" : `$${book.price.toFixed(2)}`}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              {book.status === "pending" && (
                <>
                  <button
                    onClick={() => updateStatus(book.id, "approved")}
                    className="p-2 rounded-lg hover:bg-sage-light text-muted-foreground hover:text-accent-foreground transition-colors"
                    title="Approve"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => updateStatus(book.id, "rejected")}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Reject"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </>
              )}
              {book.status === "approved" && (
                <button
                  onClick={() => updateStatus(book.id, "disabled")}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Disable"
                >
                  <EyeOff className="h-4 w-4" />
                </button>
              )}
              {book.status === "disabled" && (
                <button
                  onClick={() => updateStatus(book.id, "approved")}
                  className="p-2 rounded-lg hover:bg-sage-light text-muted-foreground hover:text-accent-foreground transition-colors"
                  title="Enable"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => deleteBook(book.id)}
                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">No books match your filters.</p>
        )}
      </div>
    </div>
  );
}
