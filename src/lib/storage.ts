"use client";

import type { JevResponse, NamedQuestion, StateFormat } from "@/types/jev";

export interface EvaluationRecord {
  id: string;
  name: string;
  createdAt: number;
  model: string;
  stateFormat: StateFormat;
  state: string;
  questions: NamedQuestion[];
  response?: JevResponse;
}

const HISTORY_KEY = "jev-studio:history";
const SAVED_KEY = "jev-studio:saved";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getHistory(): EvaluationRecord[] {
  return read<EvaluationRecord>(HISTORY_KEY).sort((a, b) => b.createdAt - a.createdAt);
}

export function addHistory(record: EvaluationRecord) {
  const current = read<EvaluationRecord>(HISTORY_KEY);
  write(HISTORY_KEY, [record, ...current].slice(0, 100));
}

export function clearHistory() {
  write(HISTORY_KEY, []);
}

export function getSaved(): EvaluationRecord[] {
  return read<EvaluationRecord>(SAVED_KEY).sort((a, b) => b.createdAt - a.createdAt);
}

export function saveEvaluation(record: EvaluationRecord) {
  const current = read<EvaluationRecord>(SAVED_KEY).filter((r) => r.id !== record.id);
  write(SAVED_KEY, [record, ...current]);
}

export function deleteSaved(id: string) {
  write(
    SAVED_KEY,
    read<EvaluationRecord>(SAVED_KEY).filter((r) => r.id !== id)
  );
}
