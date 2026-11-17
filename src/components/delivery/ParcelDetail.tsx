import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  MapPin,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDelivery } from "@/lib/delivery-store";
import { useAuth } from "@/hooks/use-auth";
import {
  CARRIER_META,
  DEFAULT_CONTACT,
  GIG_OPTIONS,
  PLACE_SUGGESTIONS,
  rupees,
  savingsFor,
  SLOTS,
  STATUS_LABEL,
  type GigSlug,
  type Parcel,
} from "@/lib/delivery-data";
import { ParcelStatusBadge } from "./ParcelStatusBadge";
import { VoiceDispatch } from "./VoiceDispatch";

const labelClass =
  "text-[9px] uppercase tracking-[0.1em] text-muted-foreground mono";
const fieldClass =
  "h-10 w-full rounded-md border border-border bg-white/[0.03] px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-route/50";

export function ParcelDetail({ parcelId }: { parcelId: string }) {
  const { getParcel, selectParcel } = useDelivery();
  const parcel = getParcel(parcelId);
  const exists = Boolean(parcel);

  useEffect(() => {
    if (exists) selectParcel(parcelId);
  }, [exists, parcelId, selectParcel]);

  if (!parcel) {
    return (
      <main className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-5 py-24 text-center">
        <p className="eyebrow text-hub-deep">404 · Parcel not found</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
          We can&apos;t find {parcelId}.
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          Check the tracking ID or start from one of the sample parcels on the
          tracking console.
        </p>
        <Link
          to="/"
          className="mt-6 flex h-10 items-center gap-2 rounded-md bg-route px-5 text-[10px] uppercase tracking-[0.1em] text-primary-foreground mono"
        >
          Back to tracking
          <ArrowRight className="size-3.5" />
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1240px] px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground mono"
        >
          <ArrowLeft className="size-3.5" />
          Parcel console
        </Link>
        <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60 mono">
          Parcels / {parcel.id}
        </span>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
        <div className="lg:col-start-1 lg:row-start-1">
          <ParcelSummary parcel={parcel} />
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {parcel.booking ? (
            <BookingReceipt parcel={parcel} />
          ) : (
            <BookingFlow parcel={parcel} />
          )}
        </div>

        <div className="flex flex-col gap-5 lg:col-start-1 lg:row-start-2">
          <RouteTimeline parcel={parcel} />
          <VoiceDispatch parcel={parcel} />
        </div>
      </div>
    </main>
  );
}

function ParcelSummary({ parcel }: { parcel: Parcel }) {
  const carrier = CARRIER_META[parcel.carrier];
  return (
    <article className="panel overflow-hidden rounded-xl">
      <div className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: carrier.dot }}
            />
            <p className="eyebrow text-muted-foreground">
              {parcel.carrier} · {parcel.weightKg} kg · {parcel.city}
            </p>
          </div>
          <h1 className="mt-2 font-display text-[clamp(1.8rem,4vw,2.4rem)] font-semibold leading-none tracking-[-0.025em] text-foreground num">
            {parcel.id}
          </h1>
          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {parcel.hub} · {parcel.city}
          </p>
        </div>
        <ParcelStatusBadge stage={parcel.stage} label={STATUS_LABEL[parcel.stage]} />
      </div>

      <dl className="grid gap-px bg-border sm:grid-cols-3">
        {[
          { label: "Line-haul carrier", value: parcel.carrier },
          { label: "Parcel weight", value: `${parcel.weightKg} kg` },
          {
            label: "Evening window",
            value: parcel.slot ?? "Not booked",
            accent: Boolean(parcel.slot),
          },
        ].map((item) => (
          <div key={item.label} className="bg-card px-5 py-4">
            <dt className={labelClass}>{item.label}</dt>
            <dd
              className={cn(
                "mt-1.5 text-[13px] num",
                item.accent ? "text-route-deep" : "text-foreground",
              )}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-3 border-t border-border bg-hub-soft p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-hub-deep" />
          <div>
            <p className="text-[9px] uppercase tracking-[0.1em] text-hub-deep mono">
              Original failed attempt
            </p>
            <p className="mt-1 text-[12.5px] leading-5 text-foreground/80">
              {parcel.failedAttempt}.
            </p>
          </div>
        </div>
        <div className="shrink-0 sm:border-l sm:border-hub/20 sm:pl-5">
          <p className={cn(labelClass, "text-hub-deep/70")}>Courier re-attempt</p>
          <p className="mt-1 font-display text-lg leading-none text-hub-deep num">
            {rupees(parcel.reattemptCost)}
          </p>
        </div>
      </div>
    </article>
  );
}

function RouteTimeline({ parcel }: { parcel: Parcel }) {
  const steps = [
    {
      title: `Sorted at ${parcel.hub}`,
      detail: "Scanned inbound · line-haul complete",
      tone: "done" as const,
    },
    {
      title: "Daytime delivery attempted",
      detail: parcel.failedAttempt,
      tone: "failed" as const,
    },
    {
      title: parcel.booking
        ? `Diverted to ${parcel.slot}`
        : "Awaiting evening diversion",
      detail: parcel.booking
        ? `Fare ${rupees(parcel.booking.fee)} · ${parcel.booking.method} · ${parcel.booking.reference}`
        : "Choose a window, address and fare",
      tone: parcel.booking ? ("done" as const) : ("pending" as const),
    },
    {
      title: parcel.gig ? `${parcel.gig.partner} rider assigned` : "Gig rider dispatch",
      detail: parcel.gig
        ? `${parcel.gig.rider} · ${parcel.gig.plate} · ETA ${parcel.gig.eta}`
        : "Matched after booking confirmation",
      tone: parcel.gig
        ? parcel.stage === "delivered"
          ? ("done" as const)
          : ("active" as const)
        : ("pending" as const),
    },
  ];

  return (
    <section className="panel rounded-xl p-6">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-muted-foreground">Route status</p>
        <span className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/50 mono">
          Updated live
        </span>
      </div>
      <ol className="mt-5">
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex gap-3 pb-5 last:pb-0">
            {index < steps.length - 1 && (
              <span className="absolute left-[5px] top-3.5 h-full w-px bg-border" />
            )}
            <span
              className={cn(
                "relative mt-0.5 size-2.5 shrink-0 rounded-full border",
                step.tone === "done" && "border-route bg-route",
                step.tone === "active" && "border-route bg-background",
                step.tone === "failed" && "border-hub bg-hub",
                step.tone === "pending" && "border-border bg-background",
              )}
            >
              {step.tone === "active" && (
                <span className="absolute inset-[2px] rounded-full bg-route" />
              )}
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[13px] leading-5",
                  step.tone === "pending"
                    ? "text-muted-foreground"
                    : "text-foreground",
                )}
              >
                {step.title}
              </p>
              <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">
                {step.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function BookingFlow({ parcel }: { parcel: Parcel }) {
  const { bookParcel } = useDelivery();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const hint = PLACE_SUGGESTIONS[parcel.city] ?? {
    label: "Home",
    line1: "",
    pincode: "",
  };

  const [placeLabel, setPlaceLabel] = useState<"Home" | "Work" | "Other">("Home");
  const [line1, setLine1] = useState(hint.line1);
  const [city, setCity] = useState(parcel.city);
  const [pincode, setPincode] = useState(hint.pincode);
  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const contactName = nameOverride ?? user?.name ?? DEFAULT_CONTACT.name;
  const [phone, setPhone] = useState(DEFAULT_CONTACT.phone);
  const [slot, setSlot] = useState(SLOTS[0].id);
  const [gigSlug, setGigSlug] = useState<GigSlug>("rapido");
  const [method, setMethod] = useState<"UPI" | "Card">("UPI");
  const [upiId, setUpiId] = useState("aarav@okhdfc");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [offer, setOffer] = useState("");
  const [agreedFee, setAgreedFee] = useState<number | null>(null);
  const [bargain, setBargain] = useState<{
    tone: "accepted" | "countered";
    message: string;
    counter?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const gig = GIG_OPTIONS.find((option) => option.slug === gigSlug) ?? GIG_OPTIONS[0];
  const floor = Math.ceil(gig.fee * 0.6);
  const fee = agreedFee ?? gig.fee;

  function changeGig(next: GigSlug) {
    setGigSlug(next);
    setAgreedFee(null);
    setBargain(null);
    setOffer("");
  }

  function makeOffer(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
      setBargain({
        tone: "countered",
        message: "Enter an amount in rupees to start negotiating.",
        counter: floor,
      });
      return;
    }
    if (amount >= gig.fee) {
      setAgreedFee(gig.fee);
      setBargain({
        tone: "accepted",
        message: `That covers the quote — we'll charge ${rupees(gig.fee)}. No overpayment.`,
      });
      return;
    }
    if (amount >= floor) {
      setAgreedFee(amount);
      setBargain({
        tone: "accepted",
        message: `${gig.partner} accepted ${rupees(amount)} — ${rupees(gig.fee - amount)} under the quoted fare.`,
      });
      return;
    }
    setAgreedFee(null);
    setBargain({
      tone: "countered",
      message: `${gig.partner} countered at ${rupees(floor)}, the lowest batched fare tonight.`,
      counter: floor,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      navigate(`/auth?returnTo=${encodeURIComponent(`/parcel/${parcel.id}`)}`);
      return;
    }
    if (line1.trim().length < 6) {
      setError("Add a complete street address for the rider.");
      return;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      setError("Enter a valid 6-digit pincode.");
      return;
    }
    if (contactName.trim().length < 2) {
      setError("Add the name the rider should ask for.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Enter a reachable 10-digit phone number.");
      return;
    }
    if (method === "UPI" && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
      setError("Enter a valid UPI ID, for example name@bank.");
      return;
    }

    setPaying(true);
    window.setTimeout(() => {
      bookParcel(parcel.id, {
        slot,
        gig,
        fee,
        place: {
          label: placeLabel,
          line1: line1.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
        },
        contact: { name: contactName.trim(), phone: phone.trim() },
        method,
      });
      setPaying(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1200);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="panel overflow-hidden rounded-xl lg:self-start"
    >
      <div className="border-b border-border bg-white/[0.02] p-5 sm:p-6">
        <p className="eyebrow text-route-deep">Evening booking</p>
        <h2 className="mt-2 font-display text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
          Send it out tonight.
        </h2>
        <p className="mt-1.5 text-[12px] leading-5 text-muted-foreground">
          Address, contact, window and fare. Pay only when you confirm.
        </p>
      </div>

      <div className="divide-y divide-border">
        <section className="p-5 sm:p-6">
          <p className={labelClass}>01 · Delivery address</p>
          <div className="mt-3 flex gap-1.5">
            {(["Home", "Work", "Other"] as const).map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setPlaceLabel(label)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.08em] transition-colors mono",
                  placeLabel === label
                    ? "border-route/40 bg-route-soft text-route-deep"
                    : "border-border text-muted-foreground hover:border-white/20 hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-3 space-y-2.5">
            <div>
              <label htmlFor="address" className={labelClass}>
                Street address
              </label>
              <input
                id="address"
                value={line1}
                onChange={(event) => setLine1(event.target.value)}
                placeholder="Flat, building, street"
                className={cn(fieldClass, "mt-1")}
              />
            </div>
            <div className="grid grid-cols-[1fr_110px] gap-2.5">
              <div>
                <label htmlFor="city" className={labelClass}>
                  City
                </label>
                <input
                  id="city"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className={cn(fieldClass, "mt-1")}
                />
              </div>
              <div>
                <label htmlFor="pincode" className={labelClass}>
                  Pincode
                </label>
                <input
                  id="pincode"
                  value={pincode}
                  onChange={(event) => setPincode(event.target.value)}
                  inputMode="numeric"
                  className={cn(fieldClass, "mt-1 num")}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="p-5 sm:p-6">
          <p className={labelClass}>02 · Contact</p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className={labelClass}>
                Name
              </label>
              <input
                id="contact-name"
                value={contactName}
                onChange={(event) => setNameOverride(event.target.value)}
                placeholder="Who should the rider ask for?"
                className={cn(fieldClass, "mt-1")}
              />
            </div>
            <div>
              <label htmlFor="contact-phone" className={labelClass}>
                Phone
              </label>
              <input
                id="contact-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                inputMode="tel"
                className={cn(fieldClass, "mt-1 num")}
              />
            </div>
          </div>
        </section>

        <section className="p-5 sm:p-6">
          <p className={labelClass}>03 · Evening window</p>
          <div className="mt-3 space-y-1.5" role="radiogroup" aria-label="Evening delivery window">
            {SLOTS.map((option) => {
              const active = option.id === slot;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSlot(option.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-md border px-3.5 py-2.5 text-left transition-colors",
                    active
                      ? "border-route/50 bg-route-soft"
                      : "border-border hover:border-white/20 hover:bg-white/[0.02]",
                  )}
                >
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[12.5px] text-foreground num">
                        {option.label}
                      </span>
                      {option.tag && (
                        <span className="rounded-full border border-route/30 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.08em] text-route-deep mono">
                          {option.tag}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[10.5px] text-muted-foreground">
                      {option.note}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full border",
                      active
                        ? "border-route bg-route text-primary-foreground"
                        : "border-border",
                    )}
                  >
                    {active && <CheckCircle2 className="size-3" />}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className={labelClass}>04 · Rider &amp; fare</p>
            <span className="text-[9px] uppercase tracking-[0.08em] text-route-deep mono">
              Negotiable
            </span>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {GIG_OPTIONS.map((option) => {
              const active = option.slug === gigSlug;
              return (
                <button
                  key={option.slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => changeGig(option.slug)}
                  className={cn(
                    "rounded-md border p-3.5 text-left transition-colors",
                    active
                      ? "border-route/50 bg-route-soft"
                      : "border-border hover:border-white/20 hover:bg-white/[0.02]",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[12px] text-foreground">
                      {option.partner}
                    </span>
                    <span
                      className={cn(
                        "mt-1 size-1.5 shrink-0 rounded-full",
                        active ? "bg-route" : "bg-muted-foreground/40",
                      )}
                    />
                  </div>
                  <p className="mt-2 font-display text-[20px] leading-none text-foreground num">
                    {rupees(option.fee)}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {option.pickup} · {option.eta}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-route/20 bg-route-soft px-3 py-2 text-[10px] text-muted-foreground">
            <span className="text-[9px] uppercase tracking-[0.08em] text-route-deep mono">
              Cost arbitrage
            </span>
            <span className="num">Re-attempt {rupees(parcel.reattemptCost)}</span>
            <ArrowRight className="size-3 text-route/60" />
            <span className="text-foreground num">Fare {rupees(fee)}</span>
            <span className="ml-auto text-route-deep num">
              save {rupees(savingsFor(parcel, fee))}
            </span>
          </div>

          <div className="mt-2 rounded-md border border-border bg-white/[0.02] p-3.5">
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-muted-foreground">
                {gig.partner} fleet quote
              </span>
              <span className="text-foreground num">{rupees(gig.fee)}</span>
            </div>

            <div className="mt-2.5 flex gap-2">
              <div className="flex h-9 flex-1 items-center gap-1 rounded-md border border-border bg-background px-2.5">
                <span className="text-[12px] text-muted-foreground">₹</span>
                <label htmlFor="offer" className="sr-only">
                  Your fare offer
                </label>
                <input
                  id="offer"
                  value={offer}
                  onChange={(event) => setOffer(event.target.value)}
                  placeholder="Name your fare"
                  inputMode="numeric"
                  className="w-full bg-transparent text-[12px] text-foreground outline-none placeholder:text-muted-foreground/50 num"
                />
              </div>
              <button
                type="button"
                onClick={() => makeOffer(Number(offer))}
                className="h-9 shrink-0 rounded-md border border-route/40 bg-route-soft px-3 text-[10px] uppercase tracking-[0.08em] text-route-deep transition-colors hover:border-route/70 mono"
              >
                Make offer
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {[
                Math.max(floor, gig.fee - 10),
                Math.max(floor, gig.fee - 5),
                gig.fee,
              ].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setOffer(String(amount));
                    makeOffer(amount);
                  }}
                  className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-route/40 hover:text-route-deep mono num"
                >
                  {rupees(amount)}
                </button>
              ))}
              <span className="ml-auto text-[9px] text-muted-foreground/60 mono">
                min {rupees(floor)}
              </span>
            </div>

            {bargain && (
              <div
                className={cn(
                  "animate-rise mt-2.5 rounded-md border px-3 py-2 text-[11px] leading-5",
                  bargain.tone === "accepted"
                    ? "border-route/30 bg-route-soft text-route-deep"
                    : "border-hub/30 bg-hub-soft text-hub-deep",
                )}
              >
                <p className="flex items-start gap-1.5">
                  <BadgeCheck className="mt-0.5 size-3.5 shrink-0" />
                  {bargain.message}
                </p>
                {bargain.tone === "countered" && bargain.counter && (
                  <div className="mt-1.5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAgreedFee(bargain.counter ?? null);
                        setOffer(String(bargain.counter));
                        setBargain({
                          tone: "accepted",
                          message: `Deal — ${rupees(bargain.counter ?? floor)} locked for this delivery.`,
                        });
                      }}
                      className="rounded border border-hub/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.08em] mono"
                    >
                      Accept {rupees(bargain.counter)}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAgreedFee(null);
                        setBargain(null);
                        setOffer("");
                      }}
                      className="rounded border border-border px-2 py-0.5 text-[9px] uppercase tracking-[0.08em] text-muted-foreground mono"
                    >
                      Keep quote
                    </button>
                  </div>
                )}
                {bargain.tone === "accepted" && (
                  <button
                    type="button"
                    onClick={() => {
                      setAgreedFee(null);
                      setBargain(null);
                      setOffer("");
                    }}
                    className="mt-1 text-[9px] uppercase tracking-[0.08em] underline decoration-route/40 underline-offset-2 mono"
                  >
                    Reset to quote
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="p-5 sm:p-6">
          <p className={labelClass}>05 · Payment</p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {(
              [
                { id: "UPI" as const, icon: Smartphone, label: "UPI" },
                { id: "Card" as const, icon: CreditCard, label: "Card" },
              ]
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setMethod(option.id)}
                className={cn(
                  "flex h-10 items-center justify-center gap-2 rounded-md border text-[11px] transition-colors",
                  method === option.id
                    ? "border-route/50 bg-route-soft text-route-deep"
                    : "border-border text-muted-foreground hover:border-white/20 hover:text-foreground",
                )}
              >
                <option.icon className="size-3.5" />
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-2.5">
            {method === "UPI" ? (
              <div>
                <label htmlFor="upi" className={labelClass}>
                  UPI ID
                </label>
                <input
                  id="upi"
                  value={upiId}
                  onChange={(event) => setUpiId(event.target.value)}
                  className={cn(fieldClass, "mt-1")}
                />
              </div>
            ) : (
              <div>
                <label htmlFor="card" className={labelClass}>
                  Card number
                </label>
                <input
                  id="card"
                  value={cardNumber}
                  onChange={(event) => setCardNumber(event.target.value)}
                  className={cn(fieldClass, "mt-1 num")}
                />
              </div>
            )}
          </div>

          <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-[11px]">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Rider fare</dt>
              <dd className="text-foreground num">{rupees(fee)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Platform fee</dt>
              <dd className="text-route-deep num">₹0</dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-1.5">
              <dt className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground mono">
                Total payable
              </dt>
              <dd className="font-display text-lg text-foreground num">
                {rupees(fee)}
              </dd>
            </div>
          </dl>

          <p className="mt-2 flex items-center gap-1.5 text-[10px] text-route-deep">
            <ShieldCheck className="size-3" />
            {rupees(savingsFor(parcel, fee))} cheaper than a courier re-attempt
          </p>

          {error && (
            <p className="mt-2.5 flex items-start gap-1.5 rounded-md border border-hub/30 bg-hub-soft px-2.5 py-2 text-[11px] leading-5 text-hub-deep">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={paying}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-route text-[10px] uppercase tracking-[0.1em] text-primary-foreground transition-colors hover:bg-route-deep disabled:opacity-60 mono"
          >
            {paying ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Confirming with fleet…
              </>
            ) : isAuthenticated ? (
              <>
                Pay {rupees(fee)} &amp; book delivery
                <ArrowRight className="size-3.5" />
              </>
            ) : (
              <>
                Sign in to pay {rupees(fee)}
                <ArrowRight className="size-3.5" />
              </>
            )}
          </button>
          <p className="mt-2 text-center text-[9px] uppercase tracking-[0.08em] text-muted-foreground/60 mono">
            {isAuthenticated
              ? "Test checkout · no real charge"
              : "You’ll return here after signing in · guest login available"}
          </p>
        </section>
      </div>
    </form>
  );
}

function BookingReceipt({ parcel }: { parcel: Parcel }) {
  const booking = parcel.booking;
  if (!booking) return null;
  const delivered = parcel.stage === "delivered";

  return (
    <aside className="panel animate-rise overflow-hidden rounded-xl">
      <div className="border-b border-route/20 bg-route-soft p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-route-deep" />
          <p className="text-[9px] uppercase tracking-[0.12em] text-route-deep mono">
            {delivered ? "Delivery complete" : "Evening delivery confirmed"}
          </p>
        </div>
        <h2 className="mt-2 font-display text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
          {delivered ? "Delivered last night." : "You're booked for tonight."}
        </h2>
        <p className="mt-1.5 text-[12px] leading-5 text-muted-foreground">
          {parcel.slot} · {booking.place.label} · ref {booking.reference}
        </p>
      </div>

      <div className="p-5 sm:p-6">
        <div className="rounded-lg border border-border bg-white/[0.03] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/70 mono">
                {parcel.gig?.partner} · assigned rider
              </p>
              <p className="mt-1 text-[13px] text-foreground">
                {parcel.gig?.rider}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground num">
                {parcel.gig?.plate}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/70 mono">
                ETA
              </p>
              <p className="mt-1 font-display text-xl text-route-deep num">
                {parcel.gig?.eta}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock3 className="size-3 text-route" />
              {parcel.slot}
            </span>
            <span className="text-route-deep">
              {delivered ? "Completed" : "Collecting from hub"}
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
          <div className="bg-card p-3.5">
            <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/70 mono">
              Hub pickup OTP
            </p>
            <p className="mt-1.5 font-display text-[22px] leading-none tracking-[0.16em] text-foreground num">
              {parcel.pickupOtp}
            </p>
          </div>
          <div className="bg-card p-3.5">
            <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/70 mono">
              Doorstep OTP
            </p>
            <p className="mt-1.5 font-display text-[22px] leading-none tracking-[0.16em] text-foreground num">
              {parcel.deliveryOtp}
            </p>
          </div>
        </div>

        <dl className="mt-4 space-y-2 text-[11px]">
          <div className="flex items-start justify-between gap-4">
            <dt className="text-muted-foreground">Deliver to</dt>
            <dd className="max-w-[220px] text-right leading-5 text-foreground/85">
              {booking.place.line1}, {booking.place.city} {booking.place.pincode}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-muted-foreground">Contact</dt>
            <dd className="text-right text-foreground/85">
              {booking.contact.name}
              <span className="block text-[10px] text-muted-foreground num">
                {booking.contact.phone}
              </span>
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2">
            <dt className="text-muted-foreground">Paid via {booking.method}</dt>
            <dd className="font-display text-base text-foreground num">
              {rupees(booking.fee)}
            </dd>
          </div>
        </dl>

        <div className="mt-4 rounded-md border border-route/20 bg-route-soft px-3 py-2.5">
          <p className="text-[10px] leading-5 text-route-deep">
            {rupees(savingsFor(parcel, booking.fee))} saved versus a failed
            courier re-attempt. OTPs are also read in the voice briefing.
          </p>
        </div>

        <Link
          to="/"
          className="mt-4 flex h-10 items-center justify-center gap-2 rounded-md border border-border text-[10px] uppercase tracking-[0.1em] text-foreground transition-colors hover:border-route/40 hover:text-route-deep mono"
        >
          Track another parcel
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </aside>
  );
}
