import { apiFetch } from "@/lib/api";
import type { UserProduct } from "@/contexts/PlatformContext";

// GET /products/me - Get user's enrolled products

/** Product icon mapping based on product code. */
const PRODUCT_ICON_MAP: Record<string, string> = {
  NOTIFY: "Bell",
  CRM: "Users",
  BILLING: "CreditCard",
  PAYMENTS: "CreditCard",
  PAY: "CreditCard",
  ANALYTICS: "BarChart3",
  ANA: "BarChart3",
  VPN: "Shield",
};

/** Product color mapping based on product code (HSL format). */
const PRODUCT_COLOR_MAP: Record<string, string> = {
  NOTIFY: "202 97% 45%",
  CRM: "152 60% 42%",
  BILLING: "38 92% 50%",
  PAYMENTS: "38 92% 50%",
  PAY: "38 92% 50%",
  ANALYTICS: "270 60% 55%",
  ANA: "270 60% 55%",
  VPN: "340 65% 50%",
};

/** Default values for unmapped products. */
const DEFAULT_COLOR = "220 14% 46%";
const DEFAULT_ICON = "Package";

export const productService = {
  /**
   * Get products enrolled by the current user.
   * Calls GET /products/me
   */
  getUserProducts: async (): Promise<UserProduct[]> => {
    const products = await apiFetch<UserProduct[]>("/auth/products/me");
    return products;
  },

  /**
   * Get icon name for a product based on its code.
   */
  getProductIcon: (code: string): string => {
    return PRODUCT_ICON_MAP[code.toUpperCase()] ?? DEFAULT_ICON;
  },

  /**
   * Get HSL color for a product based on its code.
   */
  getProductColor: (code: string): string => {
    return PRODUCT_COLOR_MAP[code.toUpperCase()] ?? DEFAULT_COLOR;
  },
};
