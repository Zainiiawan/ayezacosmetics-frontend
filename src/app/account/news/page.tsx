'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AccountShell from '@/components/member/AccountShell';
import { Notice } from '@/components/member/ui';
import { toolsApi, NEWS_CATEGORIES } from '@/lib/api/toolsApi';
import { cn, formatDate } from '@/lib/utils';

export default function NewsPage() {
  const [category, setCategory] = useState('');
  const { data = [], isLoading } = useQuery({ queryKey: ['news-feed', category], queryFn: () => toolsApi.news.feed(category || undefined) });
  const [open, setOpen] = useState<string | null>(null);
  return (
    <AccountShell title="What's new" intro="Launches, offers, events and updates for our community.">
      <div className="flex flex-wrap gap-2 mb-6">
        {[['', 'All'] as [string, string], ...NEWS_CATEGORIES].map(([k, label]) => (
          <button key={k || 'all'} onClick={() => setCategory(k)} className={cn('px-3 py-1.5 rounded-full border text-[0.82rem]', category === k ? 'bg-ink text-white border-ink' : 'border-line hover:border-ink')}>
            {label}
          </button>
        ))}
      </div>
      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : data.length === 0 ? (
        <Notice>Nothing here yet. Check back soon.</Notice>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {data.map((n) => (
            <article key={n._id} id={n._id} className="border border-line flex flex-col scroll-mt-28">
              {n.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={n.image} alt="" className="w-full h-52 object-cover" />
              )}
              <div className="p-6 flex flex-col flex-1">
                <p className="text-[0.7rem] uppercase tracking-[0.1em] text-rose">
                  {n.category}
                  {n.pinned && ' · Featured'}
                  {n.audience === 'partners' && ' · Partners'}
                </p>
                <h2 className="mt-2 text-[1.3rem] font-light leading-snug">{n.title}</h2>
                <p className="mt-1 text-[0.78rem] text-muted">{formatDate(n.createdAt)}</p>
                {n.summary && <p className="mt-3 text-[0.92rem] text-gray-600 font-light">{n.summary}</p>}
                {open === n._id && n.body && <div className="mt-4 text-[0.92rem] text-gray-700 font-light whitespace-pre-line leading-relaxed">{n.body}</div>}
                <div className="mt-auto pt-5 flex gap-5 text-[0.85rem]">
                  {n.body && (
                    <button onClick={() => setOpen(open === n._id ? null : n._id)} className="underline underline-offset-4">
                      {open === n._id ? 'Show less' : 'Read more'}
                    </button>
                  )}
                  {n.link && (
                    <a href={n.link} className="underline underline-offset-4" {...(/^https?:/.test(n.link) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                      Open
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
