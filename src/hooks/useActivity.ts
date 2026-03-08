import { useQuery } from "@tanstack/react-query";
import { activityService } from "@/services/activityService";

export function useActivity(wsId: string) {
  return useQuery({ queryKey: ["activity", wsId], queryFn: () => activityService.list(wsId) });
}
