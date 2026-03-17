import { User, Bell, Palette, Shield, HelpCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function SettingsPage() {
  const sections = [
    { icon: User, title: "Profile", description: "Update your name, email and avatar", url: "/settings/profile" },
    { icon: Bell, title: "Notifications", description: "Manage notification preferences", url: "/settings/notifications" },
    { icon: Palette, title: "Appearance", description: "Theme, font size and display", url: "/settings/appearance" },
    { icon: Shield, title: "Privacy", description: "Password and account security", url: "/settings/privacy" },
    { icon: HelpCircle, title: "Help & Support", description: "FAQs and contact us", url: "/settings/help" },
  ];

  return (
    <div className="px-4 md:px-6 pt-6 pb-8 animate-fade-in max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-serif font-bold mb-6">Settings</h1>
      <div className="space-y-2">
        {sections.map((section) => (
          <Link
            key={section.title}
            to={section.url}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:shadow-soft transition-all text-left"
          >
            <div className="h-10 w-10 rounded-xl bg-lavender-light flex items-center justify-center shrink-0">
              <section.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-foreground">{section.title}</h3>
              <p className="text-xs text-muted-foreground">{section.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
