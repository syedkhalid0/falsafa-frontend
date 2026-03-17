import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Grid3X3, Heart, HelpCircle, LogOut, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { NotificationPanel } from "@/components/NotificationPanel";

const menuItems = [
  { title: "Category", url: "/category", icon: Grid3X3 },
  { title: "Wishlist", url: "/wishlist", icon: Heart },
  { title: "Help", url: "/help", icon: HelpCircle },
];

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="md:hidden flex items-center justify-between px-4 h-14 bg-card/90 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <h1 className="text-lg font-serif font-bold text-primary tracking-tight">
          Falsafa
        </h1>

        <Drawer>
          <DrawerTrigger asChild>
            <button className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-blush rounded-full" />
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <NotificationPanel />
          </DrawerContent>
        </Drawer>
      </header>

      {/* Hamburger overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-card z-50 shadow-soft-lg md:hidden"
            >
              <div className="p-6 pb-4 border-b border-border">
                <h1 className="text-2xl font-serif font-bold text-primary">Falsafa</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Chat with characters</p>
              </div>

              <nav className="p-4 space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.url}
                    onClick={() => {
                      navigate(item.url);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-colors w-full text-left"
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                    <span>{item.title}</span>
                  </button>
                ))}
              </nav>

              <div className="absolute bottom-8 left-0 right-0 px-4">
                <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-destructive transition-colors w-full">
                  <LogOut className="h-[18px] w-[18px]" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
