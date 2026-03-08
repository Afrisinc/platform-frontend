import type { Member } from "@/contexts/PlatformContext";

// POST   /workspaces/:wsId/members/invite
// GET    /workspaces/:wsId/members
// PATCH  /workspaces/:wsId/members/:id
// DELETE /workspaces/:wsId/members/:id

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

const MOCK_MEMBERS: Member[] = [
  { id: "1", name: "John Doe", email: "john@afrisinc.com", role: "Owner", status: "Active", joinedAt: "2024-01-15", avatar: "JD" },
  { id: "2", name: "Sarah Chen", email: "sarah@afrisinc.com", role: "Admin", status: "Active", joinedAt: "2024-02-20", avatar: "SC" },
  { id: "3", name: "Emma Wilson", email: "emma@afrisinc.com", role: "Developer", status: "Active", joinedAt: "2024-03-10", avatar: "EW" },
  { id: "4", name: "Michael Brown", email: "michael@afrisinc.com", role: "Developer", status: "Active", joinedAt: "2024-05-01", avatar: "MB" },
  { id: "5", name: "Lisa Park", email: "lisa@afrisinc.com", role: "Viewer", status: "Pending", joinedAt: "2025-03-01", avatar: "LP" },
];

export const memberService = {
  list: async (_wsId: string): Promise<Member[]> => {
    await delay();
    return MOCK_MEMBERS;
  },

  invite: async (_wsId: string, data: { email: string; role: Member["role"] }): Promise<Member> => {
    await delay();
    return { id: crypto.randomUUID(), name: data.email.split("@")[0], email: data.email, role: data.role, status: "Pending", joinedAt: new Date().toISOString(), avatar: data.email.slice(0, 2).toUpperCase() };
  },

  updateRole: async (_wsId: string, memberId: string, role: Member["role"]): Promise<Member> => {
    await delay();
    const m = MOCK_MEMBERS.find((m) => m.id === memberId) ?? MOCK_MEMBERS[0];
    return { ...m, role };
  },

  remove: async (_wsId: string, _memberId: string): Promise<void> => {
    await delay();
  },
};
