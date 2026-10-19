'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { memberApi, apiError, MemberProfile } from '@/lib/api/memberApi';
import { CopyField, Notice } from './ui';
import { cn } from '@/lib/utils';

const TARGETS = [
  ['store', 'Shop with me'],
  ['member', 'Sign up as a member'],
  ['join', 'Become a partner'],
] as const;

/** Invite code, link and QR code, with a choice of where the link leads. */
export default function InviteCard({ member }: { member: MemberProfile }) {
  const qc = useQueryClient();
  const [target, setTarget] = useState<(typeof TARGETS)[number][0]>('store');
  const [qr, setQr] = useState('');
  const [editing, setEditing] = useState(false);
  const [code, setCode] = useState(member.inviteAlias ?? '');
  const link = member.links?.[target] ?? '';

  useEffect(() => {
    if (!link) return;
    QRCode.toDataURL(link, { margin: 1, width: 360, color: { dark: '#1a1a1a', light: '#ffffff' } })
      .then(setQr)
      .catch(() => setQr(''));
  }, [link]);

  const save = useMutation({
    mutationFn: () => memberApi.setInviteCode(code),
    onSuccess: (data) => {
      qc.setQueryData(['member-me'], data);
      setEditing(false);
    },
  });

  return (
    <div className="border border-line p-5 sm:p-6 min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[1.3rem] font-light">Share and earn</h2>
          <p className="mt-1 text-[0.9rem] text-gray-600 font-light">
            Friends who use your code or link are linked to you. You earn {member.settings.referralCommissionPct}% on every order they place, once delivered.
            {member.welcomeDiscountPct > 0 && ` New customers get ${member.welcomeDiscountPct}% off their first order.`}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-[0.72rem] uppercase tracking-[0.08em] text-muted">Your invite code</p>
          <p className="text-[1.25rem] tracking-[0.04em]">{member.inviteCode}</p>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-[0.8rem] underline underline-offset-4 text-muted hover:text-ink">
              {member.inviteAlias ? 'Change code' : 'Personalise'}
            </button>
          )}
        </div>
      </div>

      {editing && (
        <form
          className="mt-4 flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <label className="flex-1 min-w-[12rem]">
            <span className="block text-[0.85rem] mb-1.5">Personal code (letters, numbers, dashes)</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
              maxLength={20}
              placeholder="SARA-BEAUTY"
              className="w-full h-11 px-3 border border-line focus:outline-none focus:border-ink"
            />
          </label>
          <button type="submit" disabled={save.isPending || code.length < 4} className="btn-ink h-11">
            {save.isPending ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="btn-line h-11">
            Cancel
          </button>
          <p className="w-full text-[0.8rem] text-muted">Your member code {member.memberCode} keeps working too. You can change this once every 30 days.</p>
          {save.isError && <div className="w-full"><Notice tone="error">{apiError(save.error)}</Notice></div>}
        </form>
      )}

      <div className="mt-5 flex gap-1 flex-wrap">
        {TARGETS.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTarget(k)}
            className={cn('px-3 py-1.5 rounded-full border text-[0.8rem]', target === k ? 'bg-ink text-white border-ink' : 'border-line hover:border-ink')}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-5 items-start">
        <CopyField label="Your link" value={link} />
        {qr && (
          <div className="flex flex-col items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR code for your link" className="w-32 h-32 border border-line" />
            <a href={qr} download={`azeeora-${member.inviteCode}-${target}.png`} className="text-[0.8rem] underline underline-offset-4">
              Download QR
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
