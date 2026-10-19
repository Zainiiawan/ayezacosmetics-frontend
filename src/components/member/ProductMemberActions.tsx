'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Share2, ListPlus } from 'lucide-react';
import { RootState } from '@/store';
import { useMember } from '@/lib/member/useMember';
import { toolsApi } from '@/lib/api/toolsApi';
import { apiError } from '@/lib/api/memberApi';
import { money } from './ui';

/** Product page extras: partners share with their code and see what they earn; members add to a list. */
export default function ProductMemberActions({ productId, slug, name, price }: { productId: string; slug: string; name: string; price: number }) {
  const qc = useQueryClient();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const { member } = useMember();
  const [listsOpen, setListsOpen] = useState(false);
  const [note, setNote] = useState('');
  const lists = useQuery({ queryKey: ['fav-lists'], queryFn: toolsApi.lists.mine, enabled: isAuthenticated && listsOpen });
  const add = useMutation({
    mutationFn: async (target: { id?: string; name?: string }) => {
      const id = target.id ?? (await toolsApi.lists.create(target.name ?? 'My favourites'))._id;
      return toolsApi.lists.add(id, productId);
    },
    onSuccess: (l) => {
      setNote(`Added to ${l.name}`);
      setListsOpen(false);
      qc.invalidateQueries({ queryKey: ['fav-lists'] });
    },
    onError: (e) => setNote(apiError(e)),
  });

  const partner = member?.accountType === 'partner' ? member : null;
  const earn = partner ? Math.round((price * partner.settings.referralCommissionPct) / 100) : 0;

  const share = async () => {
    const base = `${window.location.origin}/products/${slug}`;
    const url = partner?.inviteCode ? `${base}?ref=${encodeURIComponent(partner.inviteCode)}` : base;
    try {
      if (navigator.share) await navigator.share({ title: `${name} | Azeeora`, url });
      else {
        await navigator.clipboard.writeText(url);
        setNote('Link copied');
      }
    } catch {
      // share sheet closed
    }
  };

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.85rem]">
        <button onClick={share} className="inline-flex items-center gap-2 text-ink underline underline-offset-4">
          <Share2 className="w-4 h-4" strokeWidth={1.3} />
          {partner && earn > 0 ? <>Share and earn {money(earn)}</> : 'Share'}
        </button>
        {isAuthenticated ? (
          <button onClick={() => setListsOpen((o) => !o)} aria-expanded={listsOpen} className="inline-flex items-center gap-2 text-ink underline underline-offset-4">
            <ListPlus className="w-4 h-4" strokeWidth={1.3} /> Add to list
          </button>
        ) : (
          <Link href={`/login?redirect=/products/${slug}`} className="inline-flex items-center gap-2 text-muted underline underline-offset-4">
            <ListPlus className="w-4 h-4" strokeWidth={1.3} /> Sign in to save to a list
          </Link>
        )}
      </div>
      {listsOpen && (
        <div className="border border-line p-4 max-w-sm space-y-2">
          {lists.isLoading ? (
            <p className="text-[0.85rem] text-muted">Loading…</p>
          ) : (
            <>
              {(lists.data ?? []).map((l) => (
                <button key={l._id} disabled={add.isPending} onClick={() => add.mutate({ id: l._id })} className="block w-full text-left text-[0.9rem] py-1.5 hover:underline">
                  {l.name} <span className="text-muted text-[0.78rem]">({l.items.length})</span>
                </button>
              ))}
              <NewListRow disabled={add.isPending} onCreate={(n) => add.mutate({ name: n })} />
            </>
          )}
        </div>
      )}
      {partner && earn > 0 && <p className="text-[0.78rem] text-muted">Your link carries your code, so you earn {partner.settings.referralCommissionPct}% when friends buy.</p>}
      {note && <p className="text-[0.82rem] text-[#2f7d4f]" role="status">{note}</p>}
    </div>
  );
}

function NewListRow({ onCreate, disabled }: { onCreate: (name: string) => void; disabled: boolean }) {
  const [n, setN] = useState('');
  return (
    <form
      className="flex gap-2 pt-2 border-t border-line"
      onSubmit={(e) => {
        e.preventDefault();
        if (n.trim()) onCreate(n.trim());
      }}
    >
      <input value={n} onChange={(e) => setN(e.target.value)} maxLength={60} placeholder="New list name" className="flex-1 min-w-0 h-9 px-2 border border-line text-[0.85rem]" />
      <button disabled={disabled || !n.trim()} className="btn-ink h-9 text-[0.72rem]">Create</button>
    </form>
  );
}
