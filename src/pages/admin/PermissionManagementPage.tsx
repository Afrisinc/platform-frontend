/**
 * Permission Management Page
 * Create, edit, and delete permissions
 */

import React, { useEffect, useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { usePlatform } from "@/contexts/PlatformContext";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { PageHeader } from "@/components/control/PageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminFormModal } from "@/components/admin/AdminFormModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { Permission, FormField } from "@/types/admin";

const PERMISSION_CATEGORIES = [
  { value: "dashboard", label: "Dashboard" },
  { value: "user_management", label: "User Management" },
  { value: "product", label: "Product" },
  { value: "support", label: "Support" },
  { value: "billing", label: "Billing" },
  { value: "analytics", label: "Analytics" },
  { value: "customer", label: "Customer" },
  { value: "settings", label: "Settings" },
  { value: "organization", label: "Organization" },
];

export default function PermissionManagementPage() {
  const { currentUser } = usePlatform();
  const token = currentUser?.token;

  const {
    permissions,
    loading,
    error,
    page,
    totalPages,
    loadPermissions,
    createPermission,
    updatePermission,
    deletePermission,
  } = useAdminPermissions(token!);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);
  const [editingPermissionId, setEditingPermissionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (token) {
      loadPermissions(currentPage);
    }
  }, [token, currentPage]);

  const formFields: FormField[] = [
    {
      name: "name",
      label: "Permission Name",
      type: "text",
      placeholder: "e.g., view_reports, manage_users",
      value: editingPermissionId ? permissions.find((p) => p.id === editingPermissionId)?.name : "",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Describe what this permission allows",
      value: editingPermissionId
        ? permissions.find((p) => p.id === editingPermissionId)?.description
        : "",
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: PERMISSION_CATEGORIES,
      value: editingPermissionId
        ? permissions.find((p) => p.id === editingPermissionId)?.category
        : "",
    },
  ];

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    if (editingPermissionId) {
      await updatePermission(
        editingPermissionId,
        data.name as string,
        data.description as string,
        data.category as string
      );
      setEditingPermissionId(null);
    } else {
      await createPermission(
        data.name as string,
        data.description as string,
        data.category as string
      );
    }
    await loadPermissions(currentPage);
    setShowFormModal(false);
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermissionId(permission.id);
    setShowFormModal(true);
  };

  const handleDeleteClick = (permission: Permission) => {
    setPermissionToDelete(permission);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (permissionToDelete) {
      await deletePermission(permissionToDelete.id);
      setPermissionToDelete(null);
      await loadPermissions(currentPage);
    }
  };

  if (!token) {
    return <div className="p-8 text-center text-muted-foreground">Unauthorized access</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Permission Management"
          subtitle="Manage system permissions and their descriptions"
        />
        <button
          onClick={() => {
            setEditingPermissionId(null);
            setShowFormModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Permission
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

      <AdminTable<Permission>
        columns={[
          {
            key: "name",
            label: "Permission Name",
            render: (value) => <span className="font-medium">{String(value)}</span>,
          },
          {
            key: "description",
            label: "Description",
          },
          {
            key: "category",
            label: "Category",
            render: (value) => (
              <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                {String(value || "uncategorized")}
              </span>
            ),
          },
        ]}
        data={permissions}
        loading={loading}
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <AdminFormModal
        title={editingPermissionId ? "Edit Permission" : "Create Permission"}
        fields={formFields}
        onSubmit={handleFormSubmit}
        onClose={() => {
          setShowFormModal(false);
          setEditingPermissionId(null);
        }}
        isOpen={showFormModal}
        isLoading={loading}
      />

      <ConfirmDialog
        title="Delete Permission"
        message={`Are you sure you want to delete "${permissionToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isOpen={showConfirmDialog}
        isDangerous
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowConfirmDialog(false);
          setPermissionToDelete(null);
        }}
      />
    </div>
  );
}
