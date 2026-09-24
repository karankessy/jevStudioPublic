import type { NamedQuestion, StateFormat } from "@/types/jev";
import { makeId } from "@/lib/utils";

export interface EvaluationTemplate {
  id: string;
  name: string;
  description: string;
  category:
    | "Classification"
    | "Risk"
    | "Routing"
    | "Verification"
    | "Security";
  stateFormat: StateFormat;
  state: string;
  questions: NamedQuestion[];
}

function q(name: string, question: NamedQuestion["question"]): NamedQuestion {
  return { id: makeId("q"), name, question };
}

export const TEMPLATES: EvaluationTemplate[] = [
  {
    id: "topic-classification",
    name: "Topic classification",
    description: "Classify text into a fixed set of topics.",
    category: "Classification",
    stateFormat: "text",
    state:
      "Our Q3 revenue grew 18% year over year, driven mostly by enterprise contract renewals.",
    questions: [
      q("content_category", {
        type: "choice",
        instructions: "Classify this text by topic.",
        criteria: [
          { id: "technical", description: "Technical or engineering content" },
          { id: "business", description: "Business, finance, or strategy content" },
          { id: "personal", description: "Personal or informal content" },
          { id: "spam", description: "Spam or irrelevant content" },
          { id: "other", description: "Anything else" },
        ],
      }),
    ],
  },
  {
    id: "department-routing",
    name: "Department routing",
    description: "Route a support ticket to the right department.",
    category: "Routing",
    stateFormat: "text",
    state: "I was charged twice for my subscription this month, can you fix it?",
    questions: [
      q("department", {
        type: "choice",
        instructions: "Classify this request by department.",
        criteria: [
          { id: "billing", description: "Billing or payment related" },
          { id: "technical", description: "Technical issue" },
          { id: "account", description: "Account or access related" },
          { id: "other", description: "Anything else" },
        ],
      }),
      q("urgency", {
        type: "score",
        instructions: "How urgent is this request?",
        criteria: [
          { label: "Low" },
          { label: "Moderate" },
          { label: "High" },
          { label: "Critical" },
        ],
      }),
      q("needs_human_review", {
        type: "boolean",
        instructions: "Does this request need a human support agent?",
      }),
      q("sentiment", {
        type: "score",
        instructions: "How negative is the customer's tone?",
        criteria: [
          { label: "Positive" },
          { label: "Neutral" },
          { label: "Negative" },
          { label: "Very negative" },
        ],
      }),
    ],
  },
  {
    id: "risk-level",
    name: "Risk level",
    description: "Score the risk level of a request or event.",
    category: "Risk",
    stateFormat: "json",
    state: JSON.stringify(
      {
        user: { role: "customer", verified: true },
        transaction: { amount: 680, currency: "USD" },
        policy: "Refunds above USD 500 require approval.",
      },
      null,
      2
    ),
    questions: [
      q("risk", {
        type: "score",
        instructions: "How risky is this request?",
        criteria: [
          { label: "Low" },
          { label: "Moderate" },
          { label: "High" },
          { label: "Critical" },
        ],
      }),
    ],
  },
  {
    id: "policy-violation",
    name: "Policy violation",
    description: "Check whether a request violates a stated policy.",
    category: "Risk",
    stateFormat: "json",
    state: JSON.stringify(
      {
        user: { role: "customer", verified: true },
        transaction: { amount: 680, currency: "USD" },
        policy: "Refunds above USD 500 require approval.",
      },
      null,
      2
    ),
    questions: [
      q("violates_policy", {
        type: "boolean",
        instructions: "Does this request violate the stated policy?",
        criteria: {
          true: "The request violates the policy.",
          false: "The request does not violate the policy.",
        },
      }),
    ],
  },
  {
    id: "task-completion",
    name: "Verify completion",
    description: "Check whether an objective has been completed.",
    category: "Verification",
    stateFormat: "text",
    state:
      "Task: migrate the billing service to the new database.\nEvidence: migration script ran successfully, all rows verified, old table archived.",
    questions: [
      q("is_complete", {
        type: "boolean",
        instructions: "Is the stated objective complete based on the evidence?",
      }),
      q("confidence_review", {
        type: "boolean",
        instructions: "Does this result need a human reviewer before closing?",
      }),
    ],
  },
  {
    id: "model-routing",
    name: "Model routing",
    description: "Route a task to the right model tier.",
    category: "Routing",
    stateFormat: "text",
    state: "Summarize this 4-paragraph customer email into two sentences.",
    questions: [
      q("model", {
        type: "choice",
        instructions: "Which model tier should handle this task?",
        criteria: [
          { id: "fast-model", description: "Low-latency, low-cost model for simple tasks" },
          { id: "reasoning-model", description: "Higher-cost model for multi-step reasoning" },
          { id: "specialized-model", description: "Domain-specific model" },
        ],
      }),
      q("risk", {
        type: "score",
        instructions: "How much would a wrong answer cost here?",
        criteria: [{ label: "Low" }, { label: "Medium" }, { label: "High" }],
      }),
    ],
  },
  {
    id: "security-evaluation",
    name: "Security evaluation",
    description: "Assess an HTTP request or security event.",
    category: "Security",
    stateFormat: "json",
    state: JSON.stringify(
      {
        method: "POST",
        path: "/api/user",
        body: { id: "1 OR 1=1" },
      },
      null,
      2
    ),
    questions: [
      q("attack_type", {
        type: "choice",
        instructions: "Which attack category, if any, does this request belong to?",
        criteria: [
          { id: "normal", description: "No sign of attack" },
          { id: "sql_injection", description: "Likely SQL injection attempt" },
          { id: "xss", description: "Likely cross-site scripting attempt" },
          { id: "ssrf", description: "Likely server-side request forgery attempt" },
          { id: "other", description: "Some other attack pattern" },
        ],
      }),
      q("severity", {
        type: "score",
        instructions: "How severe is this event?",
        criteria: [
          { label: "Low" },
          { label: "Medium" },
          { label: "High" },
          { label: "Critical" },
        ],
      }),
      q("likely_malicious", {
        type: "boolean",
        instructions: "Is this request likely malicious?",
      }),
      q("needs_human_review", {
        type: "boolean",
        instructions: "Should this event be escalated for analyst review?",
      }),
    ],
  },
];

export const QUESTION_TEMPLATES: Record<
  string,
  { name: string; question: NamedQuestion["question"] }[]
> = {
  Classification: [
    {
      name: "topic",
      question: {
        type: "choice",
        instructions: "Classify this content by topic.",
        criteria: [
          { id: "technical", description: "Technical content" },
          { id: "business", description: "Business content" },
          { id: "other", description: "Anything else" },
        ],
      },
    },
    {
      name: "intent",
      question: {
        type: "choice",
        instructions: "Classify the primary intent of this message.",
        criteria: [
          { id: "question", description: "Asking a question" },
          { id: "complaint", description: "Filing a complaint" },
          { id: "request", description: "Requesting an action" },
        ],
      },
    },
    {
      name: "department",
      question: {
        type: "choice",
        instructions: "Route this request by department.",
        criteria: [
          { id: "billing", description: "Billing or payment related" },
          { id: "technical", description: "Technical issue" },
          { id: "account", description: "Account or access related" },
        ],
      },
    },
  ],
  Risk: [
    {
      name: "risk",
      question: {
        type: "score",
        instructions: "How risky is this?",
        criteria: [
          { label: "Low" },
          { label: "Moderate" },
          { label: "High" },
          { label: "Critical" },
        ],
      },
    },
    {
      name: "violates_policy",
      question: {
        type: "boolean",
        instructions: "Does this violate the stated policy?",
      },
    },
    {
      name: "needs_human_review",
      question: {
        type: "boolean",
        instructions: "Does this need human review before proceeding?",
      },
    },
  ],
  Routing: [
    {
      name: "team",
      question: {
        type: "choice",
        instructions: "Which team should own this?",
        criteria: [
          { id: "team_a", description: "First team" },
          { id: "team_b", description: "Second team" },
        ],
      },
    },
    {
      name: "review_depth",
      question: {
        type: "choice",
        instructions: "Should this get a fast or deep review?",
        criteria: [
          { id: "fast", description: "Low-risk, quick pass" },
          { id: "deep", description: "High-risk, needs deep review" },
        ],
      },
    },
  ],
  Verification: [
    {
      name: "is_complete",
      question: { type: "boolean", instructions: "Is the objective complete?" },
    },
    {
      name: "evidence_supports_claim",
      question: { type: "boolean", instructions: "Does the evidence support the claim?" },
    },
    {
      name: "sufficient_information",
      question: {
        type: "boolean",
        instructions: "Is the supplied information sufficient to decide?",
      },
    },
  ],
  Security: [
    {
      name: "is_suspicious",
      question: { type: "boolean", instructions: "Is this HTTP request suspicious?" },
    },
    {
      name: "likely_sql_injection",
      question: { type: "boolean", instructions: "Is this request likely SQL injection?" },
    },
    {
      name: "likely_ssrf",
      question: { type: "boolean", instructions: "Is this request likely SSRF?" },
    },
    {
      name: "attack_category",
      question: {
        type: "choice",
        instructions: "Which security category does this event belong to?",
        criteria: [
          { id: "normal", description: "No sign of attack" },
          { id: "injection", description: "Injection attack" },
          { id: "credential_abuse", description: "Credential abuse or takeover attempt" },
          { id: "other", description: "Other" },
        ],
      },
    },
  ],
};
