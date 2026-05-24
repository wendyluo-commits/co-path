# AI Tarot Reading Web App

Next.js + OpenAI tarot-reading web app with single-card and three-card spreads, gesture-based card drawing (MediaPipe), and a verifiable fair-shuffle protocol.

## Features

- **AI-driven readings** via OpenAI Structured Outputs (`response_format: json_schema`).
- **Multiple spreads**: single card, situation–action–outcome, five-card.
- **Gesture drawing** (optional): hand-pinch detection via `@mediapipe/tasks-vision`.
- **Verifiable shuffle**: HMAC_DRBG (SHA-256) + Fisher-Yates with server-side commit/reveal.
- **i18n**: EN / ZH.
- **Server-side rate limiting** (`src/lib/rate-limit.ts`) + prompt-injection sanitization (`src/lib/sanitize.ts`).

## Tech stack

- Next.js 15 (App Router, Turbopack)
- TypeScript
- Tailwind CSS
- OpenAI SDK (`openai` package, default model `gpt-4o-mini`)
- Zod for request/response validation
- Deploys on Vercel

## Quick start

```bash
git clone <repo>
cd co-path-amulet-pages
npm install
cp .env.example .env.local
# edit .env.local — add your OPENAI_API_KEY and SESSION_SECRET
npm run dev
```

Visit http://localhost:3000.

## Environment variables

See `.env.example` for the full list. Required:

| Var | Notes |
|---|---|
| `OPENAI_API_KEY` | OpenAI key |
| `SESSION_SECRET` | 32+ chars. Generate with `openssl rand -hex 32`. Required in production. |

Optional: `MODEL_NAME` (defaults to `gpt-4o-mini`), `NEXT_PUBLIC_APP_NAME`.

## Project layout

```
src/
├── app/
│   ├── api/
│   │   ├── reading/    # AI reading endpoint (rate-limited)
│   │   ├── session/    # Fair-shuffle session creation
│   │   ├── draw/       # Reveal cards from a session
│   │   ├── feedback/   # User feedback collection
│   │   └── health/     # Liveness + OpenAI key check
│   ├── canvas/         # Gesture/click card-drawing screen
│   ├── reading/        # Reading result screen
│   ├── history/        # Past readings (localStorage-backed)
│   ├── calendar/       # Date-indexed history view
│   ├── start/          # Question entry screen
│   ├── home/           # Home / landing
│   ├── privacy/, terms/, settings/, ...
│   └── layout.tsx
├── components/         # UI components (BottomNav, ScrollHint, ...)
├── hooks/              # useHandGesture etc.
├── lib/
│   ├── openai.ts       # OpenAI client + tarot-reading prompts
│   ├── fair-random.ts  # HMAC_DRBG + stateless signed session tokens
│   ├── rate-limit.ts   # Sliding-window IP rate limiter
│   ├── sanitize.ts     # Question input sanitization
│   ├── tarot.ts        # Card lookup, draw, context composition
│   └── ...
├── prompts/            # System prompts (EN/ZH)
└── schemas/            # Zod schemas for requests/responses
```

## Scripts

```bash
npm run dev      # dev server (Turbopack) on :3000
npm run build    # production build
npm start        # production server
npm run lint     # ESLint
```

## Deploy to Vercel

1. Push to GitHub.
2. Import the repo in Vercel.
3. Set env vars: `OPENAI_API_KEY`, `SESSION_SECRET`. Optionally `MODEL_NAME`.
4. Deploy.

The Vercel function timeout is set to 30s in `vercel.json` for `/api/**`.

## Security notes

- Wildcard CORS removed — frontend and API are same-origin.
- HSTS / X-Frame-Options / Referrer-Policy headers in `vercel.json`.
- `/debug`, `/reset-quota`, `/test-*` routes 404 in production (gated in `src/proxy.ts`).
- Per-IP rate limits: `/api/reading` 5/min, 30/h. `/api/session` and `/api/draw` 30/min.
- User question is sanitized before LLM interpolation (control chars, code fences, markdown headers stripped).

## License

Private project.
