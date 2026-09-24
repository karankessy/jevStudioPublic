"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Play } from "lucide-react";
import type { EvaluationState, LoadingStage } from "@/components/studio/use-evaluation";
import { SegmentedControl } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { StateInput } from "@/components/builder/state-input";
import { QuestionBuilder } from "@/components/builder/question-builder";
import { JsonView } from "@/components/json-view";
import { MAX_REQUEST_BYTES } from "@/types/jev";
import { cn, formatBytes } from "@/lib/utils";

const STAGE_LABEL: Record<LoadingStage, string> = {
  idle: "",
  evaluating: "Evaluating questions...",
  receiving: "Receiving structured decision...",
};

export function EvaluationBuilder({
  state,
  setState,
  errors,
  requestSize,
  stage,
  error,
  onRun,
  payload,
}: {
  state: EvaluationState;
  setState: React.Dispatch<React.SetStateAction<EvaluationState>>;
  errors: string[];
  requestSize: number;
  stage: LoadingStage;
  error: { message: string; detail?: string } | null;
  onRun: () => void;
  payload: unknown;
}) {
  const [showErrors, setShowErrors] = useState(false);
  const pct = Math.min(100, (requestSize / MAX_REQUEST_BYTES) * 100);
  const nearLimit = pct > 75;

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        setShowErrors(true);
        if (errors.length === 0) onRun();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [errors, onRun]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="leading-tight">
          <h1 className="text-sm font-semibold">Evaluation</h1>
        </div>
        <SegmentedControl
          value={state.mode}
          onChange={(v) => setState((s) => ({ ...s, mode: v }))}
          options={[
            { value: "guided", label: "Guided" },
            { value: "json", label: "JSON" },
          ]}
        />
      </div>

      <div className="scrollbar-thin flex-1 space-y-5 overflow-auto p-4">
        {state.mode === "guided" ? (
          <>
            <StateInput
              format={state.stateFormat}
              onFormatChange={(f) => setState((s) => ({ ...s, stateFormat: f }))}
              value={state.stateValue}
              onChange={(v) => setState((s) => ({ ...s, stateValue: v }))}
            />
            <QuestionBuilder
              questions={state.questions}
              onChange={(qs) => setState((s) => ({ ...s, questions: qs }))}
            />
          </>
        ) : (
          <div className="space-y-2">
            <div>
              <h2 className="text-sm font-semibold">Request payload</h2>
              <p className="text-xs text-muted">
                Advanced mode — inspect the exact JSON sent to Jev. Edit the Guided view to change it.
              </p>
            </div>
            <JsonView data={payload} filename="jev-request.json" />
          </div>
        )}
      </div>

      <div className="space-y-2 border-t border-border p-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className={cn("font-mono", nearLimit ? "text-warning" : "text-muted")}>
            {formatBytes(requestSize)} / {formatBytes(MAX_REQUEST_BYTES)}
          </span>
          {stage !== "idle" && (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {STAGE_LABEL[stage]}
            </span>
          )}
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-surface">
          <div
            className={cn("h-full rounded-full", nearLimit ? "bg-warning" : "bg-accent")}
            style={{ width: `${pct}%` }}
          />
        </div>

        {showErrors && errors.length > 0 && (
          <div className="space-y-1 rounded-[var(--radius-sm)] border border-danger/30 bg-danger/5 p-2 text-[11px] text-danger">
            {errors.map((e) => (
              <div key={e} className="flex items-start gap-1.5">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                {e}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="space-y-1 rounded-[var(--radius-sm)] border border-danger/30 bg-danger/5 p-2 text-[11px] text-danger">
            <div className="flex items-start gap-1.5">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              {error.message}
            </div>
            <div className="flex items-center gap-2 pl-4">
              <button className="underline" onClick={onRun}>
                Retry
              </button>
              {error.detail && (
                <details>
                  <summary className="cursor-pointer">View raw error</summary>
                  <pre className="mt-1 whitespace-pre-wrap font-mono text-[10px]">{error.detail}</pre>
                </details>
              )}
            </div>
          </div>
        )}

        <Button
          variant="primary"
          className="w-full"
          disabled={stage !== "idle"}
          onClick={() => {
            setShowErrors(true);
            if (errors.length === 0) onRun();
          }}
        >
          {stage !== "idle" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          Evaluate with Jev
          <span className="ml-auto font-mono text-[10px] opacity-70">⌘ Enter</span>
        </Button>
      </div>
    </div>
  );
}
