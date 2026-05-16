import { useState } from "react";
import { ChevronDown, Check, Plus, Building2 } from "lucide-react";
import { usePlatform, Workspace } from "@/contexts/PlatformContext";
import { cn } from "@/lib/utils";

export function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = usePlatform();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors text-sm font-medium"
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-primary text-primary-foreground text-[10px] font-bold">
          {currentWorkspace.initials}
        </span>
        <span className="hidden md:inline">{currentWorkspace.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-64 bg-popover border border-border rounded-xl shadow-lg z-50 p-1.5 animate-fade-in">
            <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Workspaces
            </p>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  setCurrentWorkspace(ws);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors",
                  ws.id === currentWorkspace.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-secondary"
                )}
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 text-primary text-xs font-bold">
                  {ws.initials}
                </span>
                <span className="font-medium">{ws.name}</span>
                {ws.id === currentWorkspace.id && (
                  <Check className="h-4 w-4 ml-auto text-primary" />
                )}
              </button>
            ))}
            <div className="border-t border-border mt-1 pt-1">
              <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm hover:bg-secondary transition-colors text-muted-foreground">
                <Plus className="h-4 w-4" />
                <span>Create Workspace</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
