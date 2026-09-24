"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/primitives";
import { ThemeToggle } from "@/components/theme-toggle";
import { DEFAULT_MODEL } from "@/types/jev";
import { cn } from "@/lib/utils";

export function Header({
  connected,
  onMenuClick,
  onNavigateHome,
}: {
  connected: boolean | null;
  onMenuClick: () => void;
  onNavigateHome: () => void;
}) {
  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-surface px-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Toggle sidebar">
          <Menu className="h-4 w-4" />
        </Button>
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2 rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Go to home"
        >
          <Image src="/brand/logo-64.png" alt="" width={20} height={20} priority />
          <div className="leading-tight text-left">
            <div className="text-sm font-semibold tracking-tight">Jev Studio</div>
            <div className="hidden text-[10px] text-muted sm:block">
              Structured decisions, classification and scoring
            </div>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-[11px] text-muted md:inline">Model</span>
        <Select defaultValue={DEFAULT_MODEL} disabled className="w-44 font-mono text-xs opacity-80">
          <option value={DEFAULT_MODEL}>{DEFAULT_MODEL}</option>
        </Select>
        <span
          className={cn(
            "hidden items-center gap-1 rounded-[var(--radius-sm)] border px-1.5 py-0.5 font-mono text-[11px] sm:inline-flex",
            connected ? "border-positive/30 text-positive" : "border-danger/30 text-danger"
          )}
        >
          API {connected ? "Connected" : "Disconnected"}
          <span className={cn("h-1.5 w-1.5 rounded-full", connected ? "bg-positive" : "bg-danger")} />
        </span>
        <span className="hidden font-mono text-[10px] text-muted lg:inline">⌘ Enter</span>
        <ThemeToggle />
      </div>
    </header>
  );
}
