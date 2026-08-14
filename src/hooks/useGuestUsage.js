import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { getDeviceId } from "@/lib/deviceId";
import { getGuestUsageCountToday } from "@/lib/guestStrips";

// Guest daily session usage, kept in sync across tabs. Guest strips are
// cached in localStorage, so creating one in a tab fires a `storage` event
// in every other open tab of the same browser — used here to refetch right
// away instead of leaving other tabs showing a stale count until reload.
export function useGuestUsage(enabled) {
  const [guestUsed, setGuestUsed] = useState(null);

  const refresh = useCallback(() => {
    const localCount = getGuestUsageCountToday();
    base44.functions.invoke("guestStrip", { action: "usage", device_id: getDeviceId() })
      .then((r) => setGuestUsed(Math.max((r?.data ?? r)?.count || 0, localCount)))
      .catch(() => setGuestUsed(localCount));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    const onStorage = (e) => { if (!e.key || e.key === "vendi_guest_strips") refresh(); };
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, refresh]);

  return [guestUsed, setGuestUsed];
}