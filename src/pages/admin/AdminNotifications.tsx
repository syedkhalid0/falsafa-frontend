import { useState } from "react";
import { Send, Megaphone, Trash2, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface SentNotification {
  id: string;
  title: string;
  message: string;
  date: string;
}

export default function AdminNotifications() {
  const [nTitle, setNTitle] = useState("");
  const [nMessage, setNMessage] = useState("");
  const [history, setHistory] = useState<SentNotification[]>([
    { id: "sn1", title: "Welcome to Falsafa!", message: "Explore our new book collection and start chatting with your favorite characters.", date: "2 days ago" },
    { id: "sn2", title: "New Category: Thriller", message: "Check out our brand-new Thriller category with 15 exciting books.", date: "1 week ago" },
  ]);

  const sendNotification = () => {
    if (!nTitle.trim() || !nMessage.trim()) return;
    setHistory((prev) => [
      { id: `sn-${Date.now()}`, title: nTitle, message: nMessage, date: "Just now" },
      ...prev,
    ]);
    toast({ title: "Notification sent", description: `"${nTitle}" sent to all users.` });
    setNTitle("");
    setNMessage("");
  };

  const deleteNotification = (id: string) => {
    setHistory((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-serif font-bold mb-1">Notifications</h2>
        <p className="text-sm text-muted-foreground">Send announcements to all users</p>
      </div>

      <div className="max-w-xl space-y-4 p-4 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-lavender-light flex items-center justify-center">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Compose Notification</h3>
            <p className="text-[10px] text-muted-foreground">This will be sent to all users</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title</label>
            <Input value={nTitle} onChange={(e) => setNTitle(e.target.value)} placeholder="e.g. New books available!" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Message</label>
            <Textarea value={nMessage} onChange={(e) => setNMessage(e.target.value)} placeholder="Write the notification message..." className="min-h-[100px]" />
          </div>
        </div>

        <button
          onClick={sendNotification}
          disabled={!nTitle.trim() || !nMessage.trim()}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
          Send to All Users
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Sent History</h3>
          {history.map((n) => (
            <div key={n.id} className="flex items-start gap-3 p-3 rounded-2xl bg-card border border-border">
              <div className="h-8 w-8 rounded-xl bg-lavender-light flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium">{n.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{n.date}</p>
              </div>
              <button
                onClick={() => deleteNotification(n.id)}
                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
