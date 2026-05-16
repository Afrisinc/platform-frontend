/**
 * AdminGuard Component
 * Protects admin routes and only allows super_admin users
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { usePlatform } from "@/contexts/PlatformContext";

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: "super_admin" | "ops_manager";
}

export function AdminGuard({ children, requiredRole = "super_admin" }: AdminGuardProps) {
  const { currentUser } = usePlatform();

  // Check if user is authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required admin role
  const adminRoles = [requiredRole];
  const hasAdminAccess = adminRoles.includes(currentUser.role as any);

  if (!hasAdminAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">403</h1>
          <p className="text-lg text-muted-foreground mb-6">
            You don't have permission to access this page.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
