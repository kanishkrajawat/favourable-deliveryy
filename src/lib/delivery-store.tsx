import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  assignGig,
  INITIAL_PARCELS,
  riderEta,
  SAMPLE_IDS,
  webhookParcel,
  type Booking,
  type GigOption,
  type Parcel,
} from "./delivery-data";

export interface BookingRequest {
  slot: string;
  gig: GigOption;
  fee: number;
  place: Booking["place"];
  contact: Booking["contact"];
  method: Booking["method"];
}

interface DeliveryStore {
  parcels: Parcel[];
  selectedId: string;
  selectParcel: (id: string) => void;
  getParcel: (id: string) => Parcel | undefined;
  bookParcel: (parcelId: string, request: BookingRequest) => Booking;
  reschedule: (parcelId: string, slot: string) => void;
  syncWebhook: () => void;
  lastSync: string | null;
  syncPulse: string | null;
}

const DeliveryContext = createContext<DeliveryStore | null>(null);

function bookingReference() {
  return `LMS-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export function DeliveryProvider({ children }: { children: ReactNode }) {
  const [parcels, setParcels] = useState<Parcel[]>(INITIAL_PARCELS);
  const [selectedId, setSelectedId] = useState<string>(SAMPLE_IDS[0]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncPulse, setSyncPulse] = useState<string | null>(null);
  const syncCounter = useRef(0);

  const getParcel = useCallback(
    (id: string) => parcels.find((parcel) => parcel.id === id),
    [parcels],
  );

  const selectParcel = useCallback((id: string) => setSelectedId(id), []);

  const bookParcel = useCallback(
    (parcelId: string, request: BookingRequest) => {
      const booking: Omit<Booking, "fee"> = {
        place: request.place,
        contact: request.contact,
        reference: bookingReference(),
        method: request.method,
        paidAt: Date.now(),
      };
      setParcels((current) =>
        current.map((parcel) =>
          parcel.id === parcelId
            ? assignGig(parcel, request.slot, request.gig, request.fee, booking)
            : parcel,
        ),
      );
      toast.success(`Evening delivery confirmed for ${parcelId}`, {
        description: `${request.slot} · ${request.gig.partner} · paid ₹${request.fee}`,
      });
      return { ...booking, fee: request.fee };
    },
    [],
  );

  const reschedule = useCallback((parcelId: string, slot: string) => {
    setParcels((current) =>
      current.map((parcel) =>
        parcel.id === parcelId && parcel.gig
          ? {
              ...parcel,
              slot,
              gig: { ...parcel.gig, eta: riderEta(slot) },
              booking: parcel.booking ? { ...parcel.booking } : parcel.booking,
            }
          : parcel,
      ),
    );
  }, []);

  const syncWebhook = useCallback(() => {
    const fresh = webhookParcel(syncCounter.current);
    syncCounter.current += 1;
    setParcels((current) => [fresh, ...current]);
    setLastSync(
      new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    );
    setSyncPulse(fresh.id);
    window.setTimeout(() => setSyncPulse(null), 3400);
    toast.success(`Webhook row ingested · ${fresh.id}`, {
      description: `${fresh.carrier} · ${fresh.hub} — held for evening diversion`,
    });
  }, []);

  const value = useMemo<DeliveryStore>(
    () => ({
      parcels,
      selectedId,
      selectParcel,
      getParcel,
      bookParcel,
      reschedule,
      syncWebhook,
      lastSync,
      syncPulse,
    }),
    [
      parcels,
      selectedId,
      selectParcel,
      getParcel,
      bookParcel,
      reschedule,
      syncWebhook,
      lastSync,
      syncPulse,
    ],
  );

  return (
    <DeliveryContext.Provider value={value}>
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  const store = useContext(DeliveryContext);
  if (!store) {
    throw new Error("useDelivery must be used inside DeliveryProvider");
  }
  return store;
}
