import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function NotificationSettings() {
  const options = [
    { id: "chat", label: "Chat messages", description: "Get notified when characters reply" },
    { id: "books", label: "New books", description: "When new books are added to the library" },
    { id: "updates", label: "App updates", description: "Feature announcements and updates" },
    { id: "email", label: "Email notifications", description: "Receive email digests" },
  ];

  return (
    <div className="px-4 md:px-6 pt-6 pb-8 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/settings" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <h1 className="text-2xl font-serif font-bold">Notifications</h1>
      </div>

      <div className="space-y-2">
        {options.map((opt) => (
          <div key={opt.id} className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border">
            <div>
              <Label className="text-sm font-medium">{opt.label}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
            </div>
            <Switch defaultChecked />
          </div>
        ))}
      </div>
    </div>
  );
}
