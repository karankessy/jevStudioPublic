"use client";

import { useState } from "react";
import type { JevRequestPayload, JevResponse, NamedQuestion } from "@/types/jev";
import { Card, Tabs } from "@/components/ui/primitives";
import { JsonView } from "@/components/json-view";
import {
  ChoiceResultView,
  BooleanResultView,
  ScoreResultView,
} from "@/components/results/answer-views";

function AnswerSummary({ nq, response }: { nq: NamedQuestion; response: JevResponse }) {
  const answer = response.answers[nq.id];
  if (!answer) return null;
  if (answer.type === "choice") {
    return (
      <div>
        <div className="text-xs text-muted-foreground">{nq.name}</div>
        <div className="font-medium">{answer.choice}</div>
        <div className="font-mono text-[11px] text-muted">
          {Math.round(answer.confidence * 100)}% confidence
        </div>
      </div>
    );
  }
  if (answer.type === "score") {
    return (
      <div>
        <div className="text-xs text-muted-foreground">{nq.name}</div>
        <div className="font-medium">
          {answer.label} <span className="font-mono text-muted-foreground">({answer.score.toFixed(2)})</span>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="text-xs text-muted-foreground">{nq.name}</div>
      <div className="font-medium">
        {answer.answer ? "Yes" : "No"}
        <span className="font-mono text-muted-foreground"> — {Math.round(answer.probability * 100)}%</span>
      </div>
    </div>
  );
}

export function ResultsPanel({
  questions,
  response,
  request,
  tab,
  onTabChange,
}: {
  questions: NamedQuestion[];
  response: JevResponse | null;
  request: JevRequestPayload | null;
  tab: string;
  onTabChange: (v: string) => void;
}) {
  const setTab = onTabChange;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col">
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "json", label: "JSON" },
          { value: "request", label: "Request" },
          { value: "response", label: "Response" },
        ]}
      />

      <div className="scrollbar-thin flex-1 overflow-auto p-3">
        {!response && (
          <p className="p-6 text-center text-xs text-muted">Run an evaluation to see results here.</p>
        )}

        {response && tab === "overview" && (
          <div className="space-y-3">
            {questions.length > 1 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {questions.map((nq) => (
                  <Card
                    key={nq.id}
                    className="cursor-pointer p-3 transition-colors hover:border-accent/50"
                    onClick={() => setExpandedId(expandedId === nq.id ? null : nq.id)}
                  >
                    <AnswerSummary nq={nq} response={response} />
                  </Card>
                ))}
              </div>
            ) : null}

            {(expandedId
              ? questions.filter((q) => q.id === expandedId)
              : questions
            ).map((nq) => {
              const answer = response.answers[nq.id];
              if (!answer) return null;
              return (
                <Card key={nq.id} className="p-4">
                  <div className="mb-2 font-mono text-[11px] text-muted">{nq.name}</div>
                  {answer.type === "choice" && <ChoiceResultView answer={answer} />}
                  {answer.type === "score" && <ScoreResultView answer={answer} />}
                  {answer.type === "boolean" && <BooleanResultView answer={answer} name={nq.name} />}
                </Card>
              );
            })}

            <Card className="p-3">
              <div className="mb-2 text-xs font-medium text-muted-foreground">Usage</div>
              <div className="flex gap-6 font-mono text-xs">
                <span>Input <b className="text-foreground">{response.usage.inputTokens}</b></span>
                <span>Output <b className="text-foreground">{response.usage.outputTokens}</b></span>
                <span>Total <b className="text-foreground">{response.usage.totalTokens}</b></span>
              </div>
            </Card>
          </div>
        )}

        {response && tab === "json" && <JsonView data={response} filename="jev-response.json" />}
        {tab === "request" && (
          <JsonView data={request ?? { note: "Run an evaluation to see the request." }} filename="jev-request.json" />
        )}
        {tab === "response" &&
          (response ? (
            <JsonView data={response} filename="jev-response.json" />
          ) : (
            <p className="p-6 text-center text-xs text-muted">No response yet.</p>
          ))}
      </div>
    </div>
  );
}
