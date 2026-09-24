"use client";

import type { BooleanAnswer, ChoiceAnswer, ScoreAnswer } from "@/types/jev";
import { Badge, ProbabilityBar } from "@/components/ui/primitives";
import { formatPercent } from "@/lib/utils";

export function ChoiceResultView({ answer }: { answer: ChoiceAnswer }) {
  const entries = Object.entries(answer.probabilities).sort((a, b) => b[1] - a[1]);
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-lg font-semibold">{answer.choice}</span>
        <Badge variant="accent">Confidence {answer.confidence.toFixed(2)}</Badge>
      </div>
      <div className="space-y-1.5">
        {entries.map(([id, p]) => (
          <ProbabilityBar key={id} label={id} value={p} emphasize={id === answer.choice} />
        ))}
      </div>
    </div>
  );
}

export function ScoreResultView({ answer }: { answer: ScoreAnswer }) {
  const entries = Object.entries(answer.probabilities)
    .map(([pos, p]) => ({ position: Number(pos), p }))
    .sort((a, b) => a.position - b.position);
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-3">
        <span className="text-3xl font-semibold tabular-nums">{answer.score.toFixed(2)}</span>
        <span className="pb-1 text-sm text-muted-foreground">{answer.label}</span>
        <Badge variant="accent" className="ml-auto">
          Confidence {answer.confidence.toFixed(2)}
        </Badge>
      </div>
      <div className="space-y-1.5">
        {entries.map(({ position, p }) => (
          <ProbabilityBar key={position} label={String(position)} value={p} />
        ))}
      </div>
      <p className="text-[11px] text-muted">
        Score is probability-weighted across levels, so it may fall between defined positions.
      </p>
    </div>
  );
}

export function BooleanResultView({ answer, name }: { answer: BooleanAnswer; name: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-muted-foreground">{name}</span>
        <Badge variant="accent">Confidence {answer.confidence.toFixed(2)}</Badge>
      </div>
      <div className="flex items-end gap-3">
        <span className="text-3xl font-semibold tabular-nums">
          {formatPercent(answer.answer ? answer.probability : 1 - answer.probability)}
        </span>
        <span className="pb-1 text-sm text-muted-foreground">{answer.answer ? "Yes" : "No"}</span>
      </div>
      <ProbabilityBar label="Yes" value={answer.probability} emphasize={answer.answer} />
      <ProbabilityBar label="No" value={1 - answer.probability} emphasize={!answer.answer} />
      <p className="text-[11px] text-warning">
        Probability is a model signal, not authorization.
      </p>
    </div>
  );
}
