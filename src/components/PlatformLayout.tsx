import { useEffect } from "react";
import { TopNavBar } from "./TopNavBar";
import { AppSidebar } from "./AppSidebar";
import { PlatformProvider, usePlatform } from "@/contexts/PlatformContext";

function LayoutInner({ children, activeProductId }: { children: React.ReactNode; activeProductId?: string }) {
  const { products, setCurrentProduct } = usePlatform();

  useEffect(() => {
    if (activeProductId) {
      const product = products.find((p) => p.id === activeProductId);
      setCurrentProduct(product || null);
    } else {
      setCurrentProduct(null);
    }
  }, [activeProductId, products, setCurrentProduct]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopNavBar />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export function PlatformLayout({ children, activeProductId }: { children: React.ReactNode; activeProductId?: string }) {
  return (
    <PlatformProvider>
      <LayoutInner activeProductId={activeProductId}>
        {children}
      </LayoutInner>
    </PlatformProvider>
  );
}
