"use client";

import { useState } from "react";
import { Check, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/primitives";
import { JsonView } from "@/components/json-view";
import { DEFAULT_MODEL } from "@/types/jev";

const SAMPLE = JSON.stringify(
  {
    model: DEFAULT_MODEL,
    state: {
      method: "POST",
      path: "/api/user",
      body: { id: "1 OR 1=1" },
    },
    questions: {
      attack_type: {
        type: "choice",
        instructions: "Which attack category, if any, does this request belong to?",
        criteria: [
          { id: "normal", description: "No sign of attack" },
          { id: "sql_injection", description: "Likely SQL injection attempt" },
          { id: "other", description: "Some other attack pattern" },
        ],
      },
      likely_attack: {
        type: "boolean",
        instructions: "Is this request likely an attack?",
      },
    },
  },
  null,
  2
);

export function JsonPlayground() {
  const [text, setText] = useState(SAMPLE);
  const [valid, setValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<unknown>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function format() {
    try {
      setText(JSON.stringify(JSON.parse(text), null, 2));
      setValid(true);
    } catch {
      setValid(false);
    }
  }

  function validate() {
    try {
      JSON.parse(text);
      setValid(true);
    } catch {
      setValid(false);
    }
  }

  async function run() {
    setErrorMessage(null);
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      setValid(false);
      return;
    }
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch("/api/jev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.message ?? "The evaluation could not be completed.");
      } else {
        setResponse(json);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div>
          <h1 className="text-sm font-semibold">JSON Playground</h1>
          <p className="text-xs text-muted">Edit and send the raw Jev request payload directly.</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={format}>
            Format
          </Button>
          <Button variant="outline" size="sm" onClick={validate}>
            {valid === true ? <Check className="h-3.5 w-3.5 text-positive" /> : null}
            Validate
          </Button>
          <Button variant="primary" size="sm" onClick={run} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Run
          </Button>
        </div>
      </div>
      {valid === false && (
        <div className="border-b border-danger/30 bg-danger/5 px-4 py-1.5 text-[11px] text-danger">
          Invalid JSON.
        </div>
      )}
      <div className="grid flex-1 grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-2">
        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setValid(null);
          }}
          className="h-full resize-none"
          aria-label="Request JSON"
        />
        <div className="scrollbar-thin h-full overflow-auto">
          {errorMessage && (
            <div className="mb-2 rounded-[var(--radius-sm)] border border-danger/30 bg-danger/5 p-2 text-[11px] text-danger">
              {errorMessage}
            </div>
          )}
          {response ? (
            <JsonView data={response} filename="jev-response.json" />
          ) : (
            <p className="p-6 text-center text-xs text-muted">Response will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
