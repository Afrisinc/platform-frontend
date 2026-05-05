/**
 * Role Management Page
 * Full CRUD operations for roles with permission and sidebar assignments
 */

import React, { useEffect, useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';
import { useAdminRoles } from '@/hooks/useAdminRoles';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { useAdminSidebarItems } from '@/hooks/useAdminSidebarItems';
import { useRoleAssignments } from '@/hooks/useRoleAssignments';
import { PageHeader } from '@/components/control/PageHeader';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminFormModal } from '@/components/admin/AdminFormModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import type { Role, FormField } from '@/types/admin';

interface RoleWithStats extends Role {
  permissionCount?: number;
  sidebarItemCount?: number;
  memberCount?: number;
}

export default function RoleManagementPage() {
  const { currentUser } = usePlatform();
  const token = currentUser?.token;

  // Hooks
  const { roles, loading, error, page, totalPages, loadRoles, createRole, updateRole, deleteRole } =
    useAdminRoles(token!);

  const { permissions: allPermissions, loadPermissions } = useAdminPermissions(token!);
  const { items: allSidebarItems, loadSidebarItems } = useAdminSidebarItems(token!);

  // Local state
  const [selectedRole, setSelectedRole] = useState<RoleWithStats | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentType, setAssignmentType] = useState<'permissions' | 'sidebar'>('permissions');

  // Load data on mount
  useEffect(() => {
    if (token) {
      loadRoles();
      loadPermissions();
      loadSidebarItems();
    }
  }, [token]);

  // Role assignment hook (load when role is selected)
  const roleAssignments = selectedRole ? useRoleAssignments(token!, selectedRole.id) : null;

  useEffect(() => {
    if (selectedRole && roleAssignments) {
      roleAssignments.loadRolePermissions();
      roleAssignments.loadRoleSidebarItems();
    }
  }, [selectedRole, roleAssignments]);

  // Form fields for role creation/editing
  const formFields: FormField[] = [
    {
      name: 'name',
      label: 'Role Name',
      type: 'text',
      placeholder: 'e.g., Super Admin, Editor',
      value: editingRoleId ? roles.find((r) => r.id === editingRoleId)?.name : '',
      required: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Describe the purpose of this role',
      value: editingRoleId ? roles.find((r) => r.id === editingRoleId)?.description : '',
    },
  ];

  // Handle form submission
  const handleFormSubmit = async (data: Record<string, unknown>) => {
    if (editingRoleId) {
      await updateRole(editingRoleId, data.name as string, data.description as string);
      setEditingRoleId(null);
    } else {
      const newRole = await createRole(data.name as string, data.description as string);
      setSelectedRole(newRole);
    }
    setShowFormModal(false);
  };

  // Handle edit
  const handleEdit = (role: Role) => {
    setEditingRoleId(role.id);
    setShowFormModal(true);
  };

  // Handle delete
  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (roleToDelete) {
      await deleteRole(roleToDelete.id);
      setRoleToDelete(null);
      setSelectedRole(null);
    }
  };

  // Handle permission assignment
  const handleAssignPermissions = async (permissionIds: string[]) => {
    if (roleAssignments) {
      await roleAssignments.assignPermissions(permissionIds);
      setShowAssignmentModal(false);
    }
  };

  // Handle sidebar assignment
  const handleAssignSidebarItems = async (sidebarItemIds: string[]) => {
    if (roleAssignments) {
      await roleAssignments.assignSidebarItems(sidebarItemIds);
      setShowAssignmentModal(false);
    }
  };

  // Check authorization
  if (!token) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Unauthorized access</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="Role Management"
          subtitle="Create and manage system roles and their permissions"
        />
        <button
          onClick={() => {
            setEditingRoleId(null);
            setShowFormModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Role
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">Error</p>
            <p className="text-sm text-destructive/80">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-foreground mb-4">Roles</h3>
          <AdminTable<RoleWithStats>
            columns={[
              {
                key: 'name',
                label: 'Name',
                render: (value) => <span className="font-medium">{String(value)}</span>,
              },
              {
                key: 'description',
                label: 'Description',
                render: (value) => <span className="text-sm text-muted-foreground line-clamp-2">{String(value || '-')}</span>,
              },
            ]}
            data={roles as RoleWithStats[]}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </div>

        {/* Role Details */}
        {selectedRole && roleAssignments && (
          <div className="lg:col-span-2 space-y-6">
            {/* Role Info */}
            <div className="border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{selectedRole.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedRole.description || 'No description'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Permissions Assigned</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">{roleAssignments.permissions.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sidebar Items</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">{roleAssignments.sidebarItems.length}</p>
                </div>
              </div>
            </div>

            {/* Permissions Tab */}
            <div className="border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground">Permissions</h4>
                <button
                  onClick={() => {
                    setAssignmentType('permissions');
                    setShowAssignmentModal(true);
                  }}
                  className="text-sm px-3 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Manage
                </button>
              </div>

              <div className="space-y-2">
                {roleAssignments.permissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No permissions assigned</p>
                ) : (
                  roleAssignments.permissions.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between p-3 bg-muted rounded border border-border/50"
                    >
                      <div>
                        <p className="font-medium text-sm text-foreground">{perm.name}</p>
                        <p className="text-xs text-muted-foreground">{perm.description}</p>
                      </div>
                      <button
                        onClick={() => roleAssignments.removePermission(perm.id)}
                        className="text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sidebar Items Tab */}
            <div className="border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground">Sidebar Items</h4>
                <button
                  onClick={() => {
                    setAssignmentType('sidebar');
                    setShowAssignmentModal(true);
                  }}
                  className="text-sm px-3 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Manage
                </button>
              </div>

              <div className="space-y-2">
                {roleAssignments.sidebarItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No sidebar items assigned</p>
                ) : (
                  roleAssignments.sidebarItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-muted rounded border border-border/50"
                    >
                      <div>
                        <p className="font-medium text-sm text-foreground flex items-center gap-2">
                          {item.icon && <span>{item.icon}</span>}
                          {item.label}
                        </p>
                        {item.path && <p className="text-xs text-muted-foreground">{item.path}</p>}
                      </div>
                      <button
                        onClick={() => roleAssignments.removeSidebarItem(item.id)}
                        className="text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AdminFormModal
        title={editingRoleId ? 'Edit Role' : 'Create Role'}
        fields={formFields}
        onSubmit={handleFormSubmit}
        onClose={() => {
          setShowFormModal(false);
          setEditingRoleId(null);
        }}
        isOpen={showFormModal}
        isLoading={loading}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        title="Delete Role"
        message={`Are you sure you want to delete the role "${roleToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isOpen={showConfirmDialog}
        isDangerous
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowConfirmDialog(false);
          setRoleToDelete(null);
        }}
      />

      {/* Assignment Modal (Permissions or Sidebar) */}
      {showAssignmentModal && selectedRole && roleAssignments && (
        <AssignmentModal
          title={assignmentType === 'permissions' ? 'Manage Permissions' : 'Manage Sidebar Items'}
          availableItems={assignmentType === 'permissions' ? allPermissions : allSidebarItems}
          selectedItemIds={
            assignmentType === 'permissions'
              ? roleAssignments.permissions.map((p) => p.id)
              : roleAssignments.sidebarItems.map((s) => s.id)
          }
          onSubmit={assignmentType === 'permissions' ? handleAssignPermissions : handleAssignSidebarItems}
          onClose={() => setShowAssignmentModal(false)}
          isOpen={showAssignmentModal}
          itemLabel={assignmentType === 'permissions' ? 'Permission' : 'Sidebar Item'}
          getItemLabel={(item) => (item as any).name || (item as any).label}
        />
      )}
    </div>
  );
}

// Assignment Modal Component
interface AssignmentModalProps {
  title: string;
  availableItems: any[];
  selectedItemIds: string[];
  onSubmit: (itemIds: string[]) => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
  itemLabel: string;
  getItemLabel: (item: any) => string;
}

function AssignmentModal({
  title,
  availableItems,
  selectedItemIds,
  onSubmit,
  onClose,
  isOpen,
  itemLabel,
  getItemLabel,
}: AssignmentModalProps) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set(selectedItemIds));
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleToggle = (itemId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelected(newSelected);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(Array.from(selected));
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border px-6 py-4 sticky top-0 bg-background">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted">
            <Plus className="h-5 w-5 rotate-45" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {availableItems.map((item) => (
            <label key={item.id} className="flex items-start gap-3 p-3 rounded border border-border hover:bg-muted cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={selected.has(item.id)}
                onChange={() => handleToggle(item.id)}
                className="mt-1 rounded border-border"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{getItemLabel(item)}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                )}
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-3 border-t border-border px-6 py-4 bg-muted/50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-md border border-border text-foreground hover:bg-background disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
