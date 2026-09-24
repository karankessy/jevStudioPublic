"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Input, Label } from "@/components/ui/primitives";
import { DEFAULT_MODEL } from "@/types/jev";

export function SettingsView({
  connected,
  onConnectedChange,
}: {
  connected: boolean | null;
  onConnectedChange: (connected: boolean) => void;
}) {
  const [masked, setMasked] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"positive" | "danger">("positive");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((json) => setMasked(json.masked))
      .catch(() => {});
  }, []);

  async function save() {
    if (!apiKey.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessageTone("danger");
        setMessage(json.message ?? "Could not save API key.");
        return;
      }
      setMasked(json.masked);
      setApiKey("");
      onConnectedChange(true);
      setMessageTone("positive");
      setMessage(
        json.persisted
          ? "API key saved to .env.local and activated."
          : "API key activated for this session only — the filesystem is read-only here, so it won't survive a restart. Set AI_GATEWAY_API_KEY in your deployment's environment variables instead."
      );
    } catch {
      setMessageTone("danger");
      setMessage("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  }

  async function clear() {
    setSaving(true);
    setMessage(null);
    try {
      await fetch("/api/settings", { method: "DELETE" });
      setMasked(null);
      onConnectedChange(false);
      setMessageTone("positive");
      setMessage("API key removed.");
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/jev");
      const json = await res.json();
      onConnectedChange(Boolean(json.connected));
      setMessageTone(json.connected ? "positive" : "danger");
      setMessage(json.connected ? "Connection successful." : "Server-side API key is not configured.");
    } catch {
      setMessageTone("danger");
      setMessage("Could not reach the server.");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="scrollbar-thin h-full overflow-auto p-6">
      <div className="mx-auto max-w-xl space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">Connection to the Jev provider.</p>
        </div>

        <Card className="divide-y divide-border">
          <div className="flex items-center justify-between p-3">
            <span className="text-xs text-muted-foreground">Provider</span>
            <span className="font-mono text-xs">Vercel AI Gateway</span>
          </div>
          <div className="flex items-center justify-between p-3">
            <span className="text-xs text-muted-foreground">Model</span>
            <span className="font-mono text-xs">{DEFAULT_MODEL}</span>
          </div>
          <div className="flex items-center justify-between p-3">
            <span className="text-xs text-muted-foreground">API Key</span>
            <span className="font-mono text-xs">{masked ?? "Not configured"}</span>
          </div>
          <div className="flex items-center justify-between p-3">
            <span className="text-xs text-muted-foreground">Connection</span>
            <span className={connected ? "text-positive" : "text-danger"}>
              {connected === null ? "Checking..." : connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </Card>

        <Card className="space-y-2 p-3">
          <Label htmlFor="gateway-key">AI Gateway API key</Label>
          <div className="flex items-center gap-2">
            <Input
              id="gateway-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="Paste your Vercel AI Gateway key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button variant="primary" size="sm" onClick={save} disabled={saving || !apiKey.trim()}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Save
            </Button>
            {masked && (
              <Button variant="ghost" size="icon" onClick={clear} disabled={saving} aria-label="Remove API key">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <p className="text-[11px] text-muted">
            Stored server-side only — written to <code className="font-mono">.env.local</code> and never
            sent back to the browser. This form is a local convenience; if you deploy this app
            somewhere reachable by others, protect or remove the settings API before going live.
          </p>
        </Card>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={testConnection} disabled={testing}>
            {testing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Test connection
          </Button>
        </div>
        {message && (
          <p className={messageTone === "positive" ? "text-xs text-positive" : "text-xs text-danger"}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
