"use client";

import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function JsonView({
  data,
  filename,
  className,
}: {
  data: unknown;
  filename?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function download() {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename ?? "data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={cn("relative rounded-[var(--radius-md)] border border-border bg-surface", className)}>
      <div className="flex items-center justify-end gap-1 border-b border-border px-2 py-1">
        <Button variant="ghost" size="sm" onClick={copy} aria-label="Copy JSON">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        {filename && (
          <Button variant="ghost" size="sm" onClick={download} aria-label="Download JSON">
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        )}
      </div>
      <pre className="scrollbar-thin max-h-[480px] overflow-auto p-3 font-mono text-xs leading-relaxed text-foreground">
        {text}
      </pre>
    </div>
  );
}
