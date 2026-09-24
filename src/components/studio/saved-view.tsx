"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { deleteSaved, getSaved, saveEvaluation, type EvaluationRecord } from "@/lib/storage";
import { relativeTime } from "@/lib/utils";

export function SavedView({
  onRestore,
  onImport,
}: {
  onRestore: (r: EvaluationRecord) => void;
  onImport: (r: EvaluationRecord) => void;
}) {
  const [items, setItems] = useState<EvaluationRecord[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage on mount
    setItems(getSaved());
  }, []);

  function remove(id: string) {
    deleteSaved(id);
    setItems(getSaved());
  }

  function exportRecord(item: EvaluationRecord) {
    const { response: _response, ...exportable } = item;
    void _response;
    const blob = new Blob([JSON.stringify(exportable, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.name || "evaluation"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const parsed = JSON.parse(text) as EvaluationRecord;
      const record: EvaluationRecord = { ...parsed, id: `eval_${Date.now()}`, createdAt: Date.now() };
      saveEvaluation(record);
      setItems(getSaved());
      onImport(record);
    } catch {
      // invalid file, ignore
    }
    e.target.value = "";
  }

  return (
    <div className="scrollbar-thin h-full overflow-auto p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Saved Evaluations</h1>
            <p className="text-sm text-muted-foreground">Reusable evaluation configurations.</p>
          </div>
          <div>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" />
              Import
            </Button>
          </div>
        </div>

        {items.length === 0 && (
          <p className="rounded-[var(--radius-md)] border border-dashed border-border p-6 text-center text-xs text-muted">
            No saved evaluations yet. Save one from New Evaluation.
          </p>
        )}

        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 cursor-pointer" onClick={() => onRestore(item)}>
                  <div className="truncate text-sm font-medium">{item.name}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted">
                    {item.questions.length} question{item.questions.length === 1 ? "" : "s"} · {relativeTime(item.createdAt)}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => exportRecord(item)} aria-label="Export">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(item.id)} aria-label="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
