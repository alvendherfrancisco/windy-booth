import React, { useState } from "react";
import { MessageCircle, Send, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { buildContactMessageEmail } from "@/lib/emailTemplates";

const ADMIN_EMAIL = "alvendherfrancisco01@gmail.com";

export default function ContactSuggestForm() {
  const { user } = useAuth();
  const [type, setType] = useState("contact");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: ADMIN_EMAIL,
        subject: type === "suggestion" ? "New design suggestion" : "New contact message",
        body: buildContactMessageEmail({
          userName: user?.full_name || "A user",
          userEmail: user?.email || "unknown",
          type,
          message,
        }),
      });
      setSent(true);
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="mt-4 rounded-[18px] border border-[#D8D9DC] bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-[#8B8D93]">Get in touch</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => { setType("contact"); setSent(false); }}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
            type === "contact" ? "bg-[#5080da] text-white" : "bg-[#eaf2fd] text-[#3a6cbf]"}`}>
          <MessageCircle size={13} /> Contact developer
        </button>
        <button
          type="button"
          onClick={() => { setType("suggestion"); setSent(false); }}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
            type === "suggestion" ? "bg-[#5080da] text-white" : "bg-[#eaf2fd] text-[#3a6cbf]"}`}>
          <Sparkles size={13} /> Suggest a design
        </button>
      </div>
      <form onSubmit={submit} className="mt-3">
        <textarea
          value={message}
          onChange={(e) => { setMessage(e.target.value); setSent(false); }}
          placeholder={type === "suggestion" ? "Describe the template design you'd love to see…" : "What would you like to tell us?"}
          rows={4}
          className="input resize-none"
        />
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#5080da] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#3a6cbf] disabled:opacity-50">
          <Send size={14} />
          {sending ? "Sending…" : "Send"}
        </button>
        {sent && <p className="mt-2 text-xs font-bold text-[#37b24d]">Thanks! Your message was sent.</p>}
      </form>
    </section>
  );
}