import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageSquare, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  riderEta,
  rupees,
  SLOTS,
  STATUS_LABEL,
  type Parcel,
} from "@/lib/delivery-data";

interface Message {
  id: number;
  role: "assistant" | "user";
  text: string;
}

const QUICK_REPLIES = [
  "Reschedule to 8:30 PM",
  "What's my OTP?",
  "Where is my parcel?",
];

function greeting(parcel: Parcel): Message {
  return {
    id: 1,
    role: "assistant",
    text: `Hi — I'm LastMile Assist, your evening delivery desk for ${parcel.id}. I can move your window, read out the OTPs or check the gig rider.`,
  };
}

function buildReply(message: string, parcel: Parcel): string {
  const text = message.toLowerCase();
  const gig = parcel.gig;

  if (/otp|code|pin/.test(text)) {
    if (!gig) {
      return `No OTPs exist yet for ${parcel.id}. Confirm an evening booking first — the hub pickup and doorstep OTPs are generated instantly.`;
    }
    return `Two 4-digit codes are live for ${parcel.id}:\n• Hub pickup OTP — ${parcel.pickupOtp} (the rider shows this at ${parcel.hub})\n• Doorstep OTP — ${parcel.deliveryOtp} (share only when the parcel is in your hands)`;
  }

  if (/rider|bike|plate|eta|arriv/.test(text)) {
    if (!gig) {
      return `No rider is assigned to ${parcel.id} yet. Pick a window, address and fare in the booking panel and I'll dispatch the closest rider.`;
    }
    return `${gig.rider} is assigned on ${gig.partner}, bike ${gig.plate}. ETA ${gig.eta}, inside your ${parcel.slot} window.`;
  }

  if (/cost|save|fee|price|cheap|fare/.test(text)) {
    const paid = parcel.booking?.fee ?? gig?.fee ?? 35;
    return `A failed courier re-attempt costs ${rupees(parcel.reattemptCost)}. Your batched evening fare is ${rupees(paid)}, so this parcel saves ${rupees(Math.max(parcel.reattemptCost - paid, 0))} while still arriving tonight.`;
  }

  if (/where|status|hub|track|location/.test(text)) {
    return `${parcel.id} is ${STATUS_LABEL[parcel.stage].toLowerCase()} at ${parcel.hub}, ${parcel.city}. ${parcel.slot ? `Evening window: ${parcel.slot}.` : "No evening window is booked yet."}`;
  }

  if (/resched|slot|evening|time|window|late|tonight/.test(text)) {
    if (!gig) {
      return `Your parcel is still held at ${parcel.hub}. Open the booking panel to choose an address, a window and a fare — I'll handle the rider briefing.`;
    }
    return `Your window is ${parcel.slot}. To change it, open the booking receipt and pick another window — your OTPs and rider stay the same.`;
  }

  if (/human|agent|call|support/.test(text)) {
    return `A hub partner is on the floor from 8 AM to 9 PM. I've logged this chat against ${parcel.id} — reference the tracking ID when you call.`;
  }

  return `I can help with the delivery window, the rider, the OTPs or tonight's fare for ${parcel.id}. What would you like to check?`;
}

export function ChatAssistant({
  parcel,
  onReschedule,
}: {
  parcel: Parcel;
  onReschedule: (slot: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [greeting(parcel)]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const timerRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, typing, open]);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  function send(raw: string) {
    const text = raw.trim();
    if (!text || typing) return;
    setDraft("");
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", text },
    ]);
    setTyping(true);

    const slot = SLOTS.find((option) =>
      text.includes(option.label.split("–")[0].trim()),
    );
    if (slot && parcel.gig) {
      onReschedule(slot.id);
    }

    timerRef.current = window.setTimeout(() => {
      let reply = buildReply(text, parcel);
      if (slot && parcel.gig) {
        reply = `Done — ${parcel.id} is moved to ${slot.id}. ${parcel.gig.rider} will still collect it from ${parcel.hub}; ETA updates to ${riderEta(slot.id)}. Your OTPs are unchanged.`;
      }
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, role: "assistant", text: reply },
      ]);
      setTyping(false);
    }, 700);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send(draft);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="lastmile-assistant"
        className={cn(
          "fixed bottom-5 right-4 z-50 flex items-center gap-2.5 rounded-full border border-route/30 bg-route py-2 pl-2 pr-4 text-primary-foreground shadow-[0_18px_50px_-18px_rgba(52,211,153,0.55)] transition-transform hover:-translate-y-0.5 sm:bottom-6 sm:right-6",
          open && "pointer-events-none opacity-0",
        )}
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground">
          <Sparkles className="size-3.5" strokeWidth={2.2} />
        </span>
        <span className="text-left">
          <span className="block text-[8px] uppercase tracking-[0.12em] text-primary-foreground/70 mono">
            Ask LastMile Assist
          </span>
          <span className="block text-[11.5px] font-medium text-primary-foreground">
            Reschedule via AI Assistant
          </span>
        </span>
      </button>

      {open && (
        <div
          id="lastmile-assistant"
          role="dialog"
          aria-label="LastMileSync AI assistant"
          className="animate-rise fixed bottom-20 right-3 z-50 flex h-[min(564px,calc(100dvh-7rem))] w-[calc(100vw-1.5rem)] max-w-[382px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[0_30px_70px_-24px_rgba(0,0,0,0.8)] sm:bottom-24 sm:right-6"
        >
          <div className="flex items-start justify-between gap-3 border-b border-border bg-ink px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-2 rounded-full bg-route/40" />
                <span className="relative inline-flex size-2 rounded-full bg-route" />
              </span>
              <div>
                <p className="text-[12px] text-foreground">LastMile Assist</p>
                <p className="mt-0.5 text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground mono">
                  Botpress container · demo fallback
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="flex size-7 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="border-b border-border bg-white/[0.02] px-4 py-2">
            <p className="text-[10px] leading-5 text-muted-foreground">
              Live chat scaffold — drop the Botpress webchat script into{" "}
              <span className="text-foreground/70 mono">#botpress-webchat</span>{" "}
              for production.
            </p>
          </div>

          <div
            ref={scrollRef}
            className="chat-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[86%] whitespace-pre-line rounded-lg px-3 py-2 text-[12px] leading-6",
                  message.role === "assistant"
                    ? "border border-border bg-white/[0.03] text-foreground/85"
                    : "ml-auto bg-route text-primary-foreground",
                )}
              >
                {message.text}
              </div>
            ))}
            {typing && (
              <div className="flex w-14 items-center justify-center gap-1 rounded-lg border border-border bg-white/[0.03] px-3 py-2.5">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="size-1 animate-bounce rounded-full bg-muted-foreground/70"
                    style={{ animationDelay: `${dot * 0.12}s` }}
                  />
                ))}
              </div>
            )}
            <div id="botpress-webchat" className="hidden" />
          </div>

          <div className="border-t border-border px-3 pt-2.5">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => send(reply)}
                  className="rounded-full border border-border bg-white/[0.02] px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:border-route/40 hover:text-route-deep"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3">
            <label htmlFor="assistant-input" className="sr-only">
              Message the assistant
            </label>
            <input
              id="assistant-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about your evening delivery…"
              className="h-9 min-w-0 flex-1 rounded-md border border-border bg-white/[0.03] px-2.5 text-[12px] outline-none placeholder:text-muted-foreground/50 focus:border-route/50"
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={!draft.trim() || typing}
              className="flex size-9 shrink-0 items-center justify-center rounded-md bg-route text-primary-foreground transition-colors hover:bg-route-deep disabled:opacity-40"
            >
              <Send className="size-3.5" />
            </button>
          </form>
          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground/60 mono">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="size-2.5" />
              Replies in under a second
            </span>
            <span>{parcel.id}</span>
          </div>
        </div>
      )}
    </>
  );
}
