# Security

## Secrets

Do not commit secrets, API keys, or `.env` files. `.env.example` is the only env template that belongs in git.

Production secrets (Ably, Turnstile, Upstash, operator email overrides) live in **Vercel environment variables** only. Local copies go in `.env.local`, which is gitignored.

If a secret is committed by accident, rotate it in the provider dashboard and in Vercel. Do not paste the old value into a public issue or pull request.

## Reports, PII, and chat content

This repository is public.

- Do **not** paste user chat, display names tied to a real person, IP addresses, emails, or other PII into GitHub issues or pull requests.
- Do **not** file abuse reports here or paste report payloads.
- Use the in-app **Report** action in a room, or email the operator at **contact@glareroom.com**.

## Vulnerabilities

If you believe you found a security problem in Glare Room, email **contact@glareroom.com**. Do not open a public GitHub issue with exploit details, payloads, or steps that would help someone abuse the live chat.
