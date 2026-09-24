"use client";

import { useMemo, useState } from "react";
import type {
  JevRequestPayload,
  JevResponse,
  NamedQuestion,
  Question,
  StateFormat,
} from "@/types/jev";
import { DEFAULT_MODEL, MAX_REQUEST_BYTES } from "@/types/jev";
import { questionErrors } from "@/components/builder/question-card";
import { byteSize, slugify } from "@/lib/utils";
import { addHistory } from "@/lib/storage";
import type { EvaluationRecord } from "@/lib/storage";

export type LoadingStage = "idle" | "evaluating" | "receiving";

export interface EvaluationState {
  model: string;
  mode: "guided" | "json";
  stateFormat: StateFormat;
  stateValue: string;
  questions: NamedQuestion[];
}

export function parseState(format: StateFormat, value: string): unknown {
  if (format === "text") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function buildQuestionMap(questions: NamedQuestion[]): Record<string, Question> {
  const map: Record<string, Question> = {};
  const seen = new Set<string>();
  for (const nq of questions) {
    let id = slugify(nq.name || "question");
    let n = 1;
    while (seen.has(id)) {
      id = `${slugify(nq.name || "question")}_${n}`;
      n += 1;
    }
    seen.add(id);
    map[id] = nq.question;
  }
  return map;
}

export function buildPayload(state: EvaluationState): JevRequestPayload {
  return {
    model: state.model,
    state: parseState(state.stateFormat, state.stateValue),
    questions: buildQuestionMap(state.questions),
  };
}

export function validateEvaluation(state: EvaluationState): string[] {
  const errors: string[] = [];
  if (!state.stateValue.trim()) errors.push("Your input is empty.");
  if (state.stateFormat !== "text" && state.stateValue.trim()) {
    try {
      const parsed = JSON.parse(state.stateValue);
      if (state.stateFormat === "array" && !Array.isArray(parsed)) {
        errors.push("Array mode expects a JSON array.");
      }
    } catch {
      errors.push("State JSON is invalid.");
    }
  }
  if (state.questions.length === 0) errors.push("Add at least one question.");
  for (const q of state.questions) errors.push(...questionErrors(q));

  const ids = state.questions.map((q) => slugify(q.name || "question"));
  if (new Set(ids).size !== ids.length) errors.push("Question names must be unique.");

  const size = byteSize(buildPayload(state));
  if (size > MAX_REQUEST_BYTES) {
    errors.push("This evaluation is larger than the API request limit. Reduce the state or split the input.");
  }
  return Array.from(new Set(errors));
}

export function useEvaluation(initial?: Partial<EvaluationState>) {
  const [state, setState] = useState<EvaluationState>({
    model: DEFAULT_MODEL,
    mode: "guided",
    stateFormat: "text",
    stateValue: "",
    questions: [],
    ...initial,
  });
  const [stage, setStage] = useState<LoadingStage>("idle");
  const [error, setError] = useState<{ message: string; detail?: string } | null>(null);
  const [response, setResponse] = useState<JevResponse | null>(null);
  const [lastRequest, setLastRequest] = useState<JevRequestPayload | null>(null);

  const errors = useMemo(() => validateEvaluation(state), [state]);
  const payload = useMemo(() => buildPayload(state), [state]);
  const requestSize = useMemo(() => byteSize(payload), [payload]);

  async function run() {
    if (errors.length > 0) return;
    setError(null);
    setStage("evaluating");
    setResponse(null);
    setLastRequest(payload);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60_000);
      const res = await fetch("/api/jev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      setStage("receiving");
      const json = await res.json();
      if (!res.ok) {
        setError({ message: json.message ?? "The evaluation could not be completed.", detail: json.detail });
        setStage("idle");
        return;
      }
      setResponse(json as JevResponse);
      const record: EvaluationRecord = {
        id: `eval_${Date.now()}`,
        name: state.questions.map((q) => q.name).join(", ") || "Untitled evaluation",
        createdAt: Date.now(),
        model: state.model,
        stateFormat: state.stateFormat,
        state: state.stateValue,
        questions: state.questions,
        response: json as JevResponse,
      };
      addHistory(record);
    } catch (err) {
      setError({
        message: "The evaluation could not be completed.",
        detail: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setStage("idle");
    }
  }

  return {
    state,
    setState,
    stage,
    error,
    setError,
    response,
    setResponse,
    lastRequest,
    errors,
    payload,
    requestSize,
    run,
  };
}
