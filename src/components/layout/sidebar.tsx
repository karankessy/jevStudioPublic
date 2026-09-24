"use client";

import {
  BookOpen,
  Braces,
  Clock,
  FileJson,
  Info,
  LayoutTemplate,
  Plus,
  Send,
  Settings,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { View } from "@/components/studio/types";

const WORKSPACE: { view: View; label: string; icon: React.ElementType }[] = [
  { view: "new", label: "New Evaluation", icon: Plus },
  { view: "history", label: "History", icon: Clock },
  { view: "saved", label: "Saved Evaluations", icon: Star },
];

const TOOLS: { view: View; label: string; icon: React.ElementType }[] = [
  { view: "templates", label: "Templates", icon: LayoutTemplate },
  { view: "playground", label: "JSON Playground", icon: Braces },
  { view: "request", label: "API Request", icon: Send },
  { view: "response", label: "API Response", icon: FileJson },
];

const INFO: { view: View; label: string; icon: React.ElementType }[] = [
  { view: "docs", label: "Documentation", icon: BookOpen },
  { view: "about", label: "About Jev", icon: Info },
];

function NavGroup({
  title,
  items,
  view,
  onNavigate,
}: {
  title: string;
  items: typeof WORKSPACE;
  view: View;
  onNavigate: (v: View) => void;
}) {
  return (
    <div>
      <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
        {title}
      </div>
      <nav className="space-y-0.5">
        {items.map((item) => (
          <button
            key={item.view}
            type="button"
            onClick={() => onNavigate(item.view)}
            className={cn(
              "flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-xs transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              view === item.view
                ? "bg-surface text-foreground font-medium"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            )}
          >
            <item.icon className="h-3.5 w-3.5 shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export function Sidebar({
  view,
  onNavigate,
  connected,
  model,
  className,
}: {
  view: View;
  onNavigate: (v: View) => void;
  connected: boolean | null;
  model: string;
  className?: string;
}) {
  return (
    <aside className={cn("flex h-full flex-col justify-between border-r border-border bg-surface", className)}>
      <div className="space-y-5 overflow-y-auto p-3">
        <NavGroup title="Workspace" items={WORKSPACE} view={view} onNavigate={onNavigate} />
        <NavGroup title="Tools" items={TOOLS} view={view} onNavigate={onNavigate} />
        <NavGroup title="Information" items={INFO} view={view} onNavigate={onNavigate} />
      </div>
      <div className="space-y-1.5 border-t border-border p-3">
        <button
          type="button"
          onClick={() => onNavigate("settings")}
          className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-surface-raised hover:text-foreground"
        >
          <Settings className="h-3.5 w-3.5" />
          Settings
        </button>
        <div className="flex items-center gap-1.5 px-2 text-[11px]">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              connected === null ? "bg-muted" : connected ? "bg-positive" : "bg-danger"
            )}
          />
          <span className="text-muted-foreground">
            {connected === null ? "Checking..." : connected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div className="px-2 font-mono text-[11px] text-muted">{model}</div>
      </div>
    </aside>
  );
}
