'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { memberApi, apiError } from '@/lib/api/memberApi';

/** Admin: move a member to another sponsor, or remove their sponsor. */
export default function ReallocateButton({ userId, name, invalidate }: { userId: string; name: string; invalidate: string[] }) {
  const qc = useQueryClient();
  const move = useMutation({
    mutationFn: (v: { code: string; note: string }) => memberApi.admin.reallocate(userId, v.code, v.note),
    onSuccess: () => {
      invalidate.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      window.alert('Sponsor updated');
    },
    onError: (e) => window.alert(apiError(e)),
  });
  return (
    <button
      onClick={() => {
        const code = window.prompt(`New sponsor for ${name}: enter the partner's member code or invite code. Leave empty to remove the sponsor.`);
        if (code === null) return;
        const note = window.prompt('Reason (kept in the member history)');
        if (!note || note.trim().length < 3) return;
        move.mutate({ code: code.trim(), note: note.trim() });
      }}
      disabled={move.isPending}
      className="px-3 py-1.5 rounded-lg border text-xs"
    >
      Move sponsor
    </button>
  );
}
