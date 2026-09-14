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
- Safety basics: 13+ notice (not age verification), Community Guidelines / Terms acknowledgment before entering a room, 500-character messages, burst rate limits, plain-text only, in-app report stub, mute/block in this browser
- In-app **Terms of Service**, **Privacy**, and **Community Guidelines** (plain-language product drafts)
- Footer links to those pages; no analytics or advertising cookies in v1
- **Podcast rooms (demo):** curated episode + transcript + live chat at `/r/lobby-ep1`. Not a public podcast host yet.

Featured room to share: `/r/lobby`. Demo podcast room: `/r/lobby-ep1`.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- Deploys as a standard Vercel project (no custom long-lived server)
- **Production realtime:** [Ably](https://ably.com) (token auth from a Next.js route; clients subscribe only)
- **Local realtime:** in-process event bus + Server-Sent Events, so `npm run dev` works with no keys

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

### Operator contact

Legal pages, the site footer, and support copy use **contact@glare.com**.

`OPERATOR_CONTACT_EMAIL` defaults to that address. Set it in Vercel only if you need to override it, then redeploy.

The app chooses a realtime provider automatically:

1. `ABLY_API_KEY` set → Ably
2. Running on Vercel without that key → rooms show a configuration message (serverless instances cannot share the local bus)
3. Otherwise → local SSE bus

## Set up Ably (production)

1. Create a free account at [ably.com](https://ably.com)
2. Create an app, for example `glareroom`
3. Open **API Keys** and copy a key that can publish, subscribe, and be present
4. Put it in `.env.local` for a local Ably test, and in Vercel env vars for production

You do **not** put the root key in the browser. The app mints short-lived tokens (~10 minutes) from `/api/realtime/token`, scoped to **one** room channel (`glare:room:{room}`) with subscribe + presence only. Clients cannot publish. Only the server publishes chat messages (after validation and rate limiting). Token minting is rate-limited per IP.

## Rate limits

Message send: 8 / 10 seconds per IP and room, plus a short minimum interval. Ably token minting: 12 / 60 seconds per IP.

**Vercel caveat:** the default limiter is an in-memory map on the Node process. Serverless isolates do not share that map, so a client can get a fresh budget on a cold instance. That is enough for local `next dev` / `next start`, not a strong production control.

For a shared limit, set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (Upstash Redis REST). When those are set, token, message, and report limits go through Redis and fail closed if Redis errors.

## Security notes

- `ABLY_API_KEY` is server-only. Browser clients receive a token for **one** room (`glare:room:{room}`), 10-minute TTL, subscribe + presence, no publish.
- Responses include `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` disabling camera/mic/geo, and a Content-Security-Policy that allows this origin plus Ably.

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
- Do not treat this as a private messenger.
- **No analytics or advertising cookies in v1.** Guest state uses `localStorage` (identity, legal acknowledgment, mute/block), not a tracking cookie.

## Message retention (~30 days)

The product target is to keep chat for about **30 days**, then drop it. That number lives in `MESSAGE_RETENTION_DAYS` (`src/lib/constants.ts`).

v1 does **not** have a durable message database:

- Local/dev: in-memory bus history is pruned to the 30-day window (and a short count cap).
- Production Ably: rewind is recent messages, usually much shorter than 30 days.
- The room UI ignores any message older than 30 days if one appears.
- In-memory reports are pruned with the same window.

A scheduled deletion job against durable storage is **out of scope for v1**. When a database exists, reuse `MESSAGE_RETENTION_DAYS` / `MESSAGE_RETENTION_MS` for that job instead of inventing a second policy.

## Podcast rooms (demo, not publicly launchable)

A room slug can be tied to a **curated** episode: HTML5 audio (or later an approved embed), a full English transcript, and the same live chat. Chat is the discussion; the transcript is first-class (readable and searchable). Share `/r/{slug}`.

**Do not treat podcast rooms as a public product until Terms and Privacy are patched for that format.** v1 has no user audio/transcript upload UI. Official / rights-clear / in-repo demo files only.

Demo: `/r/lobby-ep1` — original English copy plus synthetic tones at `public/audio/demo-episode.mp3` (royalty-free, generated). Transcript lives in `src/lib/podcast/demo-episode.ts` and is sanitized to plain text before render (no raw HTML).

### Add an episode

1. Put rights-clear audio in `public/audio/` (or use an approved embed URL — then update CSP `frame-src` if needed).
2. Add a `PodcastEpisode` to the catalog in `src/lib/podcast/catalog.ts` (`roomSlug`, `title`, `audioUrl`, `durationMs`, `language: "en"`, `transcript: TranscriptCue[]`).
3. Optional `contentWarning` shows a banner.
4. Quote-to-chat is required for citing a line (Quote on a cue fills the composer).

English-only in v1. Existing legal gates still apply (13+ notice, Guidelines/Terms ack, mute/block, report).

## Legal copy (drafts, not counsel)

The Terms of Service, Privacy Policy, and Community Guidelines in this repo are **plain-language product drafts** written so Anna can ship a public URL with a visible safety layer. They are **not formal legal advice** and have not been reviewed by an attorney.

Before a public launch, review and revise `/terms`, `/privacy`, and `/guidelines`, and confirm they match how you actually host and log data. Operator contact is **contact@glare.com**. Changing the acknowledgment version in `src/lib/legal.ts` will ask returning visitors to agree again.

## Project layout

```
src/app/                Landing, legal pages, room routes, metadata, API
src/app/r/[room]        Shareable room URLs
src/app/api/realtime    Config, Ably tokens, messages, local SSE/presence
src/app/api/reports     Abuse report intake
src/components          Landing, room, legal, safety UI
src/hooks               Identity, realtime, legal ack, local mute/block
src/lib                 Validation, rate limit, legal copy, retention, podcast catalog, providers
```
