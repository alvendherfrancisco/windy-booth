import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Bell, Check, X } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

const SYSTEM_TYPES = ["order_update", "payment", "subscription", "usage_limit", "storage_expiry", "storage_eviction"];
const NOTIF_LOGO_URL = "https://media.base44.com/images/public/6a60bb3456cf14775962b360/98da874e1_windythepoohnotificationlogo.svg";

function RowAvatar({ item, user }) {
  if (SYSTEM_TYPES.includes(item.type)) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
        <img src={NOTIF_LOGO_URL} alt="windy the pooh" className="h-full w-full object-cover" />
      </div>
    );
  }
  return <UserAvatar user={user} size="sm" />;
}

export default function NotificationsPopover({ open, onClose, notifs, onToggleRead, onMarkAll, user }) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(open);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setLeaving(false);
    } else if (mounted) {
      setLeaving(true);
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!mounted) return null;

  const hasUnread = notifs.some((n) => !n.read);

  const handleRow = (item) => {
    if (!item.read) onToggleRead(item);
    if (item.link && item.link !== "/notifications") {
      onClose();
      navigate(item.link);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={`fixed bottom-20 left-2 right-2 z-50 overflow-hidden rounded-2xl bg-white shadow-xl md:bottom-6 md:left-20 md:right-auto md:w-[360px] ${
          leaving ? "animate-modal-out" : "animate-modal-in"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <p className="font-heading text-base font-extrabold text-[#1e1b4b]">Notifications</p>
          <div className="flex items-center gap-3">
            {hasUnread && (
              <button onClick={onMarkAll} className="text-xs font-medium text-[#8B8D93] hover:text-[#228be6]">
                Mark all as read
              </button>
            )}
            <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full text-[#8B8D93] hover:bg-[#f1f5fb] hover:text-[#1e1b4b]" aria-label="Close notifications">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="border-b border-[#EEEBE4]" />
        <div className="notifications-scroll max-h-[60vh] overflow-y-auto">
          {notifs.length ? (
            notifs.map((item, i) => (
              <div key={item.id} className={i < notifs.length - 1 ? "border-b border-[#F2EFE9]" : ""}>
                <div
                  onClick={() => handleRow(item)}
                  className="group relative flex cursor-pointer items-start gap-3 px-4 py-4 transition hover:bg-[#FAF7F2]"
                >
                  <RowAvatar item={item} user={user} />
                  <div className="min-w-0 flex-1 pr-8">
                    <p className="text-sm font-medium leading-snug text-[#1e1b4b]">{item.message}</p>
                    <p className="mt-1 text-xs text-[#9AA0A6]">
                      {format(new Date(item.created_at), "h:mm a, MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="absolute right-3.5 top-1/2 h-7 w-7 -translate-y-1/2">
                    {!item.read && (
                      <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5080da] transition-opacity group-hover:opacity-0" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleRead(item);
                      }}
                      className="group/btn absolute inset-0 flex items-center justify-center rounded-lg border border-[#e2e8f0] bg-white opacity-0 transition-opacity duration-150 hover:border-[#D8D9DC] hover:bg-[#f1f5fb] group-hover:opacity-100"
                    >
                      {item.read ? (
                        <Bell size={14} className="text-[#228be6]" />
                      ) : (
                        <Check size={14} className="text-[#228be6]" />
                      )}
                      <span className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#1A1A1A] px-2 py-1 text-[13px] font-medium text-white opacity-0 transition-opacity duration-150 group-hover/btn:opacity-100">
                        {item.read ? "Mark as unread" : "Mark as read"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-12 text-center text-sm text-[#9AA0A6]">You're all caught up.</div>
          )}
        </div>
      </div>
    </>
  );
}