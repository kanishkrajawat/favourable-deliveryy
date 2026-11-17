import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { LogIn, Terminal } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useDelivery } from "@/lib/delivery-store";
import { Brand, LiveStatusPill, ViewToggle } from "./Brand";
import { ChatAssistant } from "./ChatAssistant";

export function SiteShell({
  active,
  children,
}: {
  active: "customer" | "operations";
  children: ReactNode;
}) {
  const { selectedId, getParcel, reschedule } = useDelivery();
  const parcel = getParcel(selectedId);
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[64px] w-full max-w-[1240px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex shrink-0 items-center"
            aria-label="LastMileSync home"
          >
            <Brand />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <LiveStatusPill />
            <ViewToggle value={active} />
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                title={user?.email ?? "Signed in"}
                className="hidden max-w-[140px] items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[10px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:border-route/40 hover:text-foreground lg:flex mono"
              >
                <span className="size-1 rounded-full bg-route" />
                <span className="truncate">{user?.name ?? "Account"}</span>
              </Link>
            ) : (
              <Link
                to="/auth?returnTo=%2F"
                className="hidden items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[10px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:border-route/40 hover:text-foreground lg:flex mono"
              >
                <LogIn className="size-3" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-border bg-ink/60">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-5 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-col gap-3">
            <Brand />
            <p className="max-w-sm text-xs leading-6 text-muted-foreground">
              Missed daytime parcels rerouted to evening gig riders — with
              negotiated fares, doorstep OTPs and a live operations ledger.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-xs text-muted-foreground lg:items-end">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                to="/dashboard"
                className="transition-colors hover:text-route"
              >
                Operations console
              </Link>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="transition-colors hover:text-route"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  to="/auth?returnTo=%2Fdashboard"
                  className="transition-colors hover:text-route"
                >
                  Partner sign in
                </Link>
              )}
              <span className="inline-flex items-center gap-1.5 text-muted-foreground/70 mono text-[10px] uppercase tracking-[0.1em]">
                <Terminal className="size-3" />
                API v1 · Webhooks live
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60 mono">
              ElevenLabs · Botpress · Zapier
            </p>
          </div>
        </div>
      </footer>

      {parcel && (
        <ChatAssistant
          key={parcel.id}
          parcel={parcel}
          onReschedule={(slot) => reschedule(parcel.id, slot)}
        />
      )}
    </div>
  );
}
