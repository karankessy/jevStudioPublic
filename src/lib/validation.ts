import { z } from "zod";

export const choiceCriterionSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
});

export const choiceQuestionSchema = z.object({
  type: z.literal("choice"),
  instructions: z.string().min(1, "Choice questions need instructions."),
  criteria: z
    .array(choiceCriterionSchema)
    .min(1, "Choice questions need at least one defined criterion.")
    .max(20, "Choice questions support at most 20 options."),
});

export const scoreLevelSchema = z.object({
  label: z.string().min(1),
  description: z.string().optional(),
});

export const scoreQuestionSchema = z.object({
  type: z.literal("score"),
  instructions: z.string().min(1, "Score questions need instructions."),
  criteria: z
    .array(scoreLevelSchema)
    .min(2, "Score questions need an ordered set of criteria."),
});

export const booleanQuestionSchema = z.object({
  type: z.literal("boolean"),
  instructions: z.string().min(1, "Yes/No questions need instructions."),
  criteria: z
    .object({
      true: z.string().optional(),
      false: z.string().optional(),
    })
    .optional(),
});

export const questionSchema = z.discriminatedUnion("type", [
  choiceQuestionSchema,
  scoreQuestionSchema,
  booleanQuestionSchema,
]);

export const jevRequestSchema = z.object({
  model: z.string().min(1),
  state: z.unknown().refine((v) => {
    if (v === null || v === undefined) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object") return Object.keys(v as object).length > 0;
    return true;
  }, "Your input is empty."),
  questions: z
    .record(z.string().min(1), questionSchema)
    .refine((q) => Object.keys(q).length > 0, "Add at least one question."),
});

export type JevRequestInput = z.infer<typeof jevRequestSchema>;
