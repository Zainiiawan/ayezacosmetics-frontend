import { NextRequest } from 'next/server';

/**
 * Same-origin relay to the API, used only when NEXT_PUBLIC_API_PROXY=true
 * (preview domains the backend's CORS list does not include). It forwards the
 * request as-is, minus the browser's Origin header, so the backend treats it
 * like a server-to-server call.
 */
export const dynamic = 'force-dynamic';

const BACKEND = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace(/\/$/, '');
const FORWARD_HEADERS = ['authorization', 'content-type', 'accept', 'accept-language', 'user-agent', 'cookie'];

async function relay(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  if (process.env.NEXT_PUBLIC_API_PROXY !== 'true') return new Response('Not found', { status: 404 });
  const { path } = await params;
  const target = `${BACKEND}/${path.map(encodeURIComponent).join('/')}${req.nextUrl.search}`;

  const headers = new Headers();
  for (const h of FORWARD_HEADERS) {
    const v = req.headers.get(h);
    if (v) headers.set(h, v);
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (ip) headers.set('x-forwarded-for', ip);

  const hasBody = !['GET', 'HEAD'].includes(req.method);
  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers,
      body: hasBody ? await req.arrayBuffer() : undefined,
      cache: 'no-store',
      redirect: 'manual',
    });
  } catch {
    return Response.json({ success: false, message: 'The store is waking up. Please try again in a moment.' }, { status: 503 });
  }

  const out = new Headers();
  for (const h of ['content-type', 'cache-control', 'content-disposition']) {
    const v = upstream.headers.get(h);
    if (v) out.set(h, v);
  }
  return new Response(upstream.body, { status: upstream.status, headers: out });
}

export { relay as GET, relay as POST, relay as PUT, relay as PATCH, relay as DELETE };
