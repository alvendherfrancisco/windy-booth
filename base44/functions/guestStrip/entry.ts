import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const DAILY_LIMIT = 10;

function getClientIp(req) {
  return (
    req.headers.get('cf-connecting-ip') ||
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function todayStartIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

// Server-side guest session tracking, keyed by IP instead of client-side
// storage — this is what the daily session cap actually enforces, so
// clearing localStorage/cookies or revisiting the site can't reset it.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const ip = getClientIp(req);
    const since = todayStartIso();

    if (body.action === 'usage') {
      const strips = await base44.asServiceRole.entities.Strip.filter({ is_guest: true, guest_ip: ip });
      const count = strips.filter((s) => s.created_at >= since).length;
      return Response.json({ count, limit: DAILY_LIMIT });
    }

    if (body.action === 'create') {
      const strips = await base44.asServiceRole.entities.Strip.filter({ is_guest: true, guest_ip: ip });
      const count = strips.filter((s) => s.created_at >= since).length;
      if (count >= DAILY_LIMIT) {
        return Response.json({ error: 'Daily session limit reached' }, { status: 403 });
      }
      const { template_id, photo_urls, video_urls, is_video, filter_applied } = body;
      if (!template_id || !photo_urls) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 });
      }
      const now = new Date().toISOString();
      const strip = await base44.asServiceRole.entities.Strip.create({
        is_guest: true,
        guest_ip: ip,
        template_id,
        photo_urls,
        video_urls: video_urls || [],
        is_video: !!is_video,
        created_at: now,
        expires_at: null,
        saved: true,
        filter_applied: filter_applied || 'none',
      });
      return Response.json({ strip });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}