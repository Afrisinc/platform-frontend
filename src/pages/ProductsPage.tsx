import {
  Bell,
  Users,
  CreditCard,
  BarChart3,
  ExternalLink,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { usePlatform } from "@/contexts/PlatformContext";

const iconMap: Record<string, React.ElementType> = { Bell, Users, CreditCard, BarChart3 };

export default function ProductsPage() {
  const { products } = usePlatform();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground mt-1">Manage products available to your workspace.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((p) => {
          const Icon = iconMap[p.icon];
          return (
            <div
              key={p.id}
              className="bg-card rounded-xl border border-border p-6 flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `hsl(${p.color} / 0.12)`, color: `hsl(${p.color})` }}
                >
                  {Icon && <Icon className="h-6 w-6" />}
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${p.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                >
                  {p.active ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                  {p.active ? "Active" : "Not activated"}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-1">{p.name}</h3>
              <p className="text-sm text-muted-foreground mb-6 flex-1">{p.description}</p>
              {p.active ? (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Open Product <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <button className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
                  Activate Product
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
