"use client";

import { GripVertical, Plus, X } from "lucide-react";
import type { ChoiceQuestion } from "@/types/jev";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/primitives";
import { makeId } from "@/lib/utils";

export function ChoiceEditor({
  question,
  onChange,
}: {
  question: ChoiceQuestion;
  onChange: (q: ChoiceQuestion) => void;
}) {
  function updateCriterion(index: number, patch: Partial<{ id: string; description: string }>) {
    const criteria = question.criteria.map((c, i) => (i === index ? { ...c, ...patch } : c));
    onChange({ ...question, criteria });
  }

  function addOption() {
    onChange({
      ...question,
      criteria: [
        ...question.criteria,
        { id: `option_${question.criteria.length + 1}`, description: "" },
      ],
    });
  }

  function removeOption(index: number) {
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
        <span className="text-xs font-medium text-muted-foreground">Criteria</span>
        <span className="font-mono text-[11px] text-muted">
          {question.criteria.length} option{question.criteria.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="space-y-1.5">
        {question.criteria.map((c, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <button
              type="button"
              className="cursor-grab text-muted hover:text-foreground"
              aria-label={`Reorder option ${i + 1}`}
              onClick={() => move(i, -1)}
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
            <Input
              value={c.id}
              onChange={(e) => updateCriterion(i, { id: e.target.value })}
              placeholder="option_id"
              className="w-32 font-mono"
              aria-label={`Option ${i + 1} id`}
            />
            <Input
              value={c.description}
              onChange={(e) => updateCriterion(i, { description: e.target.value })}
              placeholder="Human-readable description"
              aria-label={`Option ${i + 1} description`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeOption(i)}
              aria-label={`Remove option ${i + 1}`}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={addOption}>
        <Plus className="h-3.5 w-3.5" />
        Add option
      </Button>
    </div>
  );
}

export function newChoiceQuestion(): ChoiceQuestion {
  return {
    type: "choice",
    instructions: "",
    criteria: [
      { id: makeId("opt"), description: "" },
      { id: makeId("opt"), description: "" },
    ],
  };
}
