import { useParams } from "react-router";
import { SiteShell } from "@/components/delivery/SiteShell";
import { ParcelDetail } from "@/components/delivery/ParcelDetail";

export default function ParcelPage() {
  const { id } = useParams<{ id: string }>();
  const parcelId = decodeURIComponent(id ?? "");

  return (
    <SiteShell active="customer">
      <ParcelDetail key={parcelId} parcelId={parcelId} />
    </SiteShell>
  );
}
