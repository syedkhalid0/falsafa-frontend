import { ArrowLeft, Sun, Moon, Monitor } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function AppearanceSettings() {
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState("medium");

  const themes = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ];

  const fontSizes = [
    { id: "small", label: "Small" },
    { id: "medium", label: "Medium" },
    { id: "large", label: "Large" },
  ];

  return (
    <div className="px-4 md:px-6 pt-6 pb-8 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/settings" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <h1 className="text-2xl font-serif font-bold">Appearance</h1>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                  theme === t.id
                    ? "border-primary bg-lavender-light"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <t.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-3">Font Size</p>
          <div className="grid grid-cols-3 gap-2">
            {fontSizes.map((f) => (
              <button
                key={f.id}
                onClick={() => setFontSize(f.id)}
                className={cn(
                  "p-3 rounded-2xl border text-sm font-medium transition-all",
                  fontSize === f.id
                    ? "border-primary bg-lavender-light"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
