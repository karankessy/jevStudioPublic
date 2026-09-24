"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { clearHistory, getHistory, type EvaluationRecord } from "@/lib/storage";
import { relativeTime } from "@/lib/utils";

export function HistoryView({ onRestore }: { onRestore: (r: EvaluationRecord) => void }) {
  const [items, setItems] = useState<EvaluationRecord[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage on mount
    setItems(getHistory());
  }, []);

  return (
    <div className="scrollbar-thin h-full overflow-auto p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">History</h1>
            <p className="text-sm text-muted-foreground">
              Every evaluation run in this browser, stored locally.
            </p>
          </div>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearHistory();
                setItems([]);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear history
            </Button>
          )}
        </div>

        {items.length === 0 && (
          <p className="rounded-[var(--radius-md)] border border-dashed border-border p-6 text-center text-xs text-muted">
            No evaluations yet. Run one from New Evaluation.
          </p>
        )}

        <div className="space-y-2">
          {items.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer p-3 transition-colors hover:border-accent/50"
              onClick={() => onRestore(item)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{item.name}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted">
                    {item.questions.length} question{item.questions.length === 1 ? "" : "s"}
                    {item.response ? ` · ${item.response.usage.inputTokens} input tokens` : ""}
                  </div>
                </div>
                <span className="shrink-0 text-[11px] text-muted">{relativeTime(item.createdAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
