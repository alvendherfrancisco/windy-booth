// Proxy for the Philippine Standard Geographic Code (PSGC) API.
// Returns normalized cascading options: regions -> cities/municipalities (with
// province) -> barangays. Centralized so the frontend never depends on PSGC's
// exact schema or CORS behavior.

const PSGC = "https://psgc.gitlab.io/api";

async function get(path) {
  const res = await fetch(`${PSGC}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`PSGC ${path} -> ${res.status}`);
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const { level, code } = await req.json();

    if (level === "regions") {
      const regions = await get("/regions/");
      const data = regions
        .map((r) => ({ code: r.code, name: r.name || r.regionName || "" }))
        .filter((r) => r.code && r.name)
        .sort((a, b) => a.name.localeCompare(b.name));
      return Response.json({ data });
    }

    if (level === "cities" && code) {
      const [cities, provinces] = await Promise.all([
        get(`/regions/${code}/cities-municipalities/`),
        get(`/regions/${code}/provinces/`).catch(() => []),
      ]);
      const provMap = {};
      provinces.forEach((p) => { provMap[p.code] = p.name; });
      const data = cities
        .map((c) => {
          // City code is XX PP MM 000 -> province code is XX PP 00000.
          const provCode = String(c.code).slice(0, 5) + "0000";
          return { code: c.code, name: c.name, province: provMap[provCode] || "" };
        })
        .filter((c) => c.code && c.name)
        .sort((a, b) => (a.province + a.name).localeCompare(b.province + b.name));
      return Response.json({ data });
    }

    if (level === "barangays" && code) {
      const brgys = await get(`/cities-municipalities/${code}/barangays/`);
      const data = brgys
        .map((b) => ({ code: b.code, name: b.name }))
        .filter((b) => b.code && b.name)
        .sort((a, b) => a.name.localeCompare(b.name));
      return Response.json({ data });
    }

    return Response.json({ error: "invalid params" }, { status: 400 });
  } catch (error) {
    console.error("phLocations error", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});