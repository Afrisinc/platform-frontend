import { useState } from "react";
import { UserPlus, MoreHorizontal, Mail, X } from "lucide-react";
import { usePlatform } from "@/contexts/PlatformContext";

const roles = ["Owner", "Admin", "Developer", "Viewer"] as const;

export default function MembersPage() {
  const { members } = usePlatform();
  const [showInvite, setShowInvite] = useState(false);
  const pending = members.filter((m) => m.status === "Pending");
  const active = members.filter((m) => m.status === "Active");

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground mt-1">Manage your workspace team members.</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="h-4 w-4" /> Invite Member
        </button>
      </div>

      {/* Pending Invitations */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pending Invitations</h2>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {pending.map((m) => (
              <div key={m.id} className="flex items-center gap-4 p-4">
                <div className="w-9 h-9 rounded-full bg-warning/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{m.email}</p>
                  <p className="text-xs text-muted-foreground">Invited as {m.role}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-warning/10 text-warning font-medium">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Name</th>
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Email</th>
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Role</th>
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Joined</th>
                <th className="text-right font-medium text-muted-foreground px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {active.map((m) => (
                <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-pale flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">{m.avatar}</span>
                      </div>
                      <span className="font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{m.email}</td>
                  <td className="px-5 py-4">
                    <select
                      defaultValue={m.role}
                      className="text-sm bg-transparent border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
                      disabled={m.role === "Owner"}
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-success/10 text-success font-medium">Active</span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{new Date(m.joinedAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-right">
                    {m.role !== "Owner" && (
                      <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setShowInvite(false)} />
          <div className="relative bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Invite Member</h2>
              <button onClick={() => setShowInvite(false)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <input type="email" placeholder="colleague@company.com" className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Role</label>
                <select className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>Admin</option>
                  <option>Developer</option>
                  <option>Viewer</option>
                </select>
              </div>
              <button className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
