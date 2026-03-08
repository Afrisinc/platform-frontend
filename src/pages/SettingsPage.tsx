import { useState } from "react";
import { Shield, AlertTriangle, X } from "lucide-react";
import { usePlatform } from "@/contexts/PlatformContext";

export default function SettingsPage() {
  const { currentWorkspace } = usePlatform();
  const [showDelete, setShowDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your workspace settings.</p>
      </div>

      {/* Workspace Information */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Workspace Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Workspace Name</label>
            <input type="text" defaultValue={currentWorkspace.name} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Workspace Slug</label>
            <input type="text" defaultValue={currentWorkspace.name.toLowerCase().replace(/\s+/g, "-")} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Timezone</label>
            <select className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option>UTC</option>
              <option>America/New_York</option>
              <option>Europe/London</option>
              <option>Africa/Lagos</option>
              <option>Asia/Tokyo</option>
            </select>
          </div>
        </div>
        <button className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Save Changes
        </button>
      </div>

      {/* Security */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Security</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
              Enable 2FA
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">Single Sign-On (SSO)</p>
              <p className="text-xs text-muted-foreground">Configure SSO for your workspace members.</p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
              Configure
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card rounded-xl border border-destructive/30 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <h2 className="text-sm font-semibold text-destructive uppercase tracking-wider">Danger Zone</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Permanently delete this workspace and all associated data. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowDelete(true)}
          className="px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors"
        >
          Delete Workspace
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setShowDelete(false)} />
          <div className="relative bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-destructive">Delete Workspace</h2>
              <button onClick={() => setShowDelete(false)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete <span className="font-semibold text-foreground">{currentWorkspace.name}</span> and all its data including members, API keys, and billing history.
            </p>
            <div className="mb-4">
              <label className="text-sm font-medium mb-1.5 block">
                Type <span className="font-mono text-destructive">{currentWorkspace.name}</span> to confirm
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-destructive/30 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-destructive"
              />
            </div>
            <button
              disabled={deleteInput !== currentWorkspace.name}
              className="w-full px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Permanently Delete Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
