import { useState } from "react";
import { Settings, Shield, Upload, MessageSquare, AlertTriangle, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function AdminSettings() {
  // Comment settings
  const [autoAcceptComments, setAutoAcceptComments] = useState(false);
  const [hideCommentThreshold, setHideCommentThreshold] = useState("3");
  const [autoDeleteThreshold, setAutoDeleteThreshold] = useState("10");

  // Upload limits
  const [maxBooksPerUser, setMaxBooksPerUser] = useState("20");
  const [maxFileSize, setMaxFileSize] = useState("50");
  const [allowedFormats, setAllowedFormats] = useState("PDF, EPUB, TXT, MD");

  // Platform settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [newRegistrations, setNewRegistrations] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);

  // Content settings
  const [profanityFilter, setProfanityFilter] = useState(true);
  const [adultContentAllowed, setAdultContentAllowed] = useState(false);
  const [minBookDescLength, setMinBookDescLength] = useState("50");

  const saveSettings = () => {
    toast({ title: "Settings saved", description: "Platform settings have been updated." });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-xl font-serif font-bold mb-1">Platform Settings</h2>
        <p className="text-sm text-muted-foreground">Configure global platform behavior</p>
      </div>

      {/* Comment Moderation */}
      <section className="p-4 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-lavender-light flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Comment Moderation</h3>
        </div>

        <SettingToggle
          label="Auto-accept comments"
          description="New comments are published without review"
          checked={autoAcceptComments}
          onCheckedChange={setAutoAcceptComments}
        />

        <SettingInput
          label="Auto-hide threshold"
          description="Hide comment after this many reports"
          value={hideCommentThreshold}
          onChange={setHideCommentThreshold}
          suffix="reports"
        />

        <SettingInput
          label="Auto-delete threshold"
          description="Permanently remove after this many reports"
          value={autoDeleteThreshold}
          onChange={setAutoDeleteThreshold}
          suffix="reports"
        />
      </section>

      {/* Upload Limits */}
      <section className="p-4 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-sage-light flex items-center justify-center">
            <Upload className="h-4 w-4 text-accent-foreground" />
          </div>
          <h3 className="text-sm font-semibold">Upload Limits</h3>
        </div>

        <SettingInput
          label="Max books per user"
          description="Maximum number of books a user can upload"
          value={maxBooksPerUser}
          onChange={setMaxBooksPerUser}
          suffix="books"
        />

        <SettingInput
          label="Max file size"
          description="Maximum upload file size"
          value={maxFileSize}
          onChange={setMaxFileSize}
          suffix="MB"
        />

        <SettingInput
          label="Allowed formats"
          description="Comma-separated list of accepted file formats"
          value={allowedFormats}
          onChange={setAllowedFormats}
        />
      </section>

      {/* Platform Controls */}
      <section className="p-4 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-cream flex items-center justify-center">
            <Settings className="h-4 w-4 text-amber-700" />
          </div>
          <h3 className="text-sm font-semibold">Platform Controls</h3>
        </div>

        <SettingToggle
          label="Maintenance mode"
          description="Show a maintenance page to all non-admin users"
          checked={maintenanceMode}
          onCheckedChange={setMaintenanceMode}
        />

        <SettingToggle
          label="Allow new registrations"
          description="Let new users sign up"
          checked={newRegistrations}
          onCheckedChange={setNewRegistrations}
        />

        <SettingToggle
          label="Chat feature"
          description="Enable character chat across the platform"
          checked={chatEnabled}
          onCheckedChange={setChatEnabled}
        />

        <SettingToggle
          label="Require email verification"
          description="Users must verify email before accessing features"
          checked={requireEmailVerification}
          onCheckedChange={setRequireEmailVerification}
        />
      </section>

      {/* Content Policy */}
      <section className="p-4 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blush-light flex items-center justify-center">
            <Shield className="h-4 w-4 text-secondary-foreground" />
          </div>
          <h3 className="text-sm font-semibold">Content Policy</h3>
        </div>

        <SettingToggle
          label="Profanity filter"
          description="Automatically filter profane words in comments & chats"
          checked={profanityFilter}
          onCheckedChange={setProfanityFilter}
        />

        <SettingToggle
          label="Allow adult content"
          description="Allow books flagged as adult/mature"
          checked={adultContentAllowed}
          onCheckedChange={setAdultContentAllowed}
        />

        <SettingInput
          label="Min book description length"
          description="Minimum characters for book descriptions"
          value={minBookDescLength}
          onChange={setMinBookDescLength}
          suffix="chars"
        />
      </section>

      <button
        onClick={saveSettings}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
      >
        <Save className="h-4 w-4" />
        Save All Settings
      </button>
    </div>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SettingInput({
  label,
  description,
  value,
  onChange,
  suffix,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="max-w-[200px]" />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}
