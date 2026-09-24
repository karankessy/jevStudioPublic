"use client";

import { Plus } from "lucide-react";
import type { NamedQuestion } from "@/types/jev";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/builder/question-card";
import { newChoiceQuestion } from "@/components/builder/choice-editor";
import { newScoreQuestion } from "@/components/builder/score-editor";
import { newBooleanQuestion } from "@/components/builder/boolean-editor";
import { makeId } from "@/lib/utils";

export function QuestionBuilder({
  questions,
  onChange,
}: {
  questions: NamedQuestion[];
  onChange: (qs: NamedQuestion[]) => void;
}) {
  function add(kind: "choice" | "score" | "boolean") {
    const question =
      kind === "choice" ? newChoiceQuestion() : kind === "score" ? newScoreQuestion() : newBooleanQuestion();
    onChange([...questions, { id: makeId("q"), name: "", question }]);
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold">Questions</h2>
        <p className="text-xs text-muted">Ask Jev exactly what you want it to decide.</p>
      </div>

      <div className="space-y-2">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            value={q}
            index={i}
            onChange={(v) => onChange(questions.map((existing) => (existing.id === v.id ? v : existing)))}
            onRemove={() => onChange(questions.filter((existing) => existing.id !== q.id))}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => add("choice")}>
          <Plus className="h-3.5 w-3.5" />
          Choice question
        </Button>
        <Button variant="outline" size="sm" onClick={() => add("score")}>
          <Plus className="h-3.5 w-3.5" />
          Score question
        </Button>
        <Button variant="outline" size="sm" onClick={() => add("boolean")}>
          <Plus className="h-3.5 w-3.5" />
          Yes/No question
        </Button>
      </div>

      {questions.length > 1 && (
        <p className="font-mono text-[11px] text-muted">
          {questions.length} questions · evaluated together
        </p>
      )}
    </div>
  );
}
