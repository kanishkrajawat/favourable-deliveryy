import { SiteShell } from "@/components/delivery/SiteShell";
import { HubLedger } from "@/components/delivery/HubLedger";

export default function Dashboard() {
  return (
    <SiteShell active="operations">
      <HubLedger />
    </SiteShell>
  );
}
