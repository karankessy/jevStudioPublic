"use client";

import type { BooleanQuestion } from "@/types/jev";
import { Input, Label } from "@/components/ui/primitives";

export function BooleanEditor({
  question,
  onChange,
}: {
  question: BooleanQuestion;
  onChange: (q: BooleanQuestion) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] text-muted">Estimate the probability that the answer is true.</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={`true-${question.instructions}`}>TRUE means (optional)</Label>
          <Input
            id={`true-${question.instructions}`}
            value={question.criteria?.true ?? ""}
            onChange={(e) =>
              onChange({
                ...question,
                criteria: { ...question.criteria, true: e.target.value },
              })
            }
            placeholder="The request violates the policy."
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`false-${question.instructions}`}>FALSE means (optional)</Label>
          <Input
            id={`false-${question.instructions}`}
            value={question.criteria?.false ?? ""}
            onChange={(e) =>
              onChange({
                ...question,
                criteria: { ...question.criteria, false: e.target.value },
              })
            }
            placeholder="The request does not violate the policy."
          />
        </div>
      </div>
    </div>
  );
}

export function newBooleanQuestion(): BooleanQuestion {
  return { type: "boolean", instructions: "" };
}
