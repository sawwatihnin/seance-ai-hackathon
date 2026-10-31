# Seance.AI

An open source shared AI workspace. Today, teammates each work in their own ChatGPT session or Claude terminal, with separate context. Seance.AI lets a team join one workspace with an invite code and collaborate with AI agents on shared context.

`IMPLEMENTATION.md` has setup, provider keys, and verification results. `README.md` covers the cinematic and its assets.

## Current focus

- **Community is the hackathon demo.** Its page is a single dark green shared chat. Education and Business stay in the app with the Midnight theme and corridor transitions, but the demo only enters Community, so put demo work there.
- **Demo goal:** several signed-in people join one Community workspace through an invite code and see the same plans, results, and context.
- **Model:** Gemma 4 (`gemma-4-26b-a4b-it`) through the Gemini API, for the hackathon only.

## Shared workspace status

Built: `/community` is one shared chat for each deployment, with invite-code sessions and a Shared context panel. See `server/room.mjs`, `src/platform/Chat.tsx`, and the Shared workspace section of `IMPLEMENTATION.md`. Accounts, passwords, and multiple workspaces are not built.

Maritime is the intended host, and the root `Dockerfile` is ready for it. `server/maritime.mjs` is separate: it only sends individual tasks to an existing agent, and has never run against a real one.

What Maritime provides (from https://maritime.sh/docs, checked 2026-10-31):

- Public HTTPS URLs at `https://<agent-id>.mtm.sh/` for a Dockerfile app. Public visibility needs a verified email.
- A persistent `/data` volume for each agent, encrypted env vars, and sleep and wake. Timers do not fire while an agent sleeps.
- End users keyed by an ID we supply, with per-user agents, tokens, and share links.

What it does not document, so we built or must build it:

- End-user sign-in, teams, members, roles, and invite codes.
- Shared context across people or agents. Each end user gets a separate agent, and agents do not share a volume.
- A database. Bring your own.

Approach: deploy this app as one shared Maritime agent, with workspace state in `/data` and our own invite codes and sessions in front of it. Set `INVITE_CODE` before making the URL public, because the code is what protects the Gemini quota. See `IMPLEMENTATION.md` for deployment steps. `vercel.json` only hosts the static frontend, so the API does not work there.

## Future scope

- **Sign in with ChatGPT:** let people use their existing model provider instead of Gemma. OpenAI's program is limited to selected partners and eligible tools as of October 2026, so confirm access in OpenAI's developer docs before building. A user-supplied API key is the fallback.

## Working in this repo

- `npm start` serves the production build and API at http://127.0.0.1:3001. Run `npm run build` first, and restart after server changes.
- `npm run server` plus `npm run dev` runs development mode. Port 5173 may be in use by another local project.
- `npm test` runs unit tests. `npm run test:ui` runs browser tests and needs `npx playwright install chromium` once.
- Match the existing style: source files are dense, with long single lines and no formatter.
- Never commit `.env`. The repository is public, so stage files by name and do not use `git add -A`. All secrets stay server-side, never in `VITE_` variables.
- Keep the `.env` rule in `.gitignore`, and keep the router in `src/App.tsx`, the API proxy in `vite.config.ts`, and the backend dependencies in `package.json`. An earlier merge rolled these back by accident.
- Agents only draft outreach. Nothing is sent or published automatically.
- Live Gemma replies can occasionally be invalid. Tasks retry once, and a failed run must be replanned.
