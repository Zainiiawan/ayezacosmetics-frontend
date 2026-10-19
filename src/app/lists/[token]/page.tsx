'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toolsApi } from '@/lib/api/toolsApi';
import { Notice, money } from '@/components/member/ui';

/** A favourite list someone shared by link. */
export default function SharedListPage() {
  const token = String(useParams()?.token ?? '');
  const { data, isLoading, isError } = useQuery({ queryKey: ['shared-list', token], queryFn: () => toolsApi.lists.shared(token), retry: false });
  return (
    <div className="px-4 sm:px-6 lg:px-11 py-10 lg:py-14 max-w-6xl mx-auto">
      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : isError || !data ? (
        <Notice>This list is private or no longer exists.</Notice>
      ) : (
        <>
          <p className="eyebrow">{data.ownerName}&apos;s picks</p>
          <h1 className="title text-[2.4rem] sm:text-[3rem] mt-2">{data.name}</h1>
          {data.items.length === 0 ? (
            <div className="mt-8"><Notice>This list is empty for now.</Notice></div>
          ) : (
            <ul className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
              {data.items.map((p) => (
                <li key={p._id} className="group">
                  <Link href={`/products/${p.slug}`} className="block aspect-[4/5] bg-tile overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                  </Link>
                  <p className="mt-3 text-[0.92rem]">{p.name}</p>
                  <p className="text-[0.92rem]">
                    {money(p.price)}
                    {p.basePrice > p.price && <span className="ml-2 text-muted line-through text-[0.82rem]">{money(p.basePrice)}</span>}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
