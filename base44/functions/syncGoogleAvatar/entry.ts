import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const CONNECTOR_ID = "6a62074fa8eda00e1c8a0e3a";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) {
      const details = await res.text();
      console.error('google userinfo failed', res.status, details);
      return Response.json({ error: 'google_userinfo_failed', status: res.status, details }, { status: 502 });
    }
    const info = await res.json();
    const picture = info.picture;
    if (!picture) return Response.json({ error: 'no_picture' }, { status: 404 });

    await base44.asServiceRole.entities.User.update(user.id, { avatar_url: picture, avatar_source: "google" });
    return Response.json({ avatar_url: picture, avatar_source: "google" });
  } catch (error) {
    console.error('syncGoogleAvatar error', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});