import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { platformService, type WorkspaceWithProducts } from "@/services/platformService";
import { AfrisincLoader } from "@/components/AfrisincLoader";
import { Plus, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WorkspaceSelectorPage() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<WorkspaceWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    platformService.getUserWorkspaces().then((ws) => {
      setWorkspaces(ws);
      setLoading(false);
    });
  }, []);

  function selectWorkspace(id: string) {
    setSelectedId(id);
    localStorage.setItem("afrisinc_active_workspace", id);
    setTimeout(() => navigate("/platform", { replace: true }), 400);
  }

  if (loading) return <AfrisincLoader message="Loading workspaces..." />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-[400px] h-[400px] rounded-full bg-primary-light/[0.03] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-bold text-xl">A</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Select a Workspace</h1>
          <p className="text-muted-foreground text-sm mt-1.5">Choose a workspace to continue</p>
        </div>

        {/* Workspace cards */}
        <div className="space-y-3">
          {workspaces.map((ws, i) => (
            <button
              key={ws.id}
              onClick={() => selectWorkspace(ws.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border bg-card transition-all duration-200 group animate-fade-in-up",
                selectedId === ws.id
                  ? "border-primary ring-2 ring-primary/20 shadow-md"
                  : "border-border hover:border-primary/40 hover:shadow-sm"
              )}
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-sm">{ws.initials}</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-foreground">{ws.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {ws.products.length} product{ws.products.length !== 1 ? "s" : ""} · {ws.plan} plan
                </p>
              </div>
              {selectedId === ws.id ? (
                <CheckCircle2 className="h-5 w-5 text-primary animate-scale-in" />
              ) : (
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          ))}
        </div>

        {/* Create workspace */}
        <button
          onClick={() => navigate("/create-workspace")}
          className="w-full flex items-center justify-center gap-2 mt-4 p-3.5 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-card transition-all text-sm animate-fade-in-up"
          style={{ animationDelay: `${(workspaces.length + 1) * 100}ms` }}
        >
          <Plus className="h-4 w-4" />
          <span>Create Workspace</span>
        </button>
      </div>
    </div>
  );
}
