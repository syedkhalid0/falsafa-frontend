import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "How do I chat with a character?", a: "Add a book to your library, then tap on any character to start a conversation." },
  { q: "Can I upload my own books?", a: "Yes! Go to My Library and tap the upload button to add your own books and characters." },
  { q: "Is my data private?", a: "Absolutely. Your conversations and reading history are encrypted and private to your account." },
  { q: "How do I change my avatar?", a: "Go to Settings > Profile and tap 'Change avatar' to upload a new picture." },
];

export default function HelpSupportSettings() {
  return (
    <div className="px-4 md:px-6 pt-6 pb-8 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/settings" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <h1 className="text-2xl font-serif font-bold">Help & Support</h1>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Frequently Asked Questions</h3>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-2xl bg-card border border-border px-4">
                <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-3">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground mb-3">Contact Us</h3>
          <a href="mailto:support@falsafa.app" className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border hover:shadow-soft transition-all">
            <div>
              <p className="text-sm font-medium">Email Support</p>
              <p className="text-xs text-muted-foreground">support@falsafa.app</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>
        </div>
      </div>
    </div>
  );
}
