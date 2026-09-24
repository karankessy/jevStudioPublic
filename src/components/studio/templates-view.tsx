"use client";

import { TEMPLATES, QUESTION_TEMPLATES } from "@/lib/templates";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { makeId } from "@/lib/utils";
import type { NamedQuestion } from "@/types/jev";

const CATEGORIES = ["Classification", "Risk", "Routing", "Verification", "Security"] as const;

export function TemplatesView({
  onUseTemplate,
  onAddQuestion,
}: {
  onUseTemplate: (id: string) => void;
  onAddQuestion: (nq: NamedQuestion) => void;
}) {
  return (
    <div className="scrollbar-thin h-full overflow-auto p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-lg font-semibold">Templates</h1>
          <p className="text-sm text-muted-foreground">
            Full evaluations you can load, or individual questions you can add to your current
            evaluation. These are starting points, not built-in classifiers — you define the
            criteria.
          </p>
        </div>

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Full evaluations
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {TEMPLATES.map((t) => (
              <Card key={t.id} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.description}</div>
                  </div>
                  <span className="font-mono text-[10px] text-muted">{t.category}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted">
                    {t.questions.length} question{t.questions.length === 1 ? "" : "s"}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => onUseTemplate(t.id)}>
                    Use template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {CATEGORIES.map((cat) => (
          <section key={cat}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {cat} questions
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {QUESTION_TEMPLATES[cat]?.map((qt, i) => (
                <Card key={i} className="flex items-center justify-between p-3">
                  <div>
                    <div className="font-mono text-xs font-medium">{qt.name}</div>
                    <div className="text-[11px] text-muted-foreground">{qt.question.instructions}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onAddQuestion({ id: makeId("q"), name: qt.name, question: qt.question })}
                  >
                    + Add
                  </Button>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
