import { createContext, useContext, useMemo, useState } from "react";

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const value = useMemo(
    () => ({ collapsed, toggle: () => setCollapsed((c) => !c) }),
    [collapsed]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

/** Access sidebar collapse state. Must be used within <SidebarProvider>. */
export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within <SidebarProvider>");
  }
  return ctx;
}
