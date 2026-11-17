import { Link } from "react-router";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="LastMileSync"
    >
      <rect width="32" height="32" rx="7" fill="#0B1220" />
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="6.25"
        fill="none"
        stroke="rgba(233,238,247,0.16)"
        strokeWidth="1"
      />
      <path
        d="M7.5 12.5h12.2l-3.4-3.4"
        fill="none"
        stroke="#34D399"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24.5 19.5H12.3l3.4 3.4"
        fill="none"
        stroke="#E9EEF7"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8.2" cy="19.5" r="1.5" fill="#FBBF24" />
    </svg>
  );
}

export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      <div className="leading-none">
        <p className="font-display text-[16px] font-semibold tracking-[-0.01em] text-foreground">
          LastMile<span className="text-route">Sync</span>
        </p>
        <p className="mt-1 hidden text-[9px] uppercase tracking-[0.16em] text-muted-foreground sm:block mono">
          Evening delivery middleware
        </p>
      </div>
    </div>
  );
}

export function LiveStatusPill() {
  return (
    <div className="hidden items-center gap-2.5 rounded-full border border-border bg-white/[0.03] px-3 py-1.5 xl:flex">
      <span className="relative flex size-1.5">
        <span className="live-dot absolute inline-flex size-1.5 rounded-full bg-route text-route" />
        <span className="relative inline-flex size-1.5 rounded-full bg-route" />
      </span>
      <span className="text-[9px] uppercase tracking-[0.12em] text-foreground/80 mono">
        Middleware active
      </span>
      <span className="text-muted-foreground/40">•</span>
      <span className="text-[9px] uppercase tracking-[0.12em] text-route-deep mono">
        Zapier synced
      </span>
    </div>
  );
}

export function ViewToggle({ value }: { value: "customer" | "operations" }) {
  const items = [
    { id: "customer" as const, to: "/", label: "Customer", full: "Customer view" },
    {
      id: "operations" as const,
      to: "/dashboard",
      label: "Ops",
      full: "Operations console",
    },
  ];

  return (
    <nav
      aria-label="Switch between the customer and operations views"
      className="inline-flex items-center gap-1 rounded-lg border border-border bg-white/[0.03] p-1"
    >
      {items.map((item) => {
        const active = value === item.id;
        return (
          <Link
            key={item.id}
            to={item.to}
            aria-current={active ? "page" : undefined}
            className={[
              "rounded-md px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] transition-colors mono",
              active
                ? "bg-route text-primary-foreground"
                : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
            ].join(" ")}
          >
            <span className="lg:hidden">{item.label}</span>
            <span className="hidden lg:inline">{item.full}</span>
          </Link>
        );
      })}
    </nav>
  );
}
