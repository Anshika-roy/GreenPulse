import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SidebarProvider, useSidebar } from "./SidebarContext";

/**
 * AppLayout is the single structural shell for every authenticated page.
 *
 * Regions:
 *  - Sidebar   (left, collapsible, fixed width) — content supplied by caller
 *  - Navbar    (top, spans remaining width)      — content supplied by caller
 *  - Content   (scrollable outlet) — each route renders here via <Outlet />
 *
 * Collapse state lives in SidebarContext so the Sidebar's own toggle button
 * and this grid's column width always agree, without prop drilling through
 * pages that don't care about it.
 */

const SIDEBAR_WIDTH_EXPANDED = 260;
const SIDEBAR_WIDTH_COLLAPSED = 76;

interface AppLayoutProps {
  sidebar: React.ReactNode;
  navbar: React.ReactNode;
}

function AppLayoutInner({ sidebar, navbar }: AppLayoutProps) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-sunken">
      <aside
        className={cn(
          "shrink-0 overflow-hidden border-r border-border bg-surface transition-[width] duration-200 ease-out"
        )}
        style={{
          width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
        }}
        aria-label="Primary navigation"
      >
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center border-b border-border bg-surface px-6">
          {navbar}
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export function AppLayout(props: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppLayoutInner {...props} />
    </SidebarProvider>
  );
}
