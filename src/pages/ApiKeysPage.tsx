import { useState } from "react";
import { Plus, Copy, Trash2, X, ShieldAlert, Key } from "lucide-react";
import { usePlatform } from "@/contexts/PlatformContext";

export default function ApiKeysPage() {
  const { apiKeys } = usePlatform();
  const [showCreate, setShowCreate] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const handleCreate = () => {
    setCreatedKey("ak_live_xK9m2Pq7wR4nT6yB8zA3cD5eF1gH0jL");
    setShowCreate(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground mt-1">
            Manage API keys for your workspace integrations.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Create API Key
        </button>
      </div>

      {/* Newly Created Key */}
      {createdKey && (
        <div className="bg-success/5 border border-success/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-success mb-1">API Key Created</p>
              <p className="text-xs text-muted-foreground mb-3">
                Copy this key now. It won't be shown again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg bg-card border border-border text-sm font-mono break-all">
                  {createdKey}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(createdKey)}
                  className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setCreatedKey(null)}
              className="p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Keys Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Name</th>
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Key</th>
                <th className="text-left font-medium text-muted-foreground px-5 py-3">
                  Environment
                </th>
                <th className="text-left font-medium text-muted-foreground px-5 py-3">
                  Created By
                </th>
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Created</th>
                <th className="text-right font-medium text-muted-foreground px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {apiKeys.map((k) => (
                <tr key={k.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{k.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                      {k.prefix}••••••••
                    </code>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${k.environment === "Production" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      {k.environment}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{k.createdBy}</td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {new Date(k.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                        title="Copy key prefix"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-destructive"
                        title="Revoke key"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-5 border border-border">
        <ShieldAlert className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Security Notice</p>
          <p className="text-sm text-muted-foreground">
            API keys are only shown once at creation. Store them securely. Rotate keys regularly and
            revoke any that are no longer in use.
          </p>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          />
          <div className="relative bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Create API Key</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Key Name</label>
                <input
                  type="text"
                  placeholder="e.g., Production API"
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Environment</label>
                <select className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>Production</option>
                  <option>Test</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <textarea
                  placeholder="What is this key used for?"
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <button
                onClick={handleCreate}
                className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Create Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
