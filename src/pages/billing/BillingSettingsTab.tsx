import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { useBillingSettings, useUpdateBillingSettings } from "@/hooks/useBilling";
import { usePlatform } from "@/contexts/PlatformContext";
import { Skeleton } from "@/components/ui/skeleton";
import type { BillingSettings } from "@/services/billingService";

export default function BillingSettingsTab() {
  const { currentWorkspace } = usePlatform();
  const { data, isLoading } = useBillingSettings(currentWorkspace.id);
  const update = useUpdateBillingSettings(currentWorkspace.id);
  const [form, setForm] = useState<BillingSettings | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (isLoading || !form) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  const set = (key: keyof BillingSettings, value: string | boolean) =>
    setForm({ ...form, [key]: value });
  const setAddr = (key: keyof BillingSettings["address"], value: string) =>
    setForm({ ...form, address: { ...form.address, [key]: value } });

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Billing Email */}
      <Section title="Billing Contact">
        <Field
          label="Billing email"
          value={form.billingEmail}
          onChange={(v) => set("billingEmail", v)}
        />
      </Section>

      {/* Company Info */}
      <Section title="Company Information">
        <Field
          label="Company name"
          value={form.companyName}
          onChange={(v) => set("companyName", v)}
        />
        <Field label="Tax ID / VAT" value={form.taxId} onChange={(v) => set("taxId", v)} />
      </Section>

      {/* Address */}
      <Section title="Billing Address">
        <Field
          label="Address line 1"
          value={form.address.line1}
          onChange={(v) => setAddr("line1", v)}
        />
        <Field
          label="Address line 2"
          value={form.address.line2}
          onChange={(v) => setAddr("line2", v)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Field label="City" value={form.address.city} onChange={(v) => setAddr("city", v)} />
          <Field
            label="State / Province"
            value={form.address.state}
            onChange={(v) => setAddr("state", v)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Postal code"
            value={form.address.postalCode}
            onChange={(v) => setAddr("postalCode", v)}
          />
          <Field
            label="Country"
            value={form.address.country}
            onChange={(v) => setAddr("country", v)}
          />
        </div>
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Auto-pay</p>
            <p className="text-xs text-muted-foreground">
              Automatically charge default payment method on invoice date.
            </p>
          </div>
          <button
            onClick={() => set("autoPay", !form.autoPay)}
            className={`w-11 h-6 rounded-full transition-colors relative ${form.autoPay ? "bg-primary" : "bg-muted"}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${form.autoPay ? "left-[22px]" : "left-0.5"}`}
            />
          </button>
        </div>
        <Field label="Currency" value={form.currency} onChange={(v) => set("currency", v)} />
      </Section>

      <button
        onClick={() => update.mutate(form)}
        disabled={update.isPending}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {update.isPending ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5">{label}</label>
      <input
        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
