import "server-only";
import { experimental_evaluate as evaluate, NoSuchModelError } from "ai";
import type { Experimental_EvaluationQuestion as EvaluationQuestion } from "ai";
import type {
  Answer,
  BooleanAnswer,
  BooleanQuestion,
  ChoiceAnswer,
  ChoiceQuestion,
  JevErrorShape,
  JevRequestPayload,
  JevResponse,
  Question,
  ScoreAnswer,
  ScoreQuestion,
} from "@/types/jev";
import { MAX_REQUEST_BYTES } from "@/types/jev";

export class JevError extends Error {
  shape: JevErrorShape;
  constructor(shape: JevErrorShape) {
    super(shape.message);
    this.shape = shape;
  }
}

// Convert our UI-friendly question shape into Jev's actual evaluation contract:
// choice criteria is a Record<name, description>, score criteria is an ordered
// array of level labels (position = array index), boolean criteria is unchanged.
function toEvaluationQuestion(q: Question): EvaluationQuestion {
  if (q.type === "choice") {
    const criteria: Record<string, string> = {};
    for (const c of q.criteria) criteria[c.id] = c.description;
    return { type: "choice", instructions: q.instructions, criteria };
  }
  if (q.type === "score") {
    const criteria = q.criteria.map((level) =>
      level.description ? `${level.label}: ${level.description}` : level.label
    );
    return { type: "score", instructions: q.instructions, criteria };
  }
  return {
    type: "boolean",
    instructions: q.instructions,
    criteria: q.criteria,
  };
}

function toEvaluationQuestions(
  questions: Record<string, Question>
): Record<string, EvaluationQuestion> {
  const out: Record<string, EvaluationQuestion> = {};
  for (const [id, q] of Object.entries(questions)) out[id] = toEvaluationQuestion(q);
  return out;
}

function toChoiceAnswer(
  raw: { type: "choice"; choice: string; probabilities?: Record<string, number> }
): ChoiceAnswer {
  const probabilities = raw.probabilities ?? { [raw.choice]: 1 };
  const confidence = probabilities[raw.choice] ?? Math.max(...Object.values(probabilities));
  return { type: "choice", choice: raw.choice, confidence, probabilities };
}

function toScoreAnswer(
  question: ScoreQuestion,
  raw: { type: "score"; score: number; probabilities?: Record<string, number> }
): ScoreAnswer {
  const probabilities = raw.probabilities ?? {};
  const confidence =
    Object.values(probabilities).length > 0 ? Math.max(...Object.values(probabilities)) : 1;
  const index = Math.max(0, Math.min(question.criteria.length - 1, Math.round(raw.score)));
  const label = question.criteria[index]?.label ?? String(raw.score);
  return { type: "score", score: raw.score, label, confidence, probabilities };
}

function toBooleanAnswer(raw: { type: "boolean"; probability: number }): BooleanAnswer {
  const p = Math.min(1, Math.max(0, raw.probability));
  return {
    type: "boolean",
    answer: p >= 0.5,
    probability: p,
    confidence: Math.max(p, 1 - p),
  };
}

export interface EvaluateJevOptions {
  signal?: AbortSignal;
}

export async function evaluateJev(
  payload: JevRequestPayload,
  options: EvaluateJevOptions = {}
): Promise<JevResponse> {
  const size = new TextEncoder().encode(JSON.stringify(payload)).length;
  if (size > MAX_REQUEST_BYTES) {
    throw new JevError({
      code: "payload_too_large",
      message:
        "This evaluation is larger than the API request limit. Reduce the state or split the input.",
    });
  }

  if (!process.env.AI_GATEWAY_API_KEY) {
    throw new JevError({
      code: "auth_error",
      message: "Jev authentication failed. Check the server-side API configuration.",
    });
  }

  try {
    const result = await evaluate({
      model: payload.model,
      state: payload.state as Parameters<typeof evaluate>[0]["state"],
      questions: toEvaluationQuestions(payload.questions),
      abortSignal: options.signal,
    });

    const answers: Record<string, Answer> = {};
    for (const [id, question] of Object.entries(payload.questions)) {
      const raw = result.answers[id];
      if (!raw) continue;
      if (question.type === "choice" && raw.type === "choice") {
        answers[id] = toChoiceAnswer(raw);
      } else if (question.type === "score" && raw.type === "score") {
        answers[id] = toScoreAnswer(question as ScoreQuestion, raw);
      } else if (question.type === "boolean" && raw.type === "boolean") {
        answers[id] = toBooleanAnswer(raw);
      }
    }

    return {
      model: result.response.modelId ?? payload.model,
      answers,
      usage: {
        inputTokens: result.usage.inputTokens ?? 0,
        outputTokens: result.usage.outputTokens ?? 0,
        totalTokens:
          result.usage.totalTokens ??
          (result.usage.inputTokens ?? 0) + (result.usage.outputTokens ?? 0),
      },
    };
  } catch (err) {
    if (err instanceof JevError) throw err;
    if (NoSuchModelError.isInstance(err)) {
      throw new JevError({
        code: "invalid_request",
        message: `Model "${payload.model}" is not available through the configured gateway.`,
      });
    }
    const message = err instanceof Error ? err.message : String(err);
    const lower = message.toLowerCase();
    if (lower.includes("401") || lower.includes("unauthorized") || lower.includes("api key")) {
      throw new JevError({
        code: "auth_error",
        message: "Jev authentication failed. Check the server-side API configuration.",
        detail: message,
      });
    }
    if (lower.includes("429") || lower.includes("rate limit")) {
      throw new JevError({
        code: "rate_limited",
        message: "Jev is temporarily rate-limited. Try again shortly.",
        detail: message,
      });
    }
    throw new JevError({
      code: "server_error",
      message: "The evaluation could not be completed.",
      detail: message,
    });
  }
}

// Re-exported so callers can reference the concrete question type names.
export type { ChoiceQuestion, ScoreQuestion, BooleanQuestion };
