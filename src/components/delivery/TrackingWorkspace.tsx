import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  MapPin,
  PackageSearch,
  Radio,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDelivery } from "@/lib/delivery-store";
import {
  CARRIER_META,
  GIG_OPTIONS,
  rupees,
  SAMPLE_IDS,
  STATUS_LABEL,
  type Parcel,
} from "@/lib/delivery-data";
import { ParcelStatusBadge } from "./ParcelStatusBadge";
import { VoiceDispatch } from "./VoiceDispatch";

export function TrackingWorkspace() {
  const { parcels, selectedId, selectParcel } = useDelivery();
  const [query, setQuery] = useState(selectedId);
  const [notFound, setNotFound] = useState<string | null>(null);
  const parcel = parcels.find((item) => item.id === selectedId) ?? parcels[0];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned = query.trim().toUpperCase();
    const match = parcels.find((item) => item.id.toUpperCase() === cleaned);
    if (match) {
      selectParcel(match.id);
      setNotFound(null);
      document
        .getElementById("parcel-console")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setNotFound(cleaned || "—");
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="tech-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto w-full max-w-[1240px] px-5 pb-14 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pb-20">
          <div className="grid items-start gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex size-1.5 rounded-full bg-route" />
                <p className="eyebrow text-muted-foreground">
                  Last-mile diversion middleware
                </p>
              </div>

              <h1 className="mt-5 max-w-[24ch] font-display text-[clamp(2.5rem,5.6vw,4.2rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-foreground">
                Missed the courier.{" "}
                <span className="text-route">Not the parcel.</span>
              </h1>

              <p className="mt-6 max-w-lg text-[14px] leading-7 text-muted-foreground">
                LastMileSync intercepts failed daytime deliveries at the sorting
                hub and routes them to a hyperlocal rider in the evening window
                you choose. Set the address, pick the time and negotiate the
                fare.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 w-full max-w-xl">
                <label
                  htmlFor="tracking-id"
                  className="eyebrow text-muted-foreground"
                >
                  Track a parcel
                </label>
                <div className="mt-2 flex flex-col gap-2 rounded-lg border border-border bg-card p-1.5 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-3 px-2.5">
                    <PackageSearch className="size-4 shrink-0 text-muted-foreground" />
                    <input
                      id="tracking-id"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Enter a tracking ID — DLV-894210"
                      spellCheck={false}
                      autoComplete="off"
                      className="h-10 w-full bg-transparent text-sm tracking-wide outline-none placeholder:text-muted-foreground/60 mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex h-10 items-center justify-center gap-2 rounded-md bg-route px-5 text-[10px] uppercase tracking-[0.1em] text-primary-foreground transition-colors hover:bg-route-deep mono"
                  >
                    Track parcel
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="eyebrow mr-1 text-[9px] text-muted-foreground/70">
                    Sample IDs
                  </span>
                  {SAMPLE_IDS.map((id) => {
                    const sample = parcels.find((item) => item.id === id);
                    const active = parcel.id === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          selectParcel(id);
                          setQuery(id);
                          setNotFound(null);
                        }}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] tracking-wide transition-colors mono",
                          active
                            ? "border-route/40 bg-route-soft text-route-deep"
                            : "border-border bg-white/[0.02] text-muted-foreground hover:border-white/20 hover:text-foreground",
                        )}
                      >
                        <span
                          className="size-1.5 rounded-full"
                          style={{
                            backgroundColor: sample
                              ? CARRIER_META[sample.carrier].dot
                              : "#8b98ac",
                          }}
                        />
                        {id}
                      </button>
                    );
                  })}
                </div>

                {notFound && (
                  <p className="mt-3 flex items-center gap-2 text-xs text-hub-deep">
                    <TriangleAlert className="size-3.5" />
                    No parcel found for &ldquo;{notFound}&rdquo;. Try DLV-894210,
                    EKT-441092 or XPB-772104.
                  </p>
                )}
              </form>

              <dl className="mt-10 grid gap-5 border-t border-border pt-6 sm:grid-cols-3 sm:gap-0">
                {[
                  { value: "12,400", label: "Parcels diverted this month" },
                  { value: "₹9.3L", label: "Saved on failed re-attempts" },
                  { value: "96%", label: "Evening first-attempt success" },
                ].map((stat, index) => (
                  <div
                    key={stat.label}
                    className={cn(
                      "sm:px-5",
                      index === 0 && "sm:pl-0",
                      index > 0 && "sm:border-l sm:border-border",
                    )}
                  >
                    <dd className="font-display text-[24px] leading-none tracking-tight text-foreground num">
                      {stat.value}
                    </dd>
                    <dt className="mt-2 text-[10px] uppercase tracking-[0.1em] text-muted-foreground mono">
                      {stat.label}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>

            <PipelinePanel />
          </div>
        </div>
      </section>

      <section
        id="parcel-console"
        className="mx-auto w-full max-w-[1240px] scroll-mt-20 px-5 py-12 sm:px-6 sm:py-16 lg:px-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-muted-foreground">Parcel console</p>
            <h2 className="mt-2 font-display text-[clamp(1.7rem,3vw,2.3rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground">
              One parcel. One evening. One rider.
            </h2>
          </div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mono">
            Unified tracking · 3 carriers linked
          </p>
        </div>

        <div className="mt-8">
          <ParcelSnapshot parcel={parcel} />
        </div>

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[1.35fr_1fr]">
          <VoiceDispatch parcel={parcel} />
          <TracePanel parcel={parcel} />
        </div>
      </section>
    </>
  );
}

function PipelinePanel() {
  return (
    <div className="panel animate-rise rounded-xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Radio className="size-3.5 text-route" />
          <p className="eyebrow text-muted-foreground">Diversion pipeline</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-route/25 bg-route-soft px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] text-route-deep mono">
          <span className="size-1 rounded-full bg-route" />
          Live
        </span>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-ink/70 p-4">
        <p className="eyebrow text-[9px] text-muted-foreground/60">
          Line-haul inbound
        </p>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {Object.entries(CARRIER_META).map(([name, meta]) => (
            <div
              key={name}
              className="flex items-center gap-1.5 rounded-md border border-border bg-white/[0.02] px-2 py-1.5"
            >
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: meta.dot }}
              />
              <span className="truncate text-[10px] text-foreground/80 mono">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="ml-4 flex h-7 items-center gap-2 border-l border-dashed border-route/40 pl-3">
        <span className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60 mono">
          webhook intercept
        </span>
      </div>

      <div className="rounded-lg border border-route/25 bg-route-soft p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium tracking-tight text-foreground">
            LastMileSync core
          </p>
          <span className="text-[9px] uppercase tracking-[0.1em] text-route-deep mono">
            42s handoff
          </span>
        </div>
        <p className="mt-1.5 text-[10px] leading-5 text-muted-foreground">
          Hub hold → address check → fare match → evening dispatch
        </p>
        <div className="mt-3 flex items-center gap-3 border-t border-route/15 pt-2.5 text-[9px] uppercase tracking-[0.1em] text-muted-foreground/70 mono">
          <span>3 hubs online</span>
          <span className="text-route">·</span>
          <span>6 riders nearby</span>
        </div>
      </div>

      <div className="ml-4 flex h-7 items-center gap-2 border-l border-dashed border-route/40 pl-3">
        <span className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60 mono">
          hyperlocal dispatch
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {GIG_OPTIONS.map((option) => (
          <div
            key={option.slug}
            className="rounded-lg border border-border bg-white/[0.02] px-3 py-2.5"
          >
            <p className="text-[10px] text-foreground/80">{option.partner}</p>
            <p className="mt-0.5 font-display text-[15px] text-foreground num">
              {rupees(option.fee)}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60 mono">
        <span>Uptime 99.98%</span>
        <span>Zuplo edge · ap-south-1</span>
      </p>
    </div>
  );
}

function ParcelSnapshot({ parcel }: { parcel: Parcel }) {
  const carrier = CARRIER_META[parcel.carrier];
  const booked = parcel.stage !== "held";

  return (
    <article className="panel overflow-hidden rounded-xl">
      <div className="grid lg:grid-cols-[1.42fr_1fr]">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-white/[0.03]">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: carrier.dot }}
                />
              </div>
              <div>
                <p className="eyebrow text-muted-foreground">
                  {parcel.carrier} · {parcel.weightKg} kg
                </p>
                <h3 className="mt-2 font-display text-[26px] font-semibold leading-none tracking-[-0.02em] text-foreground num">
                  {parcel.id}
                </h3>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {parcel.hub} · {parcel.city}
                </p>
              </div>
            </div>
            <ParcelStatusBadge
              stage={parcel.stage}
              label={STATUS_LABEL[parcel.stage]}
            />
          </div>

          <dl className="mt-7 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            <div className="bg-card px-4 py-4">
              <dt className="eyebrow text-[9px] text-muted-foreground/70">
                Line-haul
              </dt>
              <dd className="mt-1.5 text-[13px] text-foreground">
                {parcel.carrier}
              </dd>
            </div>
            <div className="bg-card px-4 py-4">
              <dt className="eyebrow text-[9px] text-muted-foreground/70">
                Weight
              </dt>
              <dd className="mt-1.5 text-[13px] text-foreground num">
                {parcel.weightKg} kg
              </dd>
            </div>
            <div className="bg-card px-4 py-4">
              <dt className="eyebrow text-[9px] text-muted-foreground/70">
                Evening window
              </dt>
              <dd
                className={cn(
                  "mt-1.5 text-[13px] num",
                  parcel.slot ? "text-route-deep" : "text-muted-foreground",
                )}
              >
                {parcel.slot ?? "Not selected"}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-col gap-3 rounded-lg border border-hub/25 bg-hub-soft p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-hub-deep" />
              <div>
                <p className="text-[9px] uppercase tracking-[0.1em] text-hub-deep mono">
                  Failed daytime attempt
                </p>
                <p className="mt-1 text-[12.5px] leading-5 text-foreground/80">
                  {parcel.failedAttempt}. Re-attempt queued for tomorrow,
                  11 AM – 2 PM.
                </p>
              </div>
            </div>
            <div className="shrink-0 sm:border-l sm:border-hub/20 sm:pl-4">
              <p className="eyebrow text-[9px] text-hub-deep/70">
                Re-attempt fee
              </p>
              <p className="mt-1 font-display text-lg leading-none text-hub-deep num">
                {rupees(parcel.reattemptCost)}
              </p>
            </div>
          </div>
        </div>

        <aside className="flex flex-col border-t border-border bg-white/[0.02] p-6 sm:p-8 lg:border-l lg:border-t-0">
          <p className="eyebrow text-route-deep">
            {booked ? "Booking status" : "Next step"}
          </p>

          {parcel.stage === "held" ? (
            <>
              <h4 className="mt-2 font-display text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
                Get it tonight, on your terms.
              </h4>
              <p className="mt-2 text-[12.5px] leading-6 text-muted-foreground">
                Choose the drop address and contact number, lock a window and
                set the fare you want to pay.
              </p>
              <ul className="mt-5 space-y-2.5 border-t border-border pt-4">
                {[
                  { icon: MapPin, text: "Delivery address & contact" },
                  { icon: Clock3, text: "8:00 – 9:30 PM window" },
                  { icon: Wallet, text: "Fare from ₹35, negotiable" },
                ].map((row) => (
                  <li
                    key={row.text}
                    className="flex items-center gap-2.5 text-[12px] text-muted-foreground"
                  >
                    <row.icon className="size-3.5 text-route" />
                    {row.text}
                  </li>
                ))}
              </ul>
              <Link
                to={`/parcel/${parcel.id}`}
                className="mt-auto flex h-11 items-center justify-center gap-2 rounded-md bg-route text-[10px] uppercase tracking-[0.1em] text-primary-foreground transition-colors hover:bg-route-deep mono"
              >
                Schedule evening delivery
                <ArrowRight className="size-3.5" />
              </Link>
              <p className="mt-2.5 text-center text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60 mono">
                Rider matched in ~42 seconds
              </p>
            </>
          ) : (
            <>
              <h4 className="mt-2 font-display text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
                {parcel.stage === "delivered"
                  ? "Delivered in the evening window."
                  : "Evening delivery booked."}
              </h4>
              <p className="mt-2 text-[12.5px] leading-6 text-muted-foreground">
                {parcel.gig
                  ? `${parcel.gig.rider} · ${parcel.gig.partner} · ${parcel.slot}`
                  : "Your evening diversion is live."}
              </p>
              <div className="mt-4 rounded-lg border border-border bg-card px-4 py-3">
                <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/70 mono">
                  Doorstep OTP
                </p>
                <p className="mt-1 font-display text-2xl tracking-[0.18em] text-foreground num">
                  {parcel.deliveryOtp}
                </p>
              </div>
              <Link
                to={`/parcel/${parcel.id}`}
                className="mt-auto flex h-11 items-center justify-center gap-2 rounded-md border border-route/40 bg-route-soft text-[10px] uppercase tracking-[0.1em] text-route-deep transition-colors hover:border-route/70 mono"
              >
                View booking &amp; OTPs
                <ArrowUpRight className="size-3.5" />
              </Link>
            </>
          )}
        </aside>
      </div>
    </article>
  );
}

function TracePanel({ parcel }: { parcel: Parcel }) {
  const lines = [
    {
      time: "20:41:03",
      scope: `${parcel.carrier.toLowerCase()}.webhook`,
      event: "attempt.failed",
      tone: "text-hub-deep",
    },
    {
      time: "20:41:04",
      scope: "lms.intercept",
      event: `hold → ${parcel.hub.toLowerCase().replace(/\s+/g, "-")}`,
      tone: "text-route-deep",
    },
    {
      time: "20:41:05",
      scope: "lms.address.verify",
      event: parcel.booking ? "resolved · 1 match" : "awaiting address",
      tone: parcel.booking ? "text-route-deep" : "text-muted-foreground",
    },
    {
      time: "20:41:06",
      scope: "lms.fare.negotiate",
      event: parcel.gig
        ? `agreed ₹${parcel.gig.fee}`
        : "quote ₹35 / ₹42",
      tone: parcel.gig ? "text-route-deep" : "text-muted-foreground",
    },
    {
      time: "20:41:07",
      scope: "rider.dispatch",
      event: parcel.gig ? parcel.gig.rider.toLowerCase().replace(/\s+/g, ".") : "pending",
      tone: parcel.gig ? "text-route-deep" : "text-muted-foreground",
    },
  ];

  return (
    <section className="panel flex flex-col rounded-xl">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <p className="eyebrow text-muted-foreground">Middleware trace</p>
        <span className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60 mono">
          sandbox
        </span>
      </div>
      <div className="flex-1 divide-y divide-border/60">
        {lines.map((line) => (
          <div
            key={line.scope}
            className="flex items-baseline gap-3 px-5 py-2.5 text-[11px] mono"
          >
            <span className="shrink-0 text-muted-foreground/40">{line.time}</span>
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              {line.scope}
            </span>
            <span className={cn("shrink-0 text-[10px]", line.tone)}>
              {line.event}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-border px-5 py-3.5">
        <p className="text-[10px] leading-5 text-muted-foreground/70 mono">
          POST https://api.lastmilesync.dev/v1/divert
          <br />
          <span className="text-route/70">200 OK</span> · signature verified
        </p>
      </div>
    </section>
  );
}
