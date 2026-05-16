/**
 * AdminFormModal Component
 * Reusable modal for admin forms (create/edit)
 */

import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";

interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number";
  placeholder?: string;
  value?: string | number;
  required?: boolean;
  options?: { value: string; label: string }[];
  error?: string;
}

interface AdminFormModalProps {
  title: string;
  fields: FormField[];
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
  isLoading?: boolean;
  submitLabel?: string;
}

export function AdminFormModal({
  title,
  fields: initialFields,
  onSubmit,
  onClose,
  isOpen,
  isLoading = false,
  submitLabel = "Save",
}: AdminFormModalProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialData: Record<string, unknown> = {};
      initialFields.forEach((field) => {
        initialData[field.name] = field.value || "";
      });
      setFormData(initialData);
      setErrors({});
    }
  }, [isOpen, initialFields]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    initialFields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setErrors((prev) => ({ ...prev, _form: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            disabled={isLoading || isSubmitting}
            className="p-1 rounded-md hover:bg-muted disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Form Error */}
          {errors._form && (
            <div className="flex gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{errors._form}</p>
            </div>
          )}

          {/* Form Fields */}
          {initialFields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-foreground mb-1">
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  placeholder={field.placeholder}
                  value={(formData[field.name] as string) || ""}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-md border ${
                    errors[field.name] ? "border-destructive" : "border-border"
                  } bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none`}
                />
              ) : field.type === "select" ? (
                <select
                  name={field.name}
                  value={(formData[field.name] as string) || ""}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-md border ${
                    errors[field.name] ? "border-destructive" : "border-border"
                  } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20`}
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={(formData[field.name] as string | number) || ""}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-md border ${
                    errors[field.name] ? "border-destructive" : "border-border"
                  } bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20`}
                />
              )}

              {errors[field.name] && (
                <p className="text-xs text-destructive mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isSubmitting}
              className="flex-1 px-4 py-2 rounded-md border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
