import type { ActivityItem } from "@/contexts/PlatformContext";

// GET /workspaces/:wsId/activity

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    action: "John invited Emma",
    detail: "emma@afrisinc.com added as Developer",
    time: "2 min ago",
  },
  {
    id: "2",
    action: "Emma created API key",
    detail: "CI/CD Pipeline key generated",
    time: "1 hour ago",
  },
  {
    id: "3",
    action: "Notify product activated",
    detail: "Notify enabled for workspace",
    time: "3 hours ago",
  },
  { id: "4", action: "Sarah updated billing", detail: "Plan upgraded to Pro", time: "1 day ago" },
  { id: "5", action: "CRM sync completed", detail: "2,340 contacts imported", time: "2 days ago" },
];

export const activityService = {
  list: async (_wsId: string): Promise<ActivityItem[]> => {
    await delay();
    return MOCK_ACTIVITIES;
  },
};
