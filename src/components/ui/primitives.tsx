"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border border-border bg-surface-raised",
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-8 w-full rounded-[var(--radius-sm)] border border-border bg-background px-2.5 text-sm",
        "placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-[var(--radius-sm)] border border-border bg-background px-2.5 py-2 text-sm",
        "placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "font-mono resize-y",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-8 rounded-[var(--radius-sm)] border border-border bg-background px-2 text-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "accent" | "positive" | "warning" | "danger";
}) {
  const variants = {
    default: "bg-surface text-muted-foreground border-border",
    accent: "bg-accent/10 text-accent border-accent/20",
    positive: "bg-positive/10 text-positive border-positive/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-danger/10 text-danger border-danger/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] border px-1.5 py-0.5 text-[11px] font-mono",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex rounded-[var(--radius-sm)] border border-border bg-surface p-0.5 text-sm",
        className
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          type="button"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-[3px] px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            value === opt.value
              ? "bg-surface-raised text-foreground shadow-sm border border-border"
              : "text-muted hover:text-foreground border border-transparent"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function ProbabilityBar({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: number;
  emphasize?: boolean;
}) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={cn(
          "w-28 shrink-0 truncate font-mono",
          emphasize ? "text-foreground font-medium" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
        <div
          className={cn("h-full rounded-full", emphasize ? "bg-accent" : "bg-muted")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-9 shrink-0 text-right font-mono text-muted-foreground">{pct}%</span>
    </div>
  );
}

export function Tabs({
  value,
  onChange,
  tabs,
}: {
  value: string;
  onChange: (v: string) => void;
  tabs: { value: string; label: string }[];
}) {
  return (
    <div role="tablist" className="flex items-center gap-4 border-b border-border px-1">
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          type="button"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            "relative py-2 text-xs font-medium text-muted transition-colors hover:text-foreground focus-visible:outline-none",
            value === t.value && "text-foreground"
          )}
        >
          {t.label}
          {value === t.value && (
            <span className="absolute inset-x-0 -bottom-px h-[2px] bg-accent" />
          )}
        </button>
      ))}
    </div>
  );
}
