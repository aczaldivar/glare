# Glare Room

A public real-time chatroom you can open in a browser, join without an account, and feature at a live URL.

**App:** Glare Room (Glareroom)  
**Target URL:** [glareroom.vercel.app](https://glareroom.vercel.app)  
**Repo:** [github.com/aczaldivar/glare](https://github.com/aczaldivar/glare)

Walk in → name or join a room → talk live → share the room link.

## What ships in v1

- Create or join **public rooms** by name (`/r/lobby`, `/r/afterhours`, …)
- Optional **display name** (a guest name is generated if you skip it)
- **Real-time messages** and **presence** (who is in the room)
- Shareable room URLs and Open Graph previews
- Mobile-friendly, product-ready UI
- Safety basics: 13+ notice (not age verification), Community Guidelines / Terms acknowledgment before entering a room, 500-character messages, burst rate limits, Cloudflare Turnstile when configured, a honeypot on entry forms, plain-text only, in-app report stub, mute/block in this browser
- In-app **Terms of Service**, **Privacy**, and **Community Guidelines** (plain-language product drafts)
- Footer links to those pages; no analytics or advertising cookies in v1
- **Podcast rooms (demo):** curated episode + transcript + live chat at `/r/lobby-ep1`. Not a public podcast host yet.

Featured room to share: `/r/lobby`. Demo podcast room: `/r/lobby-ep1`.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- Deploys as a standard Vercel project (no custom long-lived server)
- **Production realtime:** [Ably](https://ably.com) (token auth from a Next.js route; clients subscribe only)
- **Local realtime:** in-process event bus + Server-Sent Events, so `npm run dev` works with no keys
- **Bot friction:** [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) when configured; honeypot + same-origin write checks always

Messages are ephemeral. Locally they live in memory. In production Ably can rewind recent messages for people who just joined; they are not stored in a database.

## Run locally

Requires Node 20+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No Ably key is required on your laptop. The in-process bus is enough for one `next dev` / `next start` process.

```bash
npm run lint
npm test
npm run build
```

## Environment variables

See `.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `ABLY_API_KEY` | Production (Vercel) | Ably app API key with publish, subscribe, and presence |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical URL for metadata and share previews. Local: `http://localhost:3000`. Live: `https://glareroom.vercel.app` |
| `OPERATOR_CONTACT_EMAIL` | Optional | Operator inbox. Defaults to `contact@glare.com` (also hardcoded in legal copy and the footer). Override only if the inbox changes. |
| `NEXT_PUBLIC_OPERATOR_CONTACT_EMAIL` | Optional | Same as above if you want to set the public value explicitly. If omitted, `OPERATOR_CONTACT_EMAIL` (or the `contact@glare.com` default) is copied into the client bundle at build time. |
| `UPSTASH_REDIS_REST_URL` | Recommended on Vercel | Shared rate-limit store. Without it, limits are in-memory per serverless isolate. |
| `UPSTASH_REDIS_REST_TOKEN` | With the URL above | Upstash REST token for the shared limiter. |
| `TURNSTILE_SECRET_KEY` | Recommended on Vercel | Cloudflare Turnstile secret. Required (with the site key) before real traffic. Missing on Vercel fails closed. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | With the secret above | Cloudflare Turnstile site key for the entry widget. |

### Operator contact

Legal pages, the site footer, and support copy use **contact@glare.com**.

`OPERATOR_CONTACT_EMAIL` defaults to that address. Set it in Vercel only if you need to override it, then redeploy.

The app chooses a realtime provider automatically:

1. `ABLY_API_KEY` set → Ably
2. Running on Vercel without that key → rooms show a configuration message (serverless instances cannot share the local bus)
3. Otherwise → local SSE bus

Turnstile follows the same least-footgun pattern:

1. Both Turnstile keys set → entry widget + signed httpOnly session required to mint an Ably token and `POST` messages
2. Running on Vercel without both keys → rooms show a configuration message; token minting and chat writes return 501 (not silently open)
3. Otherwise (local/dev) → skip the widget, same as running without Ably

Set **Upstash + Turnstile** before inviting real traffic. Anonymous public chat cannot make bots impossible; these controls raise the cost.

## Set up Ably (production)

1. Create a free account at [ably.com](https://ably.com)
2. Create an app, for example `glareroom`
3. Open **API Keys** and copy a key that can publish, subscribe, and be present
4. Put it in `.env.local` for a local Ably test, and in Vercel env vars for production

You do **not** put the root key in the browser. The app mints short-lived tokens (~10 minutes) from `/api/realtime/token`, scoped to **one** room channel (`glare:room:{room}`) with subscribe + presence only. Clients cannot publish. Only the server publishes chat messages (after validation and rate limiting). Token minting is rate-limited per IP. When Turnstile is configured, that GET still works for the Ably Realtime client (`authUrl`); it requires the httpOnly session cookie from `/api/realtime/verify`, not a Turnstile token on the query string.

## Set up Cloudflare Turnstile (recommended before real traffic)

1. Create a free account at [Cloudflare](https://dash.cloudflare.com) if you do not have one
2. Open **Turnstile** and add a widget for your site (hostname `localhost` for local tests, plus your Vercel host)
3. Copy the **site key** and **secret key**
4. Put them in `.env.local` as `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`, and in Vercel env vars for production/preview
5. Redeploy so the public site key is in the client bundle

When those keys are set:

- Join and room-entry forms show the widget and a honeypot field
- `POST /api/realtime/verify` checks the Turnstile token (and rejects a filled honeypot), then sets a short-lived httpOnly `glare_human` cookie
- `GET /api/realtime/token` and `POST /api/realtime/messages` require that cookie

When the keys are **not** set locally, `npm run dev` still works. On Vercel, missing keys fail closed instead of leaving chat open.

## Rate limits

Message send: 8 / 10 seconds per IP and room, plus a short minimum interval. Ably token minting: 12 / 60 seconds per IP. Human-check (`/api/realtime/verify`): 10 / 10 minutes per IP.

**Vercel caveat:** the default limiter is an in-memory map on the Node process. Serverless isolates do not share that map, so a client can get a fresh budget on a cold instance. That is enough for local `next dev` / `next start`, not a strong production control.

For a shared limit, set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (Upstash Redis REST). When those are set, token, message, report, and verify limits go through Redis and fail closed if Redis errors.

## Security notes

- `ABLY_API_KEY` is server-only. Browser clients receive a token for **one** room (`glare:room:{room}`), 10-minute TTL, subscribe + presence, no publish.
- Chat writes go through `POST /api/realtime/messages` (length cap, rate limit). The Ably token cannot publish.
- Entry forms include a honeypot field. Same-origin `Origin`/`Referer` (and `Sec-Fetch-Site` when present) is required on browser POSTs. That check is **not** applied to Ably token GETs.
- When Turnstile keys are set, token minting and message POSTs also require the signed httpOnly human session cookie.
- Responses include `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` disabling camera/mic/geo, and a Content-Security-Policy that allows this origin, Ably, and Cloudflare Turnstile (`challenges.cloudflare.com`). `frame-ancestors` stays `'none'`.
- Determined bots can still show up in anonymous public chat. These controls raise the cost; they do not make automation impossible.

## Deploy to Vercel and claim glareroom.vercel.app

1. Push this repo to GitHub (`aczaldivar/glare`).
2. In [Vercel](https://vercel.com), **Add New → Project** and import the GitHub repo.
3. **Project name:** set it to `glareroom` if you want the default `*.vercel.app` host to be `glareroom.vercel.app`. If the project is imported as `glare`, the default host is `glare.vercel.app` — you can still attach `glareroom.vercel.app` in Domains (step 6).
4. Framework preset should be **Next.js**. Root directory stays `/`.
5. Add environment variables (Production, Preview, and Development):
   - `ABLY_API_KEY` = your Ably key
   - `NEXT_PUBLIC_SITE_URL` = `https://glareroom.vercel.app` (or the URL you actually get)
   - `OPERATOR_CONTACT_EMAIL` = `contact@glare.com` (app default; override only if the inbox changes)
   - `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` = recommended so rate limits are shared across serverless instances
   - `TURNSTILE_SECRET_KEY` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = recommended before real traffic; without both, this Vercel deploy fails closed for tokens and chat writes
6. **Claim the public URL**
   - Open the project → **Settings → Domains**
   - If the project is named `glareroom`, `glareroom.vercel.app` is assigned automatically
   - If it is not, click **Add Domain** and enter `glareroom.vercel.app`
   - If that name is already taken on Vercel, add the closest available name (`glare-room.vercel.app`, `glareroom-app.vercel.app`, or a custom domain) and set `NEXT_PUBLIC_SITE_URL` to match
7. Deploy. Vercel builds on every push to the production branch.
8. **Review legal copy** before you feature the URL publicly. `/guidelines`, `/terms`, and `/privacy` are product drafts, not lawyer-reviewed documents. Replace or edit them, and bump `LEGAL_ACK_VERSION` in `src/lib/legal.ts` if the agreement materially changes (that re-prompts people before they enter a room). Operator contact is **contact@glare.com**.
9. Smoke-test: open the site → confirm the 13+ notice → agree to Guidelines/Terms → **Open lobby** (or create a room) → send a message in two browser windows → **Share link** → **Mute** / **Block** / **Report** on a message.

Redeploy after changing env vars so `NEXT_PUBLIC_SITE_URL` and the operator email are baked into the client bundle.

### Custom domain later

In **Settings → Domains**, add something like `glareroom.com`, follow DNS instructions, then update `NEXT_PUBLIC_SITE_URL`.

## Product notes

- Rooms are public. Anyone with the link can read and write.
- Display names are not unique logins.
- **Age:** the product is 13+. The UI shows a notice only. There is no hard age gate, birthdate check, or ID verification.
- **Mute / block:** available in the room. Mute hides that person on this browser; Block is the same local list from the people panel. It does not ban them for anyone else.
- **Report:** in-app stub. Reports are stored in server memory (and logged) so an operator can see them; they are not a full moderation console.
- Rate limit: 8 messages / 10 seconds per IP and room, plus a short minimum interval. Token minting is also limited per IP. In-memory limits are weak on Vercel unless Upstash is configured (see Rate limits).
- Turnstile + Upstash are the recommended production pair before featuring the URL. Without Turnstile keys, a Vercel deploy will not mint chat tokens.
- Do not treat this as a private messenger.
- **No analytics or advertising cookies in v1.** Guest state uses `localStorage` (identity, legal acknowledgment, mute/block). When Turnstile is on, a short-lived httpOnly session cookie is set after the human check.

## Message retention (~30 days)

The product target is to keep chat for about **30 days**, then drop it. That number lives in `MESSAGE_RETENTION_DAYS` (`src/lib/constants.ts`).

v1 does **not** have a durable message database:

- Local/dev: in-memory bus history is pruned to the 30-day window (and a short count cap).
- Production Ably: rewind is recent messages, usually much shorter than 30 days.
- The room UI ignores any message older than 30 days if one appears.
- In-memory reports are pruned with the same window.

A scheduled deletion job against durable storage is **out of scope for v1**. When a database exists, reuse `MESSAGE_RETENTION_DAYS` / `MESSAGE_RETENTION_MS` for that job instead of inventing a second policy.

## Podcast rooms (demo, not publicly launchable)

Counsel constraints for v1:

- **Official embeds** or **rights-clear / curated transcripts and audio** only
- **No user audio or transcript uploads**
- **ToS and Privacy must be patched before a public podcast-rooms launch**
- **Prefer a demo/curated episode shipped in-repo** (this is what `/r/lobby-ep1` is)

A room slug can be tied to a catalog episode: HTML5 audio from `/audio/`, a full English transcript, and the same live chat. Chat is the discussion; the transcript is first-class (readable and searchable). Share `/r/{slug}`.

**Do not treat podcast rooms as a public product until Terms and Privacy are patched for that format.** There is no upload UI and no open submission path.

Demo: `/r/lobby-ep1` — original English copy plus synthetic tones at `public/audio/demo-episode.mp3` (royalty-free, generated). Transcript lives in `src/lib/podcast/demo-episode.ts` and is sanitized to plain text before render (no raw HTML).

### Add an episode (operators only)

Do not add an upload form. Catalog entries only:

1. Prefer a rights-clear file in `public/audio/` (`media: { kind: "file", src: "/audio/…" }`).
2. Official embeds are allowed as `media: { kind: "official-embed", provider, src }` (https only). v1 playback is wired for in-repo files; embeds need a player + CSP `frame-src` before you ship one.
3. Add the `PodcastEpisode` to `src/lib/podcast/catalog.ts` with an English `transcript: TranscriptCue[]`.
4. Optional `contentWarning` shows a banner.

Existing legal gates still apply (13+ notice, Guidelines/Terms ack, mute/block, report).

## Legal copy (drafts, not counsel)

The Terms of Service, Privacy Policy, and Community Guidelines in this repo are **plain-language product drafts** written so Anna can ship a public URL with a visible safety layer. They are **not formal legal advice** and have not been reviewed by an attorney.

Before a public launch, review and revise `/terms`, `/privacy`, and `/guidelines`, and confirm they match how you actually host and log data. Operator contact is **contact@glare.com**. Changing the acknowledgment version in `src/lib/legal.ts` will ask returning visitors to agree again.

## Project layout

```
src/app/                Landing, legal pages, room routes, metadata, API
src/app/r/[room]        Shareable room URLs
src/app/api/realtime    Config, Ably tokens, human-check, messages, local SSE/presence
src/app/api/reports     Abuse report intake
src/components          Landing, room, legal, safety UI
src/hooks               Identity, realtime, legal ack, local mute/block
src/lib                 Validation, rate limit, legal copy, retention, podcast catalog, providers
```
