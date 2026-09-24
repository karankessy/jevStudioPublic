"use client";

import { Braces, ListChecks, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { TEMPLATES } from "@/lib/templates";

export function EmptyState({
  onStart,
  onOpenPlayground,
  onOpenTemplates,
}: {
  onStart: (templateId: string) => void;
  onOpenPlayground: () => void;
  onOpenTemplates: () => void;
}) {
  const classification = TEMPLATES.find((t) => t.id === "topic-classification")!;
  const risk = TEMPLATES.find((t) => t.id === "risk-level")!;
  const yesno = TEMPLATES.find((t) => t.id === "policy-violation")!;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
      <div>
        <h2 className="text-lg font-semibold">Make a decision.</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Give Jev some state and define what you want to know about it.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onStart(classification.id)}>
          <ListChecks className="h-3.5 w-3.5" />
          Start with classification
        </Button>
        <Button variant="outline" size="sm" onClick={() => onStart(risk.id)}>
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Start with risk scoring
        </Button>
        <Button variant="outline" size="sm" onClick={() => onStart(yesno.id)}>
          <ShieldCheck className="h-3.5 w-3.5" />
          Start with yes/no
        </Button>
        <Button variant="outline" size="sm" onClick={onOpenPlayground}>
          <Braces className="h-3.5 w-3.5" />
          Open JSON Playground
        </Button>
      </div>

      <div className="w-full max-w-2xl space-y-2 pt-4">
        <button
          className="text-xs text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground"
          onClick={onOpenTemplates}
        >
          Or choose a template
        </button>
        <div className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-3">
          {TEMPLATES.slice(0, 6).map((t) => (
            <Card
              key={t.id}
              className="cursor-pointer p-3 text-left transition-colors hover:border-accent/50"
              onClick={() => onStart(t.id)}
            >
              <div className="text-xs font-medium">{t.name}</div>
              <div className="mt-0.5 font-mono text-[10px] text-muted">{t.category}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
