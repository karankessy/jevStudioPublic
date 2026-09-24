// Core type definitions for the Jev structured decision model.
// These mirror the three primitives Jev exposes: Choice, Score, Boolean (yes/no).
// This shape is the UI/friendly contract between the browser and /api/jev — it is
// converted to Jev's actual wire format (typed criteria records/arrays) in lib/jev.ts.

export type StateFormat = "text" | "json" | "array";

export interface ChoiceCriterion {
  id: string;
  description: string;
}

export interface ChoiceQuestion {
  type: "choice";
  instructions: string;
  criteria: ChoiceCriterion[];
}

export interface ScoreLevel {
  label: string;
  description?: string;
}

export interface ScoreQuestion {
  type: "score";
  instructions: string;
  criteria: ScoreLevel[];
}

export interface BooleanQuestion {
  type: "boolean";
  instructions: string;
  criteria?: {
    true?: string;
    false?: string;
  };
}

export type Question = ChoiceQuestion | ScoreQuestion | BooleanQuestion;
export type QuestionType = Question["type"];

export interface NamedQuestion {
  id: string;
  name: string;
  question: Question;
}

export interface Usage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface ChoiceAnswer {
  type: "choice";
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface ScoreAnswer {
  type: "score";
  score: number;
  label: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface BooleanAnswer {
  type: "boolean";
  answer: boolean;
  probability: number;
  confidence: number;
}

export type Answer = ChoiceAnswer | ScoreAnswer | BooleanAnswer;

export interface JevRequestPayload {
  model: string;
  state: unknown;
  questions: Record<string, Question>;
}

export interface JevResponse {
  model: string;
  answers: Record<string, Answer>;
  usage: Usage;
}

export interface JevErrorShape {
  code:
    | "empty_state"
    | "invalid_question"
    | "auth_error"
    | "payload_too_large"
    | "rate_limited"
    | "server_error"
    | "invalid_request";
  message: string;
  detail?: string;
}

export const MAX_REQUEST_BYTES = 32 * 1024;

export const DEFAULT_MODEL = "typesafe-ai/jev";
