import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check } from "lucide-react";

export default function NotificationsPopover({ open, onClose, notifs, onToggleRead, onMarkAll }) {
  const navigate = useNavigate();
  if (!open) return null;
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
      <div className="fixed bottom-20 left-2 right-2 z-50 overflow-hidden rounded-2xl border border-[#E8E2D8] bg-white shadow-2xl md:bottom-6 md:left-20 md:right-auto md:w-[360px]">
        <div className="flex items-center justify-between border-b border-[#EEEBE4] px-4 py-3">
          <p className="font-heading text-base font-extrabold text-[#2D2D2D]">Notifications</p>
          {hasUnread && (
            <button onClick={onMarkAll} className="text-xs font-bold text-[#4F46E5] hover:underline">
              Mark all as read
            </button>
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {notifs.length ? (
            notifs.map((item) => (
              <div
                key={item.id}
                onClick={() => handleRow(item)}
                className={`group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                  item.read
                    ? "border-transparent hover:bg-[#F5F0EA]"
                    : "border-[#C7D2FE] bg-[#EEF2FF] hover:bg-[#E0E7FF]"
                }`}
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.read ? "bg-transparent" : "bg-[#DC3522]"}`} />
                <div className="min-w-0 flex-1 pr-7">
                  <p className="text-sm font-bold leading-snug text-[#2D2D2D]">{item.message}</p>
                  <p className="mt-1 text-xs text-[#8B8D93]">{new Date(item.created_at).toLocaleString()}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRead(item);
                  }}
                  title={item.read ? "Mark as unread" : "Mark as read"}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#4F46E5] opacity-0 shadow-sm transition hover:bg-[#EEF2FF] group-hover:opacity-100"
                >
                  {item.read ? <Bell size={14} /> : <Check size={14} />}
                </button>
              </div>
            ))
          ) : (
            <div className="px-4 py-12 text-center text-sm text-[#8B8D93]">You're all caught up.</div>
          )}
        </div>
      </div>
    </>
  );
}