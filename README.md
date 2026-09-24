# Jev Studio

<img width="1646" height="985" alt="image" src="https://github.com/user-attachments/assets/17b3541e-8681-4900-b31d-971fff85b511" />

A visual interface for building, running, and inspecting [Jev](https://ai-sdk.dev) evaluations — structured decisions, classification, and scoring on top of the Vercel AI SDK's `experimental_evaluate`.

Build evaluation questions (boolean, choice, score) through a UI, run them against a model, and inspect the structured results — no hand-written prompt/schema wiring required.

## Features

- **Visual question builder** — compose boolean, multiple-choice, and score-based evaluation criteria without writing raw Jev schemas.
- **Live evaluation runner** — send state + questions to the API route and view structured answers (with probabilities/confidence where applicable).
- **JSON playground** — edit and run raw evaluation payloads directly.
- **Templates** — starter evaluations (e.g. risk level, task completion) to build from.
- **History** — past evaluation runs saved locally for review.
- **Settings** — manage your model provider API key from the UI; stored server-side only, never exposed to the browser.

## Tech Stack

- [Next.js](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Vercel AI SDK](https://ai-sdk.dev) (`ai`, `experimental_evaluate`)
- [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) as the model provider
- Tailwind CSS 4
- Zod for request validation

## Getting Started

### Prerequisites

- Node.js 18.18+ (or a recent LTS)
- A [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) API key

### Install

```bash
npm install
```

### Configure

Copy the example env file and add your AI Gateway key:

```bash
cp .env.local.example .env.local
```

```
AI_GATEWAY_API_KEY=your-key-here
```

Alternatively, skip this step and set the key from the app's **Settings** view after starting it — it's persisted to `.env.local` for you (server-side only, `0600` permissions, never sent to the client).

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build & start (production)

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## Model Provider Support

Only the **Vercel AI Gateway** is supported as a model provider right now.

Planned: native Cloudflare Workers AI support, plus a typesafe API layer that isn't tied to a single gateway — so evaluations can run against other providers without going through Vercel AI Gateway.

## Project Structure

```
src/
  app/
    api/jev/         # Evaluation run endpoint
    api/settings/    # API key management endpoint
    page.tsx         # App shell
  components/
    builder/         # Question builder UI (boolean/choice/score editors)
    studio/          # Studio views (playground, history, templates, settings, docs)
    results/         # Answer rendering
    ui/               # Shared primitives
  lib/
    jev.ts           # Jev evaluation logic (AI SDK integration)
    env-store.ts     # Server-side API key persistence
    templates.ts      # Built-in evaluation templates
    validation.ts     # Zod request schemas
  types/jev.ts        # Shared evaluation types
```
