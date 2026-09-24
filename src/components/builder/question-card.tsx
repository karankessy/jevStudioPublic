"use client";

import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useState } from "react";
import type { NamedQuestion, Question, QuestionType } from "@/types/jev";
import { Card, Input, Label, Select, Textarea } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { ChoiceEditor, newChoiceQuestion } from "@/components/builder/choice-editor";
import { ScoreEditor, newScoreQuestion } from "@/components/builder/score-editor";
import { BooleanEditor, newBooleanQuestion } from "@/components/builder/boolean-editor";
import { cn, slugify } from "@/lib/utils";

const TYPE_LABEL: Record<QuestionType, string> = {
  choice: "Choice",
  score: "Score",
  boolean: "Yes / No",
};

export function questionErrors(nq: NamedQuestion): string[] {
  const errors: string[] = [];
  if (!nq.name.trim()) errors.push("Question needs a name.");
  if (!nq.question.instructions.trim()) errors.push("Question needs instructions.");
  if (nq.question.type === "choice" && nq.question.criteria.length === 0) {
    errors.push("Choice questions need at least one defined criterion.");
  }
  if (nq.question.type === "choice") {
    const ids = nq.question.criteria.map((c) => c.id.trim());
    if (ids.some((id) => !id)) errors.push("Every option needs an id.");
    if (new Set(ids).size !== ids.length) errors.push("Option ids must be unique.");
  }
  if (nq.question.type === "score" && nq.question.criteria.length < 2) {
    errors.push("Score questions need an ordered set of criteria.");
  }
  return errors;
}

export function QuestionCard({
  value,
  index,
  onChange,
  onRemove,
}: {
  value: NamedQuestion;
  index: number;
  onChange: (v: NamedQuestion) => void;
  onRemove: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const errors = questionErrors(value);

  function setType(type: QuestionType) {
    const question: Question =
      type === "choice" ? newChoiceQuestion() : type === "score" ? newScoreQuestion() : newBooleanQuestion();
    onChange({ ...value, question: { ...question, instructions: value.question.instructions } });
  }

  const questionId = slugify(value.name);

  return (
    <Card className="animate-fade-in p-3">
      <div className="flex items-start gap-2">
        <span className="mt-1.5 font-mono text-[11px] text-muted">{index + 1}</span>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[160px] flex-1 space-y-1">
              <Label htmlFor={`name-${value.id}`}>Question name</Label>
              <Input
                id={`name-${value.id}`}
                value={value.name}
                onChange={(e) => onChange({ ...value, name: e.target.value })}
                placeholder="department"
              />
              {value.name && (
                <span className="block font-mono text-[10px] text-muted">id: {questionId}</span>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor={`type-${value.id}`}>Question type</Label>
              <Select
                id={`type-${value.id}`}
                value={value.question.type}
                onChange={(e) => setType(e.target.value as QuestionType)}
              >
                <option value="choice">Choice</option>
                <option value="score">Score</option>
                <option value="boolean">Yes / No</option>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand question" : "Collapse question"}
            >
              {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Delete question">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {!collapsed && (
            <>
              <div className="space-y-1">
                <Label htmlFor={`instructions-${value.id}`}>Instructions</Label>
                <Textarea
                  id={`instructions-${value.id}`}
                  rows={2}
                  value={value.question.instructions}
                  onChange={(e) =>
                    onChange({ ...value, question: { ...value.question, instructions: e.target.value } })
                  }
                  placeholder="Classify this request by department."
                  className="font-sans"
                />
              </div>

              {value.question.type === "choice" && (
                <ChoiceEditor
                  question={value.question}
                  onChange={(q) => onChange({ ...value, question: q })}
                />
              )}
              {value.question.type === "score" && (
                <ScoreEditor
                  question={value.question}
                  onChange={(q) => onChange({ ...value, question: q })}
                />
              )}
              {value.question.type === "boolean" && (
                <BooleanEditor
                  question={value.question}
                  onChange={(q) => onChange({ ...value, question: q })}
                />
              )}
            </>
          )}

          {collapsed && (
            <p className="truncate text-xs text-muted">
              {TYPE_LABEL[value.question.type]} — {value.question.instructions || "No instructions yet"}
            </p>
          )}

          {errors.length > 0 && (
            <ul className={cn("space-y-0.5 text-[11px] text-danger")}>
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}
