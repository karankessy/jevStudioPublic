"use client";

import type { StateFormat } from "@/types/jev";
import { SegmentedControl, Textarea } from "@/components/ui/primitives";
import { byteSize } from "@/lib/utils";

const PLACEHOLDERS: Record<StateFormat, string> = {
  text: "Paste the text, event, request, document, message, or context you want Jev to evaluate...",
  json: '{\n  "user": { "role": "customer", "verified": true },\n  "transaction": { "amount": 680, "currency": "USD" },\n  "policy": "Refunds above USD 500 require approval."\n}',
  array: '[\n  { "id": "ticket-001", "text": "Customer cannot log in." },\n  { "id": "ticket-002", "text": "Customer requests invoice." }\n]',
};

export function StateInput({
  format,
  onFormatChange,
  value,
  onChange,
}: {
  format: StateFormat;
  onFormatChange: (f: StateFormat) => void;
  value: string;
  onChange: (v: string) => void;
}) {
  const isCode = format !== "text";
  let jsonError: string | null = null;
  if (isCode && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (format === "array" && !Array.isArray(parsed)) {
        jsonError = "Array mode expects a JSON array.";
      }
    } catch {
      jsonError = "Invalid JSON.";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">State</h2>
          <p className="text-xs text-muted">What Jev should evaluate</p>
        </div>
        <SegmentedControl
          value={format}
          onChange={onFormatChange}
          options={[
            { value: "text", label: "Text" },
            { value: "json", label: "JSON" },
            { value: "array", label: "Array" },
          ]}
        />
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={PLACEHOLDERS[format]}
        rows={8}
        className={isCode ? "font-mono" : "font-sans"}
        aria-invalid={Boolean(jsonError)}
        aria-label="State input"
      />

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-danger">{jsonError}</span>
        <span className="font-mono text-muted">
          {format === "text" ? `${value.length.toLocaleString()} characters` : `${byteSize(value).toLocaleString()} bytes`}
        </span>
      </div>
    </div>
  );
}
