import { TopNavBar } from "./TopNavBar";
import { AppSidebar } from "./AppSidebar";
import { PlatformProvider } from "@/contexts/PlatformContext";

export function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlatformProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        <TopNavBar />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </PlatformProvider>
  );
}
