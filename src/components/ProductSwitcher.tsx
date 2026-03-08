import { useState } from "react";
import { Bell, Users, CreditCard, BarChart3, ExternalLink } from "lucide-react";
import { usePlatform, Product } from "@/contexts/PlatformContext";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Bell, Users, CreditCard, BarChart3,
};

export function ProductSwitcher() {
  const { products } = usePlatform();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors text-sm font-medium"
      >
        <span className="hidden md:inline">Products</span>
        <span className="md:hidden text-muted-foreground">Apps</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-72 bg-popover border border-border rounded-xl shadow-lg z-50 p-1.5 animate-fade-in">
            <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Launch Product</p>
            {products.map((p) => {
              const Icon = iconMap[p.icon];
              return (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-secondary transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `hsl(${p.color} / 0.12)`, color: `hsl(${p.color})` }}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <span className="font-medium">{p.name}</span>
                    <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </a>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
