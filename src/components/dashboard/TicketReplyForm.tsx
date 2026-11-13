"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { addTicketResponse } from "@/lib/actions/tickets";

export default function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const text = message.trim();
    if (text.length < 2) {
      setError("Écrivez un message avant d'envoyer.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        await addTicketResponse(ticketId, text, false);
        setMessage("");
        router.refresh();
      } catch {
        setError("L'envoi a échoué. Réessayez.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label htmlFor="reply" className="block text-[13px] font-medium">
        Votre réponse
      </label>
      <textarea
        id="reply"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={3}
        className="field resize-none"
        placeholder="Ajoutez une précision, une capture décrite, une question…"
      />
      {error && <p className="text-[12px] text-danger">{error}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary h-10 px-4 text-[13px]">
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        Envoyer
      </button>
    </form>
  );
}
