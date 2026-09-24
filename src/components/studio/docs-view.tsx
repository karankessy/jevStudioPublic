"use client";

function SourceLink({
  href,
  title,
  note,
}: {
  href: string;
  title: string;
  note: string;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-foreground underline decoration-muted underline-offset-2 hover:decoration-accent"
      >
        {title}
      </a>
      <span className="block text-xs text-muted-foreground">{note}</span>
    </li>
  );
}

export function DocsView() {
  return (
    <div className="scrollbar-thin h-full overflow-auto p-6">
      <div className="mx-auto max-w-2xl space-y-6 text-sm leading-relaxed">
        <div>
          <h1 className="text-lg font-semibold">Documentation</h1>
          <p className="text-muted-foreground">
            Jev Studio is an interface over one primitive: state in, typed questions, structured
            decisions out.
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Choice</h2>
          <p className="text-muted-foreground">
            Select one option from a defined set. You supply option ids and descriptions; Jev
            returns a probability distribution across them plus the top choice and its confidence.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Score</h2>
          <p className="text-muted-foreground">
            Evaluate something against an ordered scale. Jev returns a probability distribution
            across the levels and a probability-weighted score, which can fall between defined
            positions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Boolean (Yes / No)</h2>
          <p className="text-muted-foreground">
            Estimate the probability that the answer to a question is true. Jev returns a
            probability, not a binary flag — treat it as a signal, not an authorization decision.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Multiple questions</h2>
          <p className="text-muted-foreground">
            A single state can have multiple questions attached, all evaluated together in one
            request.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Request limits</h2>
          <p className="text-muted-foreground">
            Requests are limited to 32 KB. Reduce the state or split it into multiple evaluations
            if you hit the limit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Sources</h2>
          <p className="text-muted-foreground">
            Jev Studio is an interface, not a model. The decision-making happens in Jev itself and
            in the class of &ldquo;System One&rdquo; / non-autoregressive decision models it belongs to.
            Primary sources:
          </p>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Jev (TypeSafe AI)
            </h3>
            <ul className="space-y-2 border-l border-border pl-3">
              <SourceLink
                href="https://typesafe.ai/blog/introducing-system-one-models-and-jev"
                title="Introducing System One Models & Jev"
                note="TypeSafe AI — original announcement: Reinforcement Learning for Calibrated Decisions (RLCD), single-pass typed decisions instead of autoregressive generation."
              />
              <SourceLink
                href="https://vercel.com/docs/ai-gateway/modalities/evaluation"
                title="Evaluation — Vercel AI Gateway docs"
                note="Request/response contract this app implements: choice, score, boolean question types, HTTP API, AI SDK experimental_evaluate."
              />
              <SourceLink
                href="https://vercel.com/kb/guide/typesafe-jev-and-ai-sdk"
                title="How to classify, route, and score with Jev and AI SDK"
                note="Vercel Knowledge Base — worked examples for routing, scoring, and branching on confidence."
              />
              <SourceLink
                href="https://vercel.com/ai-gateway/models/jev"
                title="Jev — API, pricing & playground"
                note="Vercel AI Gateway model page for typesafe-ai/jev."
              />
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Laya (open-source, Jev-like)
            </h3>
            <ul className="space-y-2 border-l border-border pl-3">
              <SourceLink
                href="https://github.com/NandhaKishorM/laya"
                title="Laya — GitHub repository"
                note="Non-autoregressive System 1 decision engine: typed choice/score/yes-no decisions in a single forward pass, ModernBERT-large backbone, 100+ languages."
              />
              <SourceLink
                href="https://mer.vin/news/laya-the-33ms-open-source-decision-model-beating-jev/"
                title="Laya: The 33ms Open-Source Decision Model Beating Jev"
                note="Independent write-up comparing Laya's latency/throughput against Jev on the same typed-decision task shape."
              />
            </ul>
          </div>

          <p className="text-[11px] text-muted">
            Jev Studio does not depend on Laya or any specific model internals — it only assumes
            the choice / score / boolean question contract described above, so it should work
            against any evaluation-model provider that speaks the same shape.
          </p>
        </section>
      </div>
    </div>
  );
}

export function AboutView() {
  return (
    <div className="scrollbar-thin h-full overflow-auto p-6">
      <div className="mx-auto max-w-2xl space-y-4 text-sm leading-relaxed">
        <h1 className="text-lg font-semibold">About Jev</h1>
        <p className="text-muted-foreground">
          Jev is a structured decision model. Rather than generating open-ended text, it evaluates
          a piece of state against typed questions — choice, score, and yes/no — and returns
          calibrated probabilities and confidence for each.
        </p>
        <p className="text-muted-foreground">
          Compose these three primitives into classification, routing, risk assessment,
          verification, policy checks, prioritization, moderation, workflow decisions, model
          selection, or security triage. Jev is not a chatbot and does not generate free-form
          responses.
        </p>
        <p className="text-muted-foreground">
          Jev Studio calls Jev through the Vercel AI Gateway. The API key lives server-side only —
          the browser only ever talks to <code className="font-mono">/api/jev</code>.
        </p>
      </div>
    </div>
  );
}
