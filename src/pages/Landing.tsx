import { SiteShell } from "@/components/delivery/SiteShell";
import { TrackingWorkspace } from "@/components/delivery/TrackingWorkspace";

export default function Landing() {
  return (
    <SiteShell active="customer">
      <TrackingWorkspace />
    </SiteShell>
  );
}
