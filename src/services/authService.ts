// Auth service — mocked, swap to real API later
// POST /auth/token
// GET  /auth/me
// POST /auth/logout

const delay = (ms = 800) => new Promise((r) => setTimeout(r, ms));

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

const MOCK_USER: AuthUser = {
  id: "usr_1",
  email: "john@afrisinc.com",
  name: "John Doe",
  avatar: "JD",
};

export const authService = {
  exchangeCode: async (code: string): Promise<{ user: AuthUser; tokens: AuthTokens }> => {
    await delay(1500);
    if (!code) throw new Error("Invalid authorization code");
    return {
      user: MOCK_USER,
      tokens: {
        access_token: `at_${crypto.randomUUID()}`,
        refresh_token: `rt_${crypto.randomUUID()}`,
        expires_at: Date.now() + 3600 * 1000,
      },
    };
  },

  getMe: async (): Promise<AuthUser> => {
    await delay(300);
    return MOCK_USER;
  },

  logout: async (): Promise<void> => {
    await delay(200);
  },

  /** Store tokens securely */
  storeTokens: (tokens: AuthTokens) => {
    localStorage.setItem("afrisinc_access_token", tokens.access_token);
    localStorage.setItem("afrisinc_refresh_token", tokens.refresh_token);
    localStorage.setItem("afrisinc_token_expiry", String(tokens.expires_at));
  },

  getStoredToken: (): string | null => localStorage.getItem("afrisinc_access_token"),

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("afrisinc_access_token");
    const expiry = localStorage.getItem("afrisinc_token_expiry");
    if (!token || !expiry) return false;
    return Date.now() < Number(expiry);
  },

  clearTokens: () => {
    localStorage.removeItem("afrisinc_access_token");
    localStorage.removeItem("afrisinc_refresh_token");
    localStorage.removeItem("afrisinc_token_expiry");
    localStorage.removeItem("afrisinc_active_workspace");
    localStorage.removeItem("afrisinc_active_product");
  },

  storeUser: (user: AuthUser) => {
    localStorage.setItem("afrisinc_user", JSON.stringify(user));
  },

  getStoredUser: (): AuthUser | null => {
    const raw = localStorage.getItem("afrisinc_user");
    return raw ? JSON.parse(raw) : null;
  },
};
