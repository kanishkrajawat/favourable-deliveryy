import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Brand } from "@/components/delivery/Brand";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="tech-grid pointer-events-none absolute inset-0" />
      <div className="relative z-10 mx-auto flex w-full max-w-[1240px] flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <Brand />
        <p className="eyebrow mt-10 text-hub-deep">404 · Route not found</p>
        <h1 className="mt-3 max-w-lg font-display text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground">
          This route isn&apos;t on the manifest.
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          The page you followed doesn&apos;t exist. Track a parcel or head back
          to the console.
        </p>
        <Link
          to="/"
          className="mt-7 flex h-11 items-center gap-2 rounded-md bg-route px-5 text-[10px] uppercase tracking-[0.1em] text-primary-foreground transition-colors hover:bg-route-deep mono"
        >
          Back to tracking
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </main>
  );
}
