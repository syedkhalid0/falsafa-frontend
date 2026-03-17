import { BookOpen, MessageCircle, Mail } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="px-4 md:px-6 pt-6 pb-8 animate-fade-in max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-serif font-bold mb-2">Help & Support</h1>
      <p className="text-sm text-muted-foreground mb-6">Find answers or reach out to us.</p>

      <div className="space-y-3">
        <div className="p-5 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold">How does Falsafa work?</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Add books to your library, then choose a character to start a conversation. Our AI brings characters to life so you can chat with them.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold">Can I upload my own books?</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Yes! Go to your Library and tap "Upload Book". You can upload PDFs, Markdown, TXT, or EPUB files.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold">Contact Us</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Need more help? Reach out at support@falsafa.app and we'll get back to you within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
