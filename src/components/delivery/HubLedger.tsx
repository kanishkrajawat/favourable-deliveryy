import { useMemo, useState } from "react";
import { RefreshCw, Search, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDelivery } from "@/lib/delivery-store";
import {
  CARRIER_META,
  rupees,
  SAVED_TO_DATE,
  type Carrier,
  type ParcelStage,
} from "@/lib/delivery-data";
import { ParcelStatusBadge } from "./ParcelStatusBadge";

const COLUMNS = [
  "Tracking ID",
  "Line-Haul Carrier",
  "Hub Location",
  "Evening Slot",
  "Assigned Gig Partner",
  "Rider & OTP",
  "Status",
];

export function HubLedger() {
  const { parcels, syncWebhook, lastSync, syncPulse } = useDelivery();
  const [carrier, setCarrier] = useState<"all" | Carrier>("all");
  const [stage, setStage] = useState<"all" | ParcelStage>("all");
  const [query, setQuery] = useState("");

  const held = parcels.filter((parcel) => parcel.stage === "held").length;
  const dispatched = parcels.filter(
    (parcel) => parcel.stage === "assigned",
  ).length;
  const liveSaved = parcels.reduce(
    (total, parcel) =>
      parcel.gig
        ? total + Math.max(parcel.reattemptCost - parcel.gig.fee, 0)
        : total,
    0,
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return parcels.filter((parcel) => {
      if (carrier !== "all" && parcel.carrier !== carrier) return false;
      if (stage !== "all" && parcel.stage !== stage) return false;
      if (!needle) return true;
      return (
        parcel.id.toLowerCase().includes(needle) ||
        parcel.hub.toLowerCase().includes(needle) ||
        parcel.city.toLowerCase().includes(needle) ||
        (parcel.gig?.rider ?? "").toLowerCase().includes(needle)
      );
    });
  }, [parcels, carrier, stage, query]);

  return (
    <main className="mx-auto w-full max-w-[1240px] px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-1.5 rounded-full bg-route" />
            <p className="eyebrow text-muted-foreground">
              Operations console · live
            </p>
          </div>
          <h1 className="mt-4 max-w-2xl font-display text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-[1] tracking-[-0.035em] text-foreground">
            Every diversion,
            <br />
            on the record.
          </h1>
          <p className="mt-4 max-w-lg text-[13.5px] leading-6 text-muted-foreground">
            Held parcels, matched riders and negotiated fares — streamed from
            courier webhooks into a single ledger.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 lg:items-end">
          <button
            type="button"
            onClick={syncWebhook}
            className="flex h-10 items-center gap-2 rounded-md bg-route px-4 text-[10px] uppercase tracking-[0.1em] text-primary-foreground transition-colors hover:bg-route-deep mono"
          >
            <RefreshCw className={cn("size-3.5", syncPulse && "animate-spin")} />
            Add / Sync Webhook Row
          </button>
          <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60 mono">
            {lastSync
              ? `Last Zapier sync · ${lastSync}`
              : "Zapier webhook · 2 min ago"}
          </p>
        </div>
      </div>

      <dl className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Active Hub Holds"
          value={String(held).padStart(2, "0")}
          note="Across 3 partner hubs"
          accent="hub"
        />
        <Metric
          label="Evening Batches Dispatched"
          value={String(dispatched).padStart(2, "0")}
          note="Gig riders collecting tonight"
          accent="route"
        />
        <Metric
          label="Courier Cost Saved (₹)"
          value={rupees(SAVED_TO_DATE + liveSaved)}
          note={`+${rupees(liveSaved)} from batched fares`}
          accent="route"
        />
        <div className="bg-route p-5 text-primary-foreground">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase tracking-[0.1em] text-primary-foreground/70 mono">
              Zapier Webhook Status
            </p>
            <Zap className="size-3.5 text-primary-foreground/80" />
          </div>
          <p className="mt-4 flex items-center gap-2 font-display text-[26px] font-semibold leading-none">
            Active
            <span className="relative flex size-1.5">
              <span className="absolute -inset-1 animate-ping rounded-full bg-primary-foreground/25" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary-foreground" />
            </span>
          </p>
          <p className="mt-2 text-[9px] uppercase tracking-[0.1em] text-primary-foreground/60 mono">
            {lastSync ? `Synced ${lastSync}` : "Synced 12s ago"}
          </p>
        </div>
      </dl>

      <div className="panel mt-5 overflow-hidden rounded-xl">
        <div className="flex flex-col gap-4 border-b border-border p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex size-1.5">
                <span className="live-dot absolute inline-flex size-1.5 rounded-full bg-route text-route" />
                <span className="relative inline-flex size-1.5 rounded-full bg-route" />
              </span>
              <p className="eyebrow text-muted-foreground">
                Live logistics ledger
              </p>
            </div>
            <h2 className="mt-2 font-display text-[21px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
              Tonight&apos;s evening batches
            </h2>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-white/[0.03] px-2.5">
              <Search className="size-3.5 shrink-0 text-muted-foreground" />
              <label htmlFor="ledger-search" className="sr-only">
                Filter ledger
              </label>
              <input
                id="ledger-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search ID, hub or rider"
                className="w-full min-w-0 bg-transparent text-[11px] outline-none placeholder:text-muted-foreground/50 sm:w-[172px]"
              />
            </div>
            <label className="sr-only" htmlFor="carrier-filter">
              Filter by carrier
            </label>
            <select
              id="carrier-filter"
              value={carrier}
              onChange={(event) =>
                setCarrier(event.target.value as "all" | Carrier)
              }
              className="h-9 rounded-md border border-border bg-white/[0.03] px-2 text-[11px] text-foreground/80 outline-none focus:border-route/50"
            >
              <option value="all">All carriers</option>
              <option value="Delhivery">Delhivery</option>
              <option value="Ekart">Ekart</option>
              <option value="Xpressbees">Xpressbees</option>
            </select>
            <label className="sr-only" htmlFor="status-filter">
              Filter by status
            </label>
            <select
              id="status-filter"
              value={stage}
              onChange={(event) =>
                setStage(event.target.value as "all" | ParcelStage)
              }
              className="h-9 rounded-md border border-border bg-white/[0.03] px-2 text-[11px] text-foreground/80 outline-none focus:border-route/50"
            >
              <option value="all">All statuses</option>
              <option value="held">Held at hub</option>
              <option value="assigned">Assigned to rider</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-white/[0.02]">
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground mono"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((parcel) => (
                <tr
                  key={parcel.id}
                  className={cn(
                    "border-b border-border/70 align-top transition-colors last:border-0 hover:bg-white/[0.025]",
                    syncPulse === parcel.id && "row-flash",
                  )}
                >
                  <td className="px-4 py-4">
                    <p className="text-[12px] text-foreground num">{parcel.id}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {parcel.weightKg} kg · {parcel.city}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-2 text-[12px] text-foreground/80">
                      <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: CARRIER_META[parcel.carrier].dot,
                        }}
                      />
                      {parcel.carrier}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-[12px] text-foreground/80">
                      {parcel.hub}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {parcel.city}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    {parcel.slot ? (
                      <span className="whitespace-nowrap text-[12px] text-foreground/80 num">
                        {parcel.slot}
                      </span>
                    ) : (
                      <span className="text-[12px] text-muted-foreground/50">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {parcel.gig ? (
                      <>
                        <p className="whitespace-nowrap text-[12px] text-foreground/80">
                          {parcel.gig.partner}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground num">
                          {rupees(parcel.booking?.fee ?? parcel.gig.fee)} fare
                        </p>
                      </>
                    ) : (
                      <span className="text-[12px] text-muted-foreground/60">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {parcel.gig ? (
                      <>
                        <p className="whitespace-nowrap text-[12px] text-foreground/80">
                          {parcel.gig.rider}
                        </p>
                        <p className="mt-0.5 whitespace-nowrap text-[10px] tracking-[0.04em] text-muted-foreground num">
                          {parcel.gig.plate} · {parcel.pickupOtp} /{" "}
                          {parcel.deliveryOtp}
                        </p>
                      </>
                    ) : (
                      <span className="text-[12px] text-muted-foreground/60">
                        Awaiting diversion
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <ParcelStatusBadge stage={parcel.stage} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <p className="font-display text-xl text-foreground">
                      No parcels match this filter.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCarrier("all");
                        setStage("all");
                        setQuery("");
                      }}
                      className="mt-3 border-b border-border pb-0.5 text-[9px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-route mono"
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-border px-5 py-3.5 text-[9px] uppercase tracking-[0.1em] text-muted-foreground/70 sm:flex-row sm:items-center sm:justify-between sm:px-6 mono">
          <span>
            Showing {rows.length} of {parcels.length} parcels
          </span>
          <span className="flex items-center gap-1.5 text-route-deep">
            <span className="size-1 rounded-full bg-route" />
            Zapier webhook connected · updates stream live
          </span>
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  accent: "hub" | "route";
}) {
  return (
    <div className="bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground mono">
          {label}
        </p>
        <span
          className={cn(
            "h-1 w-1 rounded-full",
            accent === "hub" ? "bg-hub" : "bg-route",
          )}
        />
      </div>
      <p className="mt-3 font-display text-[26px] font-semibold leading-none tracking-[-0.02em] text-foreground num">
        {value}
      </p>
      <p className="mt-2 text-[9px] uppercase tracking-[0.1em] text-muted-foreground/70 mono">
        {note}
      </p>
    </div>
  );
}
