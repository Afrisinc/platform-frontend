import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { memberService } from "@/services/memberService";
import type { Member } from "@/contexts/PlatformContext";

export function useMembers(wsId: string) {
  return useQuery({ queryKey: ["members", wsId], queryFn: () => memberService.list(wsId) });
}

export function useInviteMember(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; role: Member["role"] }) => memberService.invite(wsId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members", wsId] }),
  });
}

export function useUpdateMemberRole(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: Member["role"] }) => memberService.updateRole(wsId, memberId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members", wsId] }),
  });
}

export function useRemoveMember(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => memberService.remove(wsId, memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members", wsId] }),
  });
}
