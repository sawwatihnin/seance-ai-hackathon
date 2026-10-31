# Seance.AI portal and agent workspaces

## Run locally

Node 22.12+ recommended. Run `npm ci`, copy `config.example` to `.env` and fill in server-side credentials. Start `npm run server` in one terminal and `npm run dev` in another. Visit http://localhost:5173. Production: `npm run build` then `npm start` (http://127.0.0.1:3001). The Node server serves both the built frontend and API and falls back to the frontend for browser routes. Static-only hosting cannot run this backend.

`/` retains the original cinematic. Its completion callback begins a one-second exit fade while the scene stays mounted, then opens `/portal`. Reduced motion skips the timeline as the original implementation did. `/community`, `/education`, `/business` share a goal → plan → dependency graph → run → result flow. Browser history and deep links work. No original models, lighting, scene components, or timeline have been changed.

## Required artwork

The original transparent PNGs are installed in `public/portal/`. `community.png` from the supplied Desktop project is copied as `community(1).png`; education and business retain their names. These images are the actual clickable navigation. The separate purple reference image has not been supplied, so exact reference comparison remains pending.

## Provider configuration

All secrets stay in `.env` on the server, never in VITE_ variables.

- `GEMINI_API_KEY`: required for planning and composing deliverables; `GEMMA_MODEL` defaults to `gemma-4-26b-a4b-it`. JSON is requested in the prompt and parsed and validated with Zod, including dependency/cycle/quiz/topic checks. Malformed model output fails visibly; no fake plan is substituted.
- `GOOGLE_MAPS_API_KEY`: enable Places API (New). Real text search provides names, addresses, coordinates, Maps links and website URLs. Leaflet uses OpenStreetMap tiles. Verify donation acceptance directly; a listing does not establish it.
- `YOUTUBE_API_KEY`: enable YouTube Data API v3. Real search results show thumbnails, titles, channels, and video links.
- `BRAVE_SEARCH_API_KEY`: web/market/competitor research. Source links are returned by the provider; no invented competitors are inserted.
- `OPENALEX_API_KEY`: optional account key; OpenAlex public availability/rate limits vary. Open Library search needs no key.

Missing credentials produce explicit errors. Health means configured, not that credentials are valid. Live Gemma/YouTube/Places/Brave/Maritime cannot be verified until credentials are supplied. Public APIs require network connectivity.

## Orchestration and persistence

All sections use one LangGraph StateGraph. Each dispatch wave runs independent tasks concurrently; later waves wait for dependencies. Failed prerequisites stop downstream tasks. Transient read/model provider errors retry once; Maritime submissions are never blindly retried. The checklist and graph render the same persisted backend task records. Review checkboxes do not fabricate execution completion.

Runs are atomically saved under `DATA_DIR` (default `.seance-data`, ignored by Git), survive browser reloads, and are selectable in each workspace. This is local server disk persistence, not a hosted shared database. Restarted in-flight workflows become stopped for review instead of being silently rerun. Stop discards late local results; a provider request already in flight can finish. No external email or publishing adapter exists: all outreach and campaigns are drafts for user review. Export downloads the actual run, sources, deliverables and checklist as JSON or a readable Markdown report.

## Maritime

Set `MARITIME_API_KEY` and an existing `MARITIME_AGENT_ID`. Select Maritime before planning. Use a Node 22+ agent with detached-exec support and configure the same provider keys as secret environment variables on that agent. Planning remains on the local backend; LangGraph dispatches each execution task to Maritime. The adapter discovers the persistent volume root, uploads the fixed adapter/worker code, invokes fixed `node` argument arrays (never model-generated shell commands), polls the real execution ID, and saves task result JSON in the volume under `seance-runtime`. Credentials are not embedded in command payloads. Results and execution IDs return to local state. Stop requests remote cancellation while polling. Remote jobs may outlive a local server crash; review recorded execution IDs before rerunning. Remote secrets, runtime, quota, end-to-end persistence and cancellation need a real configured-agent test. No deployment is provisioned automatically and no cloud persistence is claimed before such a test.

## Arduino (optional)

Upload `hardware/seance_status.ino` to Uno; install `pyserial`; configure `ARDUINO_PORT` and the same `ARDUINO_BRIDGE_TOKEN` in backend and bridge. Run `python3 hardware/bridge.py`. The bridge polls authenticated backend status and sends Waiting/Running/Completed/Failed/Stopped. The sketch implements slow blink / fast blink / solid / triple flash / off. Heartbeat expiry turns the LED off. Backend health reports only bridge-token configuration, not a verified USB connection. Hardware testing requires the Uno.

## Verification

`npm run build` performs TypeScript checking and a production Vite build. `npm test` tests dependency rejection, concurrent independent execution, downstream blocking, stop semantics, schema rejection, and transient retry with injected test executors (not live AI). `npm run test:ui` uses Playwright against production output to check routes, history, responsive layout, API failure behavior, and the real cinematic sequence. On macOS, browser tests use full Chromium with Metal because the software-only headless shell stretches the existing GSAP timeline under heavy WebGL load. Browser tests explicitly assert missing credentials; run with an unconfigured local environment. Portal navigation uses the supplied PNGs.

## Scope and remaining work

This is a single-user localhost application, without authentication, team collaboration, hosted database, resumable remote workflows, automatic email/publishing, or expanded analytics. Add authentication and per-user storage/authorization before exposing the backend to multiple users. The backend binds localhost by default. Documentation sources: https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api , https://maritime.sh/docs/api , https://docs.langchain.com/oss/javascript/langgraph/graph-api .

## Verification results in this checkout

Production TypeScript/build passed; Vite reports large bundles. Seven engine/export tests passed. Five production browser checks passed (routes/history/PNG navigation/mobile; missing-key API behavior; real three-model cinematic completion; graph/checklist/backend review persistence using a clearly named test fixture isolated in temporary storage; no-WebGL error fallback navigation). Open Library and OpenAlex each returned six real public API records. The Codex in-app browser does not offer WebGL in this session; the existing fallback now links to the portal. Gemma, Maritime, Places, YouTube and Brave live execution remain unverified without credentials; Arduino is unverified without hardware.
