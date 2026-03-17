import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { BottomTabs } from "./BottomTabs";
import { MobileHeader } from "./MobileHeader";
import { TopBar } from "./TopBar";

export function AppLayout() {
  const location = useLocation();
  // Hide mobile chrome (header + bottom tabs) when inside an active chat
  const isActiveChat = /^\/chat\//.test(location.pathname);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {!isActiveChat && <MobileHeader />}
        <TopBar />

        <main className={isActiveChat ? "flex-1 md:pb-0" : "flex-1 pb-20 md:pb-0"}>
          <Outlet />
        </main>

        {!isActiveChat && <BottomTabs />}
      </div>
    </div>
  );
}
