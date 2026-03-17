import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  useAdminReports, 
  useUpdateReportStatus 
} from "@/hooks/useAdmin";
import type { Report, ReportStatus } from "@/types/database";

type ReportTypeDisplay = 'Comment' | 'Book' | 'Chat' | 'User';

interface ReportWithDetails extends Report {
  reporter: { display_name: string } | null;
}

export default function AdminReports() {
  const { data: reports, isLoading } = useAdminReports();
  const updateStatus = useUpdateReportStatus();
  const [filter, setFilter] = useState<ReportStatus | "all">("all");

  const filtered = reports?.filter((r) => filter === "all" || r.status === filter) || [];

  const handleUpdate = (reportId: string, status: ReportStatus) => {
    updateStatus.mutate({ reportId, status });
  };

  const typeBadge = (reportType: string) => {
    const displayType: ReportTypeDisplay = 
      reportType === 'spam' || reportType === 'harassment' ? 'User' :
      reportType === 'copyright' ? 'Book' : 'Comment';
    const styles: Record<string, string> = {
      Comment: "bg-lavender-light text-primary",
      Book: "bg-sage-light text-accent-foreground",
      Chat: "bg-blush-light text-secondary-foreground",
      User: "bg-cream text-amber-700",
    };
    return (
      <span className={cn("px-2 py-0.5 rounded-lg text-[10px] font-medium", styles[displayType] || "bg-muted text-muted-foreground")}>
        {displayType}
      </span>
    );
  };

  const getReportTarget = (report: ReportWithDetails): string => {
    if (report.reported_user_id) return `User report`;
    if (report.reported_book_id) return `Book report`;
    if (report.reported_review_id) return `Review report`;
    if (report.reported_comment_id) return `Comment report`;
    return 'Unknown target';
  };

  const filters: { id: ReportStatus | "all"; label: string }[] = [
    { id: "all", label: `All (${reports?.length || 0})` },
    { id: "open", label: `Open (${reports?.filter((r) => r.status === "open").length || 0})` },
    { id: "investigating", label: `Investigating (${reports?.filter((r) => r.status === "investigating").length || 0})` },
    { id: "resolved", label: `Resolved (${reports?.filter((r) => r.status === "resolved").length || 0})` },
    { id: "dismissed", label: `Dismissed (${reports?.filter((r) => r.status === "dismissed").length || 0})` },
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
        <h2 className="text-xl font-serif font-bold mb-1">Reports</h2>
        <p className="text-sm text-muted-foreground">
          {reports?.filter((r) => r.status === "open").length || 0} open reports need attention
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
        {filtered.map((report) => (
          <div key={report.id} className="p-4 rounded-2xl bg-card border border-border space-y-2">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-xl bg-cream flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="h-4 w-4 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  {typeBadge(report.report_type)}
                  <span className={cn(
                    "px-2 py-0.5 rounded-lg text-[10px] font-medium capitalize",
                    report.status === "open" && "bg-destructive/10 text-destructive",
                    report.status === "investigating" && "bg-cream text-amber-700",
                    report.status === "resolved" && "bg-sage-light text-accent-foreground",
                    report.status === "dismissed" && "bg-muted text-muted-foreground"
                  )}>
                    {report.status}
                  </span>
                </div>
                <p className="text-sm font-medium">{getReportTarget(report)}</p>
                <p className="text-xs text-muted-foreground">
                  Reason: {report.reason} · By {report.reporter?.display_name || 'Unknown'} · {new Date(report.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {report.status === "open" && (
              <div className="flex gap-1 pl-11">
                <button
                  onClick={() => handleUpdate(report.id, "investigating")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-cream text-amber-700 hover:opacity-80 transition-opacity"
                >
                  Investigate
                </button>
                <button
                  onClick={() => handleUpdate(report.id, "resolved")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-sage-light text-accent-foreground hover:opacity-80 transition-opacity"
                >
                  <CheckCircle className="h-3 w-3" /> Resolve
                </button>
                <button
                  onClick={() => handleUpdate(report.id, "dismissed")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-muted text-muted-foreground hover:opacity-80 transition-opacity"
                >
                  <XCircle className="h-3 w-3" /> Dismiss
                </button>
              </div>
            )}

            {report.status === "investigating" && (
              <div className="flex gap-1 pl-11">
                <button
                  onClick={() => handleUpdate(report.id, "resolved")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-sage-light text-accent-foreground hover:opacity-80 transition-opacity"
                >
                  <CheckCircle className="h-3 w-3" /> Resolve
                </button>
                <button
                  onClick={() => handleUpdate(report.id, "dismissed")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-muted text-muted-foreground hover:opacity-80 transition-opacity"
                >
                  <XCircle className="h-3 w-3" /> Dismiss
                </button>
              </div>
            )}

            {report.resolution_note && (
              <div className="pl-11">
                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                  Note: {report.resolution_note}
                </p>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">No reports match this filter.</p>
        )}
      </div>
    </div>
  );
}
