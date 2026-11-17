export type Carrier = "Delhivery" | "Ekart" | "Xpressbees";

export type ParcelStage = "held" | "assigned" | "delivered";

export type GigSlug = "rapido" | "uber";

export interface GigAssignment {
  slug: GigSlug;
  partner: string;
  fee: number;
  rider: string;
  plate: string;
  eta: string;
}

export interface DeliveryPlace {
  label: string;
  line1: string;
  city: string;
  pincode: string;
}

export interface ContactInfo {
  name: string;
  phone: string;
}

export interface Booking {
  place: DeliveryPlace;
  contact: ContactInfo;
  fee: number;
  reference: string;
  method: "UPI" | "Card";
  paidAt: number;
}

export interface Parcel {
  id: string;
  carrier: Carrier;
  weightKg: number;
  hub: string;
  city: string;
  failedAttempt: string;
  reattemptCost: number;
  stage: ParcelStage;
  slot?: string;
  gig?: GigAssignment;
  pickupOtp?: string;
  deliveryOtp?: string;
  booking?: Booking;
}

export const CARRIER_META: Record<Carrier, { code: string; dot: string }> = {
  Delhivery: { code: "DLV", dot: "#34d399" },
  Ekart: { code: "EKT", dot: "#60a5fa" },
  Xpressbees: { code: "XPB", dot: "#fbbf24" },
};

export const STATUS_LABEL: Record<ParcelStage, string> = {
  held: "Held at Local Sorting Hub",
  assigned: "Assigned to Gig Rider",
  delivered: "Delivered — Evening Slot",
};

export const PLACE_SUGGESTIONS: Record<
  string,
  { label: string; line1: string; pincode: string }
> = {
  Gurugram: {
    label: "Home",
    line1: "402, Aspen Greens, Golf Course Ext Road",
    pincode: "122018",
  },
  Bengaluru: {
    label: "Home",
    line1: "12, Palm Meadows, Whitefield Main Road",
    pincode: "560066",
  },
  Mumbai: {
    label: "Home",
    line1: "704, Sea Breeze, Andheri East",
    pincode: "400069",
  },
};

export const DEFAULT_CONTACT: ContactInfo = {
  name: "Aarav Sharma",
  phone: "+91 98110 44210",
};

export interface Slot {
  id: string;
  label: string;
  tag?: string;
  note: string;
}

export const SLOTS: Slot[] = [
  {
    id: "8:00 PM – 8:30 PM",
    label: "8:00 PM – 8:30 PM",
    tag: "Recommended",
    note: "Highest rider density in your sector",
  },
  {
    id: "8:30 PM – 9:00 PM",
    label: "8:30 PM – 9:00 PM",
    note: "Batched with two nearby drops",
  },
  {
    id: "9:00 PM – 9:30 PM",
    label: "9:00 PM – 9:30 PM",
    note: "Latest slot before hub close",
  },
];

export interface GigOption {
  slug: GigSlug;
  partner: string;
  fee: number;
  pickup: string;
  eta: string;
  note: string;
}

export const GIG_OPTIONS: GigOption[] = [
  {
    slug: "rapido",
    partner: "Rapido Parcel",
    fee: 35,
    pickup: "4 min pickup",
    eta: "18 min ride",
    note: "Batched with three nearby evening drops",
  },
  {
    slug: "uber",
    partner: "Uber Package",
    fee: 42,
    pickup: "7 min pickup",
    eta: "24 min ride",
    note: "Direct single-stop dispatch",
  },
];

const RIDERS: Array<{ name: string; plate: string }> = [
  { name: "Imran Qureshi", plate: "HR 26 DK 4412" },
  { name: "Ravi Yadav", plate: "KA 03 MN 8871" },
  { name: "Sandeep Kulkarni", plate: "MH 02 CG 2290" },
  { name: "Aarav Mehta", plate: "DL 8C AF 6634" },
  { name: "Nikhil Bose", plate: "KA 51 MJ 1187" },
];

function otp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function riderEta(slot: string) {
  const start = slot.split("–")[0]?.trim() ?? "8:00 PM";
  const [time, meridiem] = start.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  const arrive = minutes + 12;
  const hour = arrive >= 60 ? hours + 1 : hours;
  const minute = arrive % 60;
  return `${hour}:${String(minute).padStart(2, "0")} ${meridiem}`;
}

export function assignGig(
  parcel: Parcel,
  slot: string,
  gig: GigOption,
  fee = gig.fee,
  booking?: Omit<Booking, "fee">,
): Parcel {
  const rider = RIDERS[Math.floor(Math.random() * RIDERS.length)];
  return {
    ...parcel,
    stage: "assigned",
    slot,
    gig: {
      slug: gig.slug,
      partner: gig.partner,
      fee,
      rider: rider.name,
      plate: rider.plate,
      eta: riderEta(slot),
    },
    pickupOtp: otp(),
    deliveryOtp: otp(),
    booking: booking ? { ...booking, fee } : parcel.booking,
  };
}

export const SAMPLE_IDS = ["DLV-894210", "EKT-441092", "XPB-772104"];

export const INITIAL_PARCELS: Parcel[] = [
  {
    id: "DLV-894210",
    carrier: "Delhivery",
    weightKg: 1.2,
    hub: "Sector 14 Sorting Hub",
    city: "Gurugram",
    failedAttempt: "Daytime attempt · 11:42 AM — recipient at work",
    reattemptCost: 110,
    stage: "held",
  },
  {
    id: "EKT-441092",
    carrier: "Ekart",
    weightKg: 2.8,
    hub: "Whitefield Hub",
    city: "Bengaluru",
    failedAttempt: "Daytime attempt · 12:15 PM — no safe drop point",
    reattemptCost: 125,
    stage: "held",
  },
  {
    id: "XPB-772104",
    carrier: "Xpressbees",
    weightKg: 0.8,
    hub: "Andheri East Hub",
    city: "Mumbai",
    failedAttempt: "Daytime attempt · 10:58 AM — building gate locked",
    reattemptCost: 95,
    stage: "held",
  },
  {
    id: "DLV-773451",
    carrier: "Delhivery",
    weightKg: 0.6,
    hub: "Sector 14 Sorting Hub",
    city: "Gurugram",
    failedAttempt: "Daytime attempt · 11:20 AM — recipient unavailable",
    reattemptCost: 110,
    stage: "assigned",
    slot: SLOTS[0].id,
    gig: {
      slug: "rapido",
      partner: "Rapido Parcel",
      fee: 35,
      rider: "Imran Qureshi",
      plate: "HR 26 DK 4412",
      eta: "8:12 PM",
    },
    pickupOtp: "4821",
    deliveryOtp: "7390",
    booking: {
      place: {
        label: "Home",
        line1: "402, Aspen Greens, Golf Course Ext Road",
        city: "Gurugram",
        pincode: "122018",
      },
      contact: { name: "Aarav Sharma", phone: "+91 98110 44210" },
      fee: 35,
      reference: "LMS-8F21A",
      method: "UPI",
      paidAt: Date.now() - 1000 * 60 * 42,
    },
  },
  {
    id: "EKT-882310",
    carrier: "Ekart",
    weightKg: 3.4,
    hub: "Whitefield Hub",
    city: "Bengaluru",
    failedAttempt: "Daytime attempt · 12:48 PM — recipient in meetings",
    reattemptCost: 125,
    stage: "assigned",
    slot: SLOTS[1].id,
    gig: {
      slug: "uber",
      partner: "Uber Package",
      fee: 42,
      rider: "Ravi Yadav",
      plate: "KA 03 MN 8871",
      eta: "8:41 PM",
    },
    pickupOtp: "6104",
    deliveryOtp: "2857",
    booking: {
      place: {
        label: "Home",
        line1: "12, Palm Meadows, Whitefield Main Road",
        city: "Bengaluru",
        pincode: "560066",
      },
      contact: { name: "Meera Iyer", phone: "+91 98450 22187" },
      fee: 42,
      reference: "LMS-C40D2",
      method: "Card",
      paidAt: Date.now() - 1000 * 60 * 65,
    },
  },
  {
    id: "XPB-660128",
    carrier: "Xpressbees",
    weightKg: 1.1,
    hub: "Andheri East Hub",
    city: "Mumbai",
    failedAttempt: "Daytime attempt · 10:32 AM — recipient at work",
    reattemptCost: 95,
    stage: "delivered",
    slot: SLOTS[0].id,
    gig: {
      slug: "rapido",
      partner: "Rapido Parcel",
      fee: 35,
      rider: "Sandeep Kulkarni",
      plate: "MH 02 CG 2290",
      eta: "8:09 PM",
    },
    pickupOtp: "3348",
    deliveryOtp: "9912",
    booking: {
      place: {
        label: "Home",
        line1: "704, Sea Breeze, Andheri East",
        city: "Mumbai",
        pincode: "400069",
      },
      contact: { name: "Kabir Nair", phone: "+91 98200 77341" },
      fee: 35,
      reference: "LMS-19B77",
      method: "UPI",
      paidAt: Date.now() - 1000 * 60 * 60 * 26,
    },
  },
];

const WEBHOOK_SEEDS: Array<
  Pick<
    Parcel,
    "id" | "carrier" | "weightKg" | "hub" | "city" | "failedAttempt" | "reattemptCost"
  >
> = [
  {
    id: "DLV-908332",
    carrier: "Delhivery",
    weightKg: 1.7,
    hub: "Sector 14 Sorting Hub",
    city: "Gurugram",
    failedAttempt: "Daytime attempt · 1:08 PM — gate locked",
    reattemptCost: 110,
  },
  {
    id: "EKT-449871",
    carrier: "Ekart",
    weightKg: 0.9,
    hub: "Whitefield Hub",
    city: "Bengaluru",
    failedAttempt: "Daytime attempt · 1:24 PM — recipient unavailable",
    reattemptCost: 125,
  },
  {
    id: "XPB-779540",
    carrier: "Xpressbees",
    weightKg: 2.3,
    hub: "Andheri East Hub",
    city: "Mumbai",
    failedAttempt: "Daytime attempt · 2:02 PM — no answer at the door",
    reattemptCost: 95,
  },
  {
    id: "DLV-914026",
    carrier: "Delhivery",
    weightKg: 4.0,
    hub: "Sector 14 Sorting Hub",
    city: "Gurugram",
    failedAttempt: "Daytime attempt · 2:31 PM — recipient at work",
    reattemptCost: 110,
  },
];

export function webhookParcel(sequence: number): Parcel {
  const seed = WEBHOOK_SEEDS[sequence % WEBHOOK_SEEDS.length];
  const suffixes = ["DLV", "EKT", "XPB"];
  const prefix = suffixes[sequence % suffixes.length];
  const fresh = `${prefix}-${String(914100 + sequence * 37).slice(0, 6)}`;
  return {
    ...seed,
    id: sequence < WEBHOOK_SEEDS.length ? seed.id : fresh,
    stage: "held",
  };
}

export function rupees(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function savingsFor(parcel: Parcel, fee: number) {
  return Math.max(parcel.reattemptCost - fee, 0);
}

export const SAVED_TO_DATE = 118475;
