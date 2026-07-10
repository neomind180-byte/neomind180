import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Rate limiting: max 20 log requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

// Use service role key so logs persist even when the user's auth token is expired
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // Basic rate limiting by IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
    }

    const body = await req.json();
    const events = body?.events;

    if (!Array.isArray(events) || events.length === 0 || events.length > 20) {
      return NextResponse.json({ error: 'Invalid events array' }, { status: 400 });
    }

    // Sanitize and insert events
    const rows = events.map((e: Record<string, unknown>) => ({
      level: String(e.level || 'info').slice(0, 10),
      event: String(e.event || 'unknown').slice(0, 100),
      message: String(e.message || '').slice(0, 1000),
      page: String(e.page || '').slice(0, 200),
      user_id: e.userId ? String(e.userId).slice(0, 50) : null,
      metadata: e.metadata ? JSON.parse(JSON.stringify(e.metadata)) : null,
      created_at: e.timestamp || new Date().toISOString(),
    }));

    const { error } = await supabaseAdmin.from('app_logs').insert(rows);

    if (error) {
      console.error('[Log API] Insert error:', error.message);
      return NextResponse.json({ error: 'Failed to store logs' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Log API] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
