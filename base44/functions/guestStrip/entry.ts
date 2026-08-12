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

// Server-side guest session tracking. Each device/IP gets exactly ONE
// GuestSession record per day holding a running count — instead of counting
// every Strip a guest ever created. This guarantees the count stays
// consistent no matter how many tabs are opened or closed, since it's a
// single row incremented server-side, not re-derived by scanning strips.
// Matching by device_id OR ip means clearing browser data (wiping the
// stored device_id) still resolves to the same day's record via IP, so the
// daily cap can't be bypassed by a fresh browser profile alone.
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function findSession(base44, deviceId, ip, dateKey) {
  const query = deviceId
    ? { date: dateKey, $or: [{ device_id: deviceId }, { guest_ip: ip }] }
    : { date: dateKey, guest_ip: ip };
  const existing = await base44.asServiceRole.entities.GuestSession.filter(query);
  return existing[0] || null;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const ip = getClientIp(req);
    const deviceId = body.device_id || null;
    const dateKey = todayKey();

    if (body.action === 'usage') {
      const session = await findSession(base44, deviceId, ip, dateKey);
      return Response.json({ count: session?.count || 0, limit: DAILY_LIMIT });
    }

    if (body.action === 'create') {
      const session = await findSession(base44, deviceId, ip, dateKey);
      const count = session?.count || 0;
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
        guest_device_id: deviceId || undefined,
        template_id,
        photo_urls,
        video_urls: video_urls || [],
        is_video: !!is_video,
        created_at: now,
        expires_at: null,
        saved: true,
        filter_applied: filter_applied || 'none',
      });
      if (session) {
        await base44.asServiceRole.entities.GuestSession.update(session.id, {
          count: count + 1,
          guest_ip: ip,
          device_id: deviceId || session.device_id,
        });
      } else {
        await base44.asServiceRole.entities.GuestSession.create({
          device_id: deviceId || undefined,
          guest_ip: ip,
          date: dateKey,
          count: 1,
        });
      }
      return Response.json({ strip });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}