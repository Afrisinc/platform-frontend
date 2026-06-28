import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { platformService } from "@/services/platformService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CreateWorkspacePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    const ws = await platformService.createWorkspace({ name: name.trim() });
    localStorage.setItem("afrisinc_active_workspace", ws.id);
    navigate("/platform", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-6">
        <button
          onClick={() => navigate("/workspaces")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="animate-fade-in-up">
          <img
            src="/afrisic-logo.png"
            alt="Afrisinc"
            className="w-14 h-14 rounded-2xl object-contain mb-6 shadow-lg shadow-primary/20"
          />

          <h1 className="text-2xl font-bold text-foreground">Create a Workspace</h1>
          <p className="text-muted-foreground text-sm mt-1.5 mb-8">
            Give your workspace a name to get started
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Workspace name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Company"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>

            <Button onClick={handleCreate} disabled={!name.trim() || creating} className="w-full">
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
