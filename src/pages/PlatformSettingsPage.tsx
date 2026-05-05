import { useState } from "react";
import {
  Building2, Bell, Shield, Plus, ToggleLeft, ToggleRight,
  ChevronDown, Save, Package, Settings, Clock, Globe, Loader2,
} from "lucide-react";
import { usePlatform } from "@/contexts/PlatformContext";
import { PageHeader } from "@/components/control/PageHeader";
import { SectionLabel } from "@/components/control/SectionLabel";
import { StatusBadge } from "@/components/control/StatusBadge";
import { createProductOnBackend } from "@/lib/platformApi";

// ── Tab definitions ────────────────────────────────────────────────────────────
const TABS = [
  { id: "general",  label: "General",     icon: Building2 },
  { id: "products", label: "Products",    icon: Package },
  { id: "security", label: "Security",    icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
];

// ── General settings tab ───────────────────────────────────────────────────────
function GeneralTab() {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-6 space-y-5">
        <SectionLabel>Company</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Company Name</label>
            <input
              type="text"
              defaultValue="Afrisinc Technologies"
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Platform URL</label>
            <input
              type="text"
              defaultValue="control.afrisinc.com"
              disabled
              className="w-full h-9 px-3 rounded-lg border border-input bg-muted text-muted-foreground text-sm cursor-not-allowed"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Support Email (default)</label>
          <input
            type="email"
            defaultValue="support@afrisinc.com"
            className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          <p className="text-xs text-muted-foreground mt-1.5">Used in outgoing support emails when no product-level email is set.</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-5">
        <SectionLabel>Session Settings</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Inactivity Timeout</label>
            <div className="relative">
              <select className="w-full h-9 px-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                <option>8 hours (recommended)</option>
                <option>4 hours</option>
                <option>12 hours</option>
                <option>24 hours</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Refresh Token Duration</label>
            <div className="relative">
              <select className="w-full h-9 px-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                <option>30 days</option>
                <option>7 days</option>
                <option>14 days</option>
                <option>60 days</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>
    </div>
  );
}

// ── Products tab ───────────────────────────────────────────────────────────────
function ProductsTab() {
  const { products, addProduct, currentUser } = usePlatform();
  const [showAdd,  setShowAdd]  = useState(false);
  const [newName,  setNewName]  = useState("");
  const [newCode,  setNewCode]  = useState("");
  const [newDesc,  setNewDesc]  = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [saving,   setSaving]   = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleSaveProduct() {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    setSaveError("");

    const code         = newCode.trim().toUpperCase() || name.toUpperCase().slice(0, 4);
    const description  = newDesc.trim() || `${name} product module.`;
    const supportEmail = newEmail.trim() || `support-${name.toLowerCase().replace(/\s+/g, "")}@afrisinc.com`;

    // ── Try backend persistence first (requires JWT) ─────────────────────
    let persisted = false;
    if (currentUser.token) {
      const result = await createProductOnBackend(currentUser.token, { name, code, description });
      if (result) {
        // Use the backend-assigned ID and createdAt
        addProduct({ ...result, supportEmail });
        persisted = true;
      }
    }

    // ── Fall back to local-only creation ────────────────────────────────
    if (!persisted) {
      addProduct({
        id:           name.toLowerCase().replace(/\s+/g, "-"),
        name,
        code,
        description,
        status:       "Active",
        supportEmail,
        createdAt:    new Date().toISOString().split("T")[0],
      });
    }

    setSaving(false);
    setNewName(""); setNewCode(""); setNewDesc(""); setNewEmail("");
    setShowAdd(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Products are modules in the platform. Adding a product requires no code changes — it is a database entry.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Existing products */}
      <div className="space-y-3">
        {products.map((p) => (
          <div key={p.id} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
                    <span className="text-xs font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">{p.code}</span>
                    <StatusBadge label={p.status} variant="product" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{p.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">Support email: <span className="font-medium text-foreground">{p.supportEmail}</span></p>
                </div>
              </div>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors shrink-0">
                <Settings className="h-3.5 w-3.5" /> Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add product form (inline) */}
      {showAdd && (
        <div className="bg-card rounded-xl border border-primary/30 p-6 space-y-4">
          <SectionLabel>New Product</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Display Name</label>
              <input
                type="text"
                placeholder="e.g. CRM"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Product Code</label>
              <input
                type="text"
                placeholder="e.g. CRM"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring uppercase transition-shadow"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Short Description</label>
            <input
              type="text"
              placeholder="What this product does in one sentence…"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Support Email</label>
            <input
              type="email"
              placeholder="support-crm@afrisinc.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
          {saveError && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">{saveError}</p>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setShowAdd(false); setNewName(""); setNewCode(""); setNewDesc(""); setNewEmail(""); setSaveError(""); }}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProduct}
              disabled={!newName.trim() || saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? "Saving…" : "Save Product"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Security tab ───────────────────────────────────────────────────────────────
function SecurityTab() {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAScope, setTwoFAScope] = useState<"all" | "admins">("admins");

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Two-Factor Authentication (2FA)</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Require 2FA for team members. Recommended for all admin-level roles.
            </p>
          </div>
          <button
            onClick={() => setTwoFAEnabled((v) => !v)}
            className="shrink-0 transition-colors"
          >
            {twoFAEnabled
              ? <ToggleRight className="h-7 w-7 text-primary" />
              : <ToggleLeft className="h-7 w-7 text-muted-foreground" />}
          </button>
        </div>
        {twoFAEnabled && (
          <div className="mt-4 pt-4 border-t border-border">
            <SectionLabel className="mb-3">Enforce 2FA for</SectionLabel>
            <div className="flex gap-3">
              {[
                { value: "admins", label: "Admin roles only" },
                { value: "all",    label: "All team members" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="2fa-scope"
                    value={opt.value}
                    checked={twoFAScope === opt.value}
                    onChange={() => setTwoFAScope(opt.value as "all" | "admins")}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">Account Lockout Policy</h3>
        <p className="text-sm text-muted-foreground mb-4">
          After 5 failed login attempts, accounts are locked for 15 minutes. Super Admin can unlock manually.
        </p>
        <div className="bg-muted/40 rounded-lg divide-y divide-border">
          {[
            { label: "Max Failed Attempts", value: "5" },
            { label: "Lockout Duration",    value: "15 minutes" },
            { label: "Manual Unlock",       value: "Super Admin only" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <span className="text-sm font-medium text-foreground">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Notifications tab ──────────────────────────────────────────────────────────
function NotificationsTab() {
  const alerts = [
    { label: "New user created",          desc: "Email alert when a new team member is added." },
    { label: "Failed login (5 attempts)", desc: "Alert when an account is locked." },
    { label: "Ticket escalation",         desc: "Notify on ticket escalations." },
    { label: "Product status change",     desc: "Alert when a product is activated or deactivated." },
    { label: "Data export",               desc: "Alert when any user exports data." },
  ];

  const [enabled, setEnabled] = useState(alerts.map(() => true));

  return (
    <div className="bg-card rounded-xl border border-border divide-y divide-border">
      {alerts.map((alert, i) => (
        <div key={alert.label} className="flex items-start justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-foreground">{alert.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{alert.desc}</p>
          </div>
          <button
            onClick={() => setEnabled((prev) => prev.map((v, idx) => (idx === i ? !v : v)))}
            className="shrink-0 transition-colors"
          >
            {enabled[i]
              ? <ToggleRight className="h-6 w-6 text-primary" />
              : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PlatformSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabContent: Record<string, React.ReactNode> = {
    general:       <GeneralTab />,
    products:      <ProductsTab />,
    security:      <SecurityTab />,
    notifications: <NotificationsTab />,
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Platform Settings"
        subtitle="Global configuration for Afrisinc Control — applies across all products and users."
      />

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>{tabContent[activeTab]}</div>
    </div>
  );
}
