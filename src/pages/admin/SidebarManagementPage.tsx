/**
 * Sidebar Management Page
 * Create, edit, and delete sidebar menu items
 */

import React, { useEffect, useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { usePlatform } from "@/contexts/PlatformContext";
import { useAdminSidebarItems } from "@/hooks/useAdminSidebarItems";
import { PageHeader } from "@/components/control/PageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminFormModal } from "@/components/admin/AdminFormModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { SidebarItem, FormField } from "@/types/admin";

const ICON_OPTIONS = [
  { value: "LayoutDashboard", label: "Dashboard" },
  { value: "Users", label: "Users" },
  { value: "UserCog", label: "Settings" },
  { value: "Settings2", label: "Settings Alt" },
  { value: "CreditCard", label: "Billing" },
  { value: "BarChart3", label: "Reports" },
  { value: "ClipboardList", label: "Audit" },
  { value: "Ticket", label: "Tickets" },
  { value: "Package", label: "Products" },
  { value: "ShieldCheck", label: "Security" },
  { value: "Bell", label: "Notifications" },
  { value: "Layers", label: "CRM" },
];

export default function SidebarManagementPage() {
  const { currentUser } = usePlatform();
  const token = currentUser?.token;

  const {
    items,
    loading,
    error,
    page,
    totalPages,
    loadSidebarItems,
    createSidebarItem,
    updateSidebarItem,
    deleteSidebarItem,
  } = useAdminSidebarItems(token!);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SidebarItem | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (token) {
      loadSidebarItems(currentPage);
    }
  }, [token, currentPage]);

  const formFields: FormField[] = [
    {
      name: "label",
      label: "Menu Label",
      type: "text",
      placeholder: "e.g., Dashboard, Users",
      value: editingItemId ? items.find((i) => i.id === editingItemId)?.label : "",
      required: true,
    },
    {
      name: "icon",
      label: "Icon",
      type: "select",
      options: ICON_OPTIONS,
      value: editingItemId ? items.find((i) => i.id === editingItemId)?.icon : "",
    },
    {
      name: "path",
      label: "Route Path",
      type: "text",
      placeholder: "e.g., /dashboard, /users",
      value: editingItemId ? items.find((i) => i.id === editingItemId)?.path : "",
    },
    {
      name: "order",
      label: "Order",
      type: "number",
      value: editingItemId ? items.find((i) => i.id === editingItemId)?.order : 0,
    },
  ];

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    if (editingItemId) {
      await updateSidebarItem(editingItemId, {
        label: data.label as string,
        icon: data.icon as string,
        path: data.path as string,
        order: parseInt(data.order as string),
      });
      setEditingItemId(null);
    } else {
      await createSidebarItem(
        data.label as string,
        data.icon as string,
        data.path as string,
        parseInt(data.order as string)
      );
    }
    await loadSidebarItems(currentPage);
    setShowFormModal(false);
  };

  const handleEdit = (item: SidebarItem) => {
    setEditingItemId(item.id);
    setShowFormModal(true);
  };

  const handleDeleteClick = (item: SidebarItem) => {
    setItemToDelete(item);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await deleteSidebarItem(itemToDelete.id);
      setItemToDelete(null);
      await loadSidebarItems(currentPage);
    }
  };

  if (!token) {
    return <div className="p-8 text-center text-muted-foreground">Unauthorized access</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Sidebar Menu Management"
          subtitle="Create and manage sidebar navigation items"
        />
        <button
          onClick={() => {
            setEditingItemId(null);
            setShowFormModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Menu Item
        </button>
      </div>

      {error && (
        <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">Error</p>
            <p className="text-sm text-destructive/80">{error}</p>
          </div>
        </div>
      )}

      <AdminTable<SidebarItem>
        columns={[
          {
            key: "label",
            label: "Label",
            render: (value) => <span className="font-medium">{String(value)}</span>,
          },
          {
            key: "icon",
            label: "Icon",
          },
          {
            key: "path",
            label: "Route",
          },
          {
            key: "order",
            label: "Order",
            render: (value) => <span className="font-mono">{Number(value)}</span>,
          },
          {
            key: "isActive",
            label: "Status",
            render: (value) => (
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {value ? "Active" : "Inactive"}
              </span>
            ),
          },
        ]}
        data={items}
        loading={loading}
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <AdminFormModal
        title={editingItemId ? "Edit Menu Item" : "Create Menu Item"}
        fields={formFields}
        onSubmit={handleFormSubmit}
        onClose={() => {
          setShowFormModal(false);
          setEditingItemId(null);
        }}
        isOpen={showFormModal}
        isLoading={loading}
      />

      <ConfirmDialog
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${itemToDelete?.label}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isOpen={showConfirmDialog}
        isDangerous
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowConfirmDialog(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
}
