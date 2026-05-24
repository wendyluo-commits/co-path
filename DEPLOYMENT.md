# Deployment Guide

## Vercel

### Prerequisites

- OpenAI API key (https://platform.openai.com/api-keys)
- 32+ char `SESSION_SECRET` — generate with: `openssl rand -hex 32`
- Code pushed to GitHub / GitLab / Bitbucket
- Vercel account

### Steps

1. **Import project** in Vercel: New Project → pick the repo.

2. **Settings** (Vercel auto-detects most of these for Next.js):
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Environment Variables** (Project Settings → Environment Variables):

   | Name | Required | Notes |
   |---|---|---|
   | `OPENAI_API_KEY` | yes | Your OpenAI key |
   | `SESSION_SECRET` | yes | `openssl rand -hex 32` — used to HMAC-sign fair-shuffle session tokens. The server throws on startup if this is missing in production. |
   | `RESEND_API_KEY` | no | If set with `FEEDBACK_EMAIL_TO`, each user feedback submission is emailed to you. Sign up at https://resend.com (free tier: 100 emails/day). |
   | `FEEDBACK_EMAIL_TO` | no | Your email — destination for feedback emails. Required alongside `RESEND_API_KEY`. |
   | `FEEDBACK_EMAIL_FROM` | no | Defaults to `feedback@resend.dev` which works without verifying a custom domain. |
   | `MODEL_NAME` | no | Defaults to `gpt-4o-mini`. |
   | `NEXT_PUBLIC_APP_NAME` | no | Display name in the UI. |

   Set these for the **Production** environment. Optionally repeat for Preview / Development environments with separate keys.

4. **Deploy.** Build typically completes in 1–2 minutes.

### Verify

- Home page: `https://<your-domain>.vercel.app/` loads.
- Health: `https://<your-domain>.vercel.app/api/health` → `{ ok: true, services: { openai: { status: "healthy" } } }` (will be `ok: false` if the OPENAI_API_KEY is missing or invalid).
- Try a reading end-to-end.

### Custom domain

Vercel project → Domains → Add. Follow the DNS instructions.

## Function configuration

`vercel.json` sets `/api/**` function `maxDuration` to 30s. OpenAI calls retry once internally (`src/lib/openai.ts`), so allow that headroom.

## Rate limiting in production

The in-memory rate limiter (`src/lib/rate-limit.ts`) is per-serverless-instance, so a determined attacker can hit you N × instances. It defends against the common case (one IP spamming from a script). For strict global limits, swap the `buckets` Map for Upstash / Vercel KV — the `getClientIp` + `rateLimit` interface stays the same.

## Cost protection

- `/api/reading`: 5/min, 30/hour per IP.
- `/api/draw` and `/api/session`: 30/min per IP.

Adjust in `src/lib/rate-limit.ts` call sites if you need different ceilings.

## Security headers

Set in `vercel.json` for all routes:

- `Strict-Transport-Security` (HSTS, 2-year max-age)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(self), microphone=(), geolocation=()` — camera is `self` because the gesture-drawing canvas uses MediaPipe.

## Dev-only routes

`/debug`, `/reset-quota`, `/test-api`, `/test-images`, `/test-pt` 404 in production via `src/proxy.ts`. They remain accessible in `next dev`.

## Troubleshooting

- **Health returns 503** — `OPENAI_API_KEY` env var is unset or invalid.
- **Server throws on startup with "SESSION_SECRET env var is required"** — set `SESSION_SECRET` in Vercel project env vars.
- **Cards never draw / "Session not found"** — token expired (1 hour TTL) or `SESSION_SECRET` changed between session creation and draw.
