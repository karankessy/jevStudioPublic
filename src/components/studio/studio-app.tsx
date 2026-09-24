"use client";

import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { EvaluationBuilder } from "@/components/studio/evaluation-builder";
import { EmptyState } from "@/components/studio/empty-state";
import { ResultsPanel } from "@/components/results/results-panel";
import { TemplatesView } from "@/components/studio/templates-view";
import { HistoryView } from "@/components/studio/history-view";
import { SavedView } from "@/components/studio/saved-view";
import { JsonPlayground } from "@/components/studio/json-playground";
import { SettingsView } from "@/components/studio/settings-view";
import { DocsView, AboutView } from "@/components/studio/docs-view";
import { useEvaluation } from "@/components/studio/use-evaluation";
import type { View } from "@/components/studio/types";
import { TEMPLATES } from "@/lib/templates";
import { saveEvaluation, type EvaluationRecord } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { cn, makeId } from "@/lib/utils";

export function StudioApp() {
  const [view, setView] = useState<View>("new");
  const [resultsTab, setResultsTab] = useState("overview");
  const [connected, setConnected] = useState<boolean | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const evalHook = useEvaluation();

  useEffect(() => {
    fetch("/api/jev")
      .then((r) => r.json())
      .then((json) => setConnected(Boolean(json.connected)))
      .catch(() => setConnected(false));
  }, []);

  function navigate(v: View) {
    if (v === "request") {
      setView("new");
      setResultsTab("request");
    } else if (v === "response") {
      setView("new");
      setResultsTab("response");
    } else {
      setView(v);
    }
    setMobileNavOpen(false);
  }

  function loadTemplate(id: string) {
    const template = TEMPLATES.find((t) => t.id === id);
    if (!template) return;
    evalHook.setState((s) => ({
      ...s,
      stateFormat: template.stateFormat,
      stateValue: template.state,
      questions: template.questions,
    }));
    evalHook.setResponse(null);
    evalHook.setError(null);
    setView("new");
  }

  function restoreRecord(record: EvaluationRecord) {
    evalHook.setState((s) => ({
      ...s,
      stateFormat: record.stateFormat,
      stateValue: record.state,
      questions: record.questions,
    }));
    evalHook.setResponse(record.response ?? null);
    evalHook.setError(null);
    setView("new");
    setResultsTab("overview");
  }

  function saveCurrent() {
    const record: EvaluationRecord = {
      id: makeId("saved"),
      name: evalHook.state.questions.map((q) => q.name).join(", ") || "Untitled evaluation",
      createdAt: Date.now(),
      model: evalHook.state.model,
      stateFormat: evalHook.state.stateFormat,
      state: evalHook.state.stateValue,
      questions: evalHook.state.questions,
      response: evalHook.response ?? undefined,
    };
    saveEvaluation(record);
  }

  const hasContent = evalHook.state.stateValue.trim().length > 0 || evalHook.state.questions.length > 0;

  return (
    <div className="flex h-dvh flex-col">
      <Header
        connected={connected}
        onMenuClick={() => setMobileNavOpen((v) => !v)}
        onNavigateHome={() => navigate("new")}
      />
      <div className="relative flex min-h-0 flex-1">
        <Sidebar
          view={view}
          onNavigate={navigate}
          connected={connected}
          model={evalHook.state.model}
          className={cn(
            "w-56 shrink-0",
            "fixed inset-y-0 top-12 z-40 lg:static lg:top-0",
            mobileNavOpen ? "flex" : "hidden lg:flex"
          )}
        />
        {mobileNavOpen && (
          <button
            className="fixed inset-0 top-12 z-30 bg-black/30 lg:hidden"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        <main className="min-w-0 flex-1 overflow-hidden">
          {view === "new" && (
            <div className="grid h-full grid-cols-1 lg:grid-cols-2">
              <div className="flex min-h-0 flex-col border-r border-border">
                {hasContent ? (
                  <>
                    <div className="flex items-center justify-end gap-1.5 border-b border-border px-3 py-1.5">
                      <Button variant="ghost" size="sm" onClick={saveCurrent}>
                        <Save className="h-3.5 w-3.5" />
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          evalHook.setState((s) => ({ ...s, stateValue: "", questions: [] }));
                          evalHook.setResponse(null);
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                        Clear
                      </Button>
                    </div>
                    <div className="min-h-0 flex-1">
                      <EvaluationBuilder
                        state={evalHook.state}
                        setState={evalHook.setState}
                        errors={evalHook.errors}
                        requestSize={evalHook.requestSize}
                        stage={evalHook.stage}
                        error={evalHook.error}
                        onRun={evalHook.run}
                        payload={evalHook.payload}
                      />
                    </div>
                  </>
                ) : (
                  <EmptyState
                    onStart={loadTemplate}
                    onOpenPlayground={() => setView("playground")}
                    onOpenTemplates={() => setView("templates")}
                  />
                )}
              </div>
              <div className="min-h-0">
                <ResultsPanel
                  questions={evalHook.state.questions}
                  response={evalHook.response}
                  request={evalHook.lastRequest}
                  tab={resultsTab}
                  onTabChange={setResultsTab}
                />
              </div>
            </div>
          )}

          {view === "history" && <HistoryView onRestore={restoreRecord} />}
          {view === "saved" && <SavedView onRestore={restoreRecord} onImport={restoreRecord} />}
          {view === "templates" && (
            <TemplatesView
              onUseTemplate={loadTemplate}
              onAddQuestion={(nq) => {
                evalHook.setState((s) => ({ ...s, questions: [...s.questions, nq] }));
                setView("new");
              }}
            />
          )}
          {view === "playground" && <JsonPlayground />}
          {view === "settings" && (
            <SettingsView connected={connected} onConnectedChange={setConnected} />
          )}
          {view === "docs" && <DocsView />}
          {view === "about" && <AboutView />}
        </main>
      </div>
    </div>
  );
}
