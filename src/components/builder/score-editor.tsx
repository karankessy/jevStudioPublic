"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import type { ScoreQuestion } from "@/types/jev";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/primitives";

export function ScoreEditor({
  question,
  onChange,
}: {
  question: ScoreQuestion;
  onChange: (q: ScoreQuestion) => void;
}) {
  function update(index: number, patch: Partial<ScoreQuestion["criteria"][number]>) {
    const criteria = question.criteria.map((l, i) => (i === index ? { ...l, ...patch } : l));
    onChange({ ...question, criteria });
  }

  function addLevel() {
    onChange({ ...question, criteria: [...question.criteria, { label: "" }] });
  }

  function removeLevel(index: number) {
    onChange({ ...question, criteria: question.criteria.filter((_, i) => i !== index) });
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= question.criteria.length) return;
    const criteria = [...question.criteria];
    [criteria[index], criteria[target]] = [criteria[target], criteria[index]];
    onChange({ ...question, criteria });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Scale (ordered low → high)</span>
        <span className="font-mono text-[11px] text-muted">{question.criteria.length} levels</span>
      </div>
      <div className="space-y-1.5">
        {question.criteria.map((level, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-5 shrink-0 text-center font-mono text-[11px] text-muted">{i}</span>
            <div className="flex shrink-0 flex-col">
              <button
                type="button"
                className="text-muted hover:text-foreground disabled:opacity-30"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={`Move level ${i} up`}
              >
                <ArrowUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                className="text-muted hover:text-foreground disabled:opacity-30"
                onClick={() => move(i, 1)}
                disabled={i === question.criteria.length - 1}
                aria-label={`Move level ${i} down`}
              >
                <ArrowDown className="h-3 w-3" />
              </button>
            </div>
            <Input
              value={level.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Label"
              className="w-32"
              aria-label={`Level ${i} label`}
            />
            <Input
              value={level.description ?? ""}
              onChange={(e) => update(i, { description: e.target.value })}
              placeholder="Optional description"
              aria-label={`Level ${i} description`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeLevel(i)}
              aria-label={`Remove level ${i}`}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={addLevel}>
        <Plus className="h-3.5 w-3.5" />
        Add level
      </Button>
      <p className="text-[11px] text-muted">
        Jev returns a probability distribution across the levels and a probability-weighted score.
      </p>
    </div>
  );
}

export function newScoreQuestion(): ScoreQuestion {
  return {
    type: "score",
    instructions: "",
    criteria: [{ label: "Low" }, { label: "Moderate" }, { label: "High" }],
  };
}
