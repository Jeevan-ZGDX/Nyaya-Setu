import { Link, NavLink, useLocation } from "react-router-dom";
import { Scale, Search, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Command" },
  { to: "/feed", label: "Live Feed" },
  { to: "/dashboard", label: "Decisions" },
];

export function TopBar() {
  const loc = useLocation();
  return (
    <header className="sticky top-0 z-40 surface-glass border-b border-border">
      <div className="mx-auto max-w-[1500px] px-6 h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Scale className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <div className="font-display text-lg font-semibold tracking-tight">Nyaya<span className="text-primary-glow">·</span>Setu</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">AI Legal Co-Pilot</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-6">
          {navItems.map((n) => {
            const active = n.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(n.to);
            return (
              <NavLink
                key={n.to}
                to={n.to}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  active ? "text-foreground bg-surface-elevated" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {n.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 surface-glass rounded-lg px-3 py-1.5 w-72">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              placeholder="Search cases, officers, citations…"
              className="bg-transparent flex-1 text-xs outline-none placeholder:text-muted-foreground"
            />
            <kbd className="text-[10px] font-mono text-muted-foreground border border-border-strong rounded px-1">⌘K</kbd>
          </div>
          <button className="h-9 w-9 grid place-items-center rounded-lg surface-glass hover:border-border-strong transition-colors">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2 surface-glass rounded-lg pl-2 pr-3 py-1">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-primary to-accent grid place-items-center">
              <User className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <div className="leading-tight hidden lg:block">
              <div className="text-xs font-medium">A. Sharma</div>
              <div className="text-[10px] text-muted-foreground">Legal Cell · Sec.</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
