import "server-only";
import fs from "node:fs";
import path from "node:path";

const ENV_FILE = path.join(process.cwd(), ".env.local");
const KEY = "AI_GATEWAY_API_KEY";

function readEnvFile(): string {
  try {
    return fs.readFileSync(ENV_FILE, "utf8");
  } catch {
    return "";
  }
}

function writeEnvFile(contents: string) {
  fs.writeFileSync(ENV_FILE, contents, { mode: 0o600 });
}

export function getMaskedKey(): string | null {
  const key = process.env[KEY];
  if (!key) return null;
  return key.length <= 4 ? "••••" : `••••••••${key.slice(-4)}`;
}

export function isConnected(): boolean {
  return Boolean(process.env[KEY]);
}

export function setApiKey(rawKey: string): { persisted: boolean } {
  const value = rawKey.trim();
  if (!value) throw new Error("API key cannot be empty.");

  process.env[KEY] = value;

  try {
    const current = readEnvFile();
    const lines = current.split("\n").filter((line) => line.trim().length > 0);
    const filtered = lines.filter((line) => !line.startsWith(`${KEY}=`));
    filtered.push(`${KEY}=${value}`);
    writeEnvFile(filtered.join("\n") + "\n");
    return { persisted: true };
  } catch {
    // Read-only filesystem (e.g. serverless deploy) — key stays active for this
    // running process only, and will be lost on the next cold start/restart.
    return { persisted: false };
  }
}

export function clearApiKey() {
  delete process.env[KEY];
  try {
    const current = readEnvFile();
    const lines = current.split("\n").filter((line) => line.trim().length > 0);
    const filtered = lines.filter((line) => !line.startsWith(`${KEY}=`));
    writeEnvFile(filtered.length ? filtered.join("\n") + "\n" : "");
  } catch {
    // nothing to persist
  }
}
