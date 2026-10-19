'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AccountShell from '@/components/member/AccountShell';
import { CopyField, Notice, money } from '@/components/member/ui';
import { toolsApi } from '@/lib/api/toolsApi';
import { apiError } from '@/lib/api/memberApi';

export default function ListsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ['fav-lists'], queryFn: toolsApi.lists.mine });
  const [name, setName] = useState('');
  const refresh = () => qc.invalidateQueries({ queryKey: ['fav-lists'] });
  const create = useMutation({ mutationFn: () => toolsApi.lists.create(name), onSuccess: () => { setName(''); refresh(); } });
  const toggle = useMutation({ mutationFn: (l: { id: string; name: string; isPublic: boolean }) => toolsApi.lists.update(l.id, l.name, l.isPublic), onSuccess: refresh });
  const remove = useMutation({ mutationFn: (id: string) => toolsApi.lists.remove(id), onSuccess: refresh });
  const removeItem = useMutation({ mutationFn: (p: { id: string; productId: string }) => toolsApi.lists.removeItem(p.id, p.productId), onSuccess: refresh });
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <AccountShell title="Favourite lists" intro="Save products into lists, like a routine or a gift idea, and share them with a link.">
      <form
        className="flex flex-wrap gap-2 items-end mb-8"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <label className="flex-1 min-w-[14rem] max-w-sm">
          <span className="block text-[0.85rem] mb-1.5">New list</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="e.g. Night routine" className="w-full h-11 px-3 border border-line focus:outline-none focus:border-ink" />
        </label>
        <button type="submit" disabled={!name.trim() || create.isPending} className="btn-ink h-11">Create list</button>
        <Link href="/wishlist" className="btn-line h-11">My wishlist</Link>
      </form>
      {create.isError && <div className="mb-6"><Notice tone="error">{apiError(create.error)}</Notice></div>}
      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : data.length === 0 ? (
        <Notice>No lists yet. Create one, then use &ldquo;Add to list&rdquo; on any product.</Notice>
      ) : (
        <div className="space-y-8">
          {data.map((l) => (
            <section key={l._id} className="border border-line p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[1.25rem] font-light">{l.name}</h2>
                  <p className="text-[0.8rem] text-muted">
                    {l.items.length} product{l.items.length === 1 ? '' : 's'} · {l.isPublic ? 'Anyone with the link can view' : 'Private'}
                  </p>
                </div>
                <div className="flex gap-4 text-[0.82rem]">
                  <button onClick={() => toggle.mutate({ id: l._id, name: l.name, isPublic: !l.isPublic })} className="underline underline-offset-4">
                    Make {l.isPublic ? 'private' : 'shareable'}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete the list "${l.name}"?`)) remove.mutate(l._id);
                    }}
                    className="underline underline-offset-4 text-sale"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {l.isPublic && (
                <div className="mt-4 max-w-xl">
                  <CopyField label="Share link" value={`${origin}/lists/${l.shareToken}`} />
                </div>
              )}
              {l.items.length > 0 && (
                <ul className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {l.items.map((p) => (
                    <li key={p._id} className="group">
                      <Link href={`/products/${p.slug}`} className="block aspect-square bg-tile overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                      </Link>
                      <p className="mt-2 text-[0.85rem] line-clamp-2">{p.name}</p>
                      <p className="text-[0.85rem]">{money(p.price)}</p>
                      <button onClick={() => removeItem.mutate({ id: l._id, productId: p._id })} className="text-[0.75rem] text-muted underline underline-offset-4">
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
