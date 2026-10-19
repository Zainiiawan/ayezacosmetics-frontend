'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@tanstack/react-query';
import { setCredentials } from '@/store/slices/authSlice';
import { toolsApi } from '@/lib/api/toolsApi';
import { apiError } from '@/lib/api/memberApi';
import { Field, Notice } from '@/components/member/ui';

/** A friend registered by a Brand Partner chooses a password here. */
export default function ActivateClient() {
  const token = useSearchParams()?.get('token') ?? '';
  const router = useRouter();
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const info = useQuery({ queryKey: ['activation', token], queryFn: () => toolsApi.activation(token), enabled: token.length >= 20, retry: false });
  const activate = useMutation({
    mutationFn: () => toolsApi.activate(token, password),
    onSuccess: (r) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dispatch(setCredentials({ user: r.user as any, accessToken: r.tokens.accessToken, refreshToken: r.tokens.refreshToken }));
      router.replace('/account');
    },
  });

  return (
    <div className="px-4 py-16 max-w-md mx-auto">
      <p className="eyebrow">Welcome to Azeeora</p>
      <h1 className="title text-[2.4rem] mt-2">Activate your account</h1>
      {!token || info.isError ? (
        <div className="mt-6 space-y-4">
          <Notice tone="error">{info.isError ? apiError(info.error) : 'This link is incomplete. Please open the full link you were sent.'}</Notice>
          <Link href="/login" className="btn-line">Go to sign in</Link>
        </div>
      ) : info.isLoading ? (
        <p className="mt-6 text-muted">Checking your link…</p>
      ) : (
        <form
          className="mt-6 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            activate.mutate();
          }}
        >
          <p className="text-gray-600 font-light">
            Hi {info.data?.firstName}, choose a password for <b className="font-medium">{info.data?.email}</b>.
          </p>
          <Field label="Password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} hint="At least 8 characters with upper and lower case letters, a number and a symbol." />
          <Field label="Confirm password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={confirm && confirm !== password ? 'Passwords do not match' : undefined} />
          {activate.isError && <Notice tone="error">{apiError(activate.error)}</Notice>}
          <button type="submit" disabled={!password || password !== confirm || activate.isPending} className="btn-ink">
            {activate.isPending ? 'Activating…' : 'Activate and sign in'}
          </button>
        </form>
      )}
    </div>
  );
}
