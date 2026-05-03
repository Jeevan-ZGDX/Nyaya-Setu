import { Outlet } from "react-router-dom";
import { TopBar } from "@/components/nyaya/TopBar";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-[1500px] px-6 py-5 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>© 2026 Nyaya·Setu — AI Legal Governance System</span>
          <span className="font-mono uppercase tracking-widest">v0.4 · prototype</span>
        </div>
      </footer>
    </div>
  );
}
