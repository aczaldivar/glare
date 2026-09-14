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
- Basics of moderation: 500-character messages, burst rate limits, plain-text only

Featured room to share: `/r/lobby`.

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

The app chooses a realtime provider automatically:

1. `ABLY_API_KEY` set → Ably
2. Running on Vercel without that key → rooms show a configuration message (serverless instances cannot share the local bus)
3. Otherwise → local SSE bus

## Set up Ably (production)

1. Create a free account at [ably.com](https://ably.com)
2. Create an app, for example `glareroom`
3. Open **API Keys** and copy a key that can publish, subscribe, and be present
4. Put it in `.env.local` for a local Ably test, and in Vercel env vars for production

You do **not** put the root key in the browser. The app mints short-lived tokens from `/api/realtime/token`. Clients can subscribe and enter presence; only the server publishes chat messages (after validation and rate limiting).

## Deploy to Vercel and claim glareroom.vercel.app

1. Push this repo to GitHub (`aczaldivar/glare`).
2. In [Vercel](https://vercel.com), **Add New → Project** and import the GitHub repo.
3. **Project name:** set it to `glareroom` if you want the default `*.vercel.app` host to be `glareroom.vercel.app`. If the project is imported as `glare`, the default host is `glare.vercel.app` — you can still attach `glareroom.vercel.app` in Domains (step 6).
4. Framework preset should be **Next.js**. Root directory stays `/`.
5. Add environment variables (Production, Preview, and Development):
   - `ABLY_API_KEY` = your Ably key
   - `NEXT_PUBLIC_SITE_URL` = `https://glareroom.vercel.app` (or the URL you actually get)
6. **Claim the public URL**
   - Open the project → **Settings → Domains**
   - If the project is named `glareroom`, `glareroom.vercel.app` is assigned automatically
   - If it is not, click **Add Domain** and enter `glareroom.vercel.app`
   - If that name is already taken on Vercel, add the closest available name (`glare-room.vercel.app`, `glareroom-app.vercel.app`, or a custom domain) and set `NEXT_PUBLIC_SITE_URL` to match
7. Deploy. Vercel builds on every push to the production branch.
8. Smoke-test: open the site → **Open lobby** (or create a room) → send a message in two browser windows → **Share link**.

Redeploy after changing env vars so `NEXT_PUBLIC_SITE_URL` is baked into the client bundle.

### Custom domain later

In **Settings → Domains**, add something like `glareroom.com`, follow DNS instructions, then update `NEXT_PUBLIC_SITE_URL`.

## Product notes

- Rooms are public. Anyone with the link can read and write.
- Display names are not unique logins.
- Rate limit: 8 messages / 10 seconds per IP and room, plus a short minimum interval.
- Do not treat this as a private messenger.

## Project layout

```
src/app/                Landing, room routes, metadata, API
src/app/r/[room]        Shareable room URLs
src/app/api/realtime    Config, Ably tokens, messages, local SSE/presence
src/components          Landing + room UI
src/hooks               Identity + realtime client
src/lib                 Validation, rate limit, providers
```
