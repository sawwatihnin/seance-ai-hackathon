# Seance.AI portal and agent workspaces

## Run locally

Node 22.12+ recommended. Run `npm ci`, copy `config.example` to `.env` and fill in server-side credentials. Start `npm run server` in one terminal and `npm run dev` in another. Visit http://localhost:5173. Production: `npm run build` then `npm start` (http://127.0.0.1:3001). The Node server serves both the built frontend and API and falls back to the frontend for browser routes. Static-only hosting cannot run this backend.

`/` retains the original cinematic. Its completion callback begins a one-second exit fade while the scene stays mounted, then opens `/portal`. Reduced motion skips the timeline as the original implementation did. `/community`, `/education`, `/business` share a goal → plan → dependency graph → run → result flow. Browser history and deep links work. The original models, lighting, scene components, and timeline are unchanged; the only cinematic edit is a portal link in the WebGL fallback.

## Required artwork

The portal uses the blackletter wordmarks `cm2.png`, `edu.png`, and `busi.png` over the `bg.jpg` forest, all in `public/portal/`. These images are the actual clickable navigation; the earlier `community(1).png`, `education.png`, and `business.png` are no longer used. The horror GLBs in the repository root (`corridor`, `creeping_flesh_creature`, `creepy_scarecrow`, `nurse_of_horror`) are not connected to any scene. The separate purple reference image has not been supplied, so exact reference comparison remains pending.

## Provider configuration

All secrets stay in `.env` on the server, never in VITE_ variables.

- `GEMINI_API_KEY`: required for planning and composing deliverables; `GEMMA_MODEL` defaults to `gemma-4-26b-a4b-it`. Requests use JSON mode with thinking off (about four times faster in testing, with no change in output size), and responses are validated with Zod, including dependency/cycle/quiz/topic checks. Malformed model output fails visibly; no fake plan is substituted.
- `GOOGLE_MAPS_API_KEY`: enable Places API (New). Real text search provides names, addresses, coordinates, Maps links and website URLs. Leaflet uses OpenStreetMap tiles. Verify donation acceptance directly; a listing does not establish it.
- `YOUTUBE_API_KEY`: enable YouTube Data API v3. Real search results show thumbnails, titles, channels, and video links.
- `BRAVE_SEARCH_API_KEY`: web/market/competitor research. Source links are returned by the provider; no invented competitors are inserted.
- `OPENALEX_API_KEY`: optional account key; OpenAlex public availability/rate limits vary. Open Library search needs no key.

Missing credentials produce explicit errors. Starting a local plan checks the keys its tasks need first; if any are missing the plan stays Waiting, so add them to `.env`, restart the server, and run it again. Maritime runs skip this check because their keys live on the agent. Planning only offers tools that suit the workspace and have keys: Education uses books, papers and YouTube; Community uses Places and Brave; Business uses Brave. Any step using another tool is dropped from the plan. With Gemini alone, Community and Business run on the model only, leave placeholders for real names and figures, and show a no-live-sources notice. Health means configured, not that credentials are valid. Live Gemma/YouTube/Places/Brave/Maritime cannot be verified until credentials are supplied. Public APIs require network connectivity.

## Orchestration and persistence

All sections use one LangGraph StateGraph. Each dispatch wave runs independent tasks concurrently; later waves wait for dependencies. Failed prerequisites stop downstream tasks. Transient read/model provider errors (429/5xx, timeouts, network failures) retry once during local execution; planning requests do not retry, and Maritime submissions are never blindly retried. The checklist and graph render the same persisted backend task records. Review checkboxes do not fabricate execution completion.

Runs are atomically saved under `DATA_DIR` (default `.seance-data`, ignored by Git), survive browser reloads, and are selectable in each workspace. This is local server disk persistence, not a hosted shared database. Restarted in-flight workflows become stopped for review instead of being silently rerun. Stop discards late local results; a provider request already in flight can finish. No external email or publishing adapter exists: all outreach and campaigns are drafts for user review. Export downloads the actual run, sources, deliverables and checklist as JSON or a readable Markdown report.

## Maritime

Set `MARITIME_API_KEY` (exec requires the `deploy` scope) and an existing `MARITIME_AGENT_ID`. Select Maritime before planning. Use a Node 22+ agent with detached-exec support and configure the same provider keys as secret environment variables on that agent. Planning remains on the local backend; LangGraph dispatches each execution task to Maritime. The adapter discovers the persistent volume root, uploads the fixed adapter/worker code, invokes fixed `node` argument arrays (never model-generated shell commands), polls the real execution ID, and saves task result JSON in the volume under `seance-runtime`. Credentials are not embedded in command payloads. Results and execution IDs return to local state. Stop requests remote cancellation while polling. Remote jobs may outlive a local server crash; review recorded execution IDs before rerunning. Remote secrets, runtime, quota, end-to-end persistence and cancellation need a real configured-agent test. No deployment is provisioned automatically and no cloud persistence is claimed before such a test. `tests/maritime.test.mjs` checks the client against responses modelled on the published API, not a real agent. The API docs do not specify the `files/mkdir` body, so `{path}` is unconfirmed. Task input travels as one base64 command argument, so very large dependency results may exceed the agent's argument limit; move it to a volume file if that happens.

## Arduino (optional)

Upload `hardware/seance_status.ino` to Uno; install `pyserial`; configure `ARDUINO_PORT` and the same `ARDUINO_BRIDGE_TOKEN` in backend and bridge. Run `python3 hardware/bridge.py`. The bridge polls authenticated backend status and sends Waiting/Running/Completed/Failed/Stopped. The sketch implements slow blink / fast blink / solid / triple flash / off. Heartbeat expiry turns the LED off. Backend health reports only bridge-token configuration, not a verified USB connection. Hardware testing requires the Uno.

## Verification

`npm run build` performs TypeScript checking and a production Vite build. `npm test` tests dependency rejection, concurrent independent execution, downstream blocking, stop semantics, schema rejection, topic graphs, transient retry, export, and the Maritime client with injected test executors and mocked responses (not live AI). `npm run test:ui` needs `npx playwright install chromium` once, and a fresh `npm run build`. It uses Playwright against production output to check routes, history, responsive layout, API failure behavior, origin/credential/review guards, and the real cinematic sequence. On macOS, browser tests use full Chromium with Metal because the software-only headless shell stretches the existing GSAP timeline under heavy WebGL load. Browser tests assert missing credentials, so the Playwright config blanks provider keys for its test server; a filled `.env` does not affect them. Portal navigation uses the supplied PNGs.

## Scope and remaining work

This is a single-user localhost application, without authentication, team collaboration, hosted database, resumable remote workflows, automatic email/publishing, or expanded analytics. Add authentication and per-user storage/authorization before exposing the backend to multiple users. The backend binds localhost by default. Documentation sources: https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api , https://maritime.sh/docs/api , https://docs.langchain.com/oss/javascript/langgraph/graph-api .

## Verification results in this checkout

Production TypeScript/build passed; Vite reports large bundles. Seventeen engine/export/Maritime client tests passed. Six production browser checks passed (routes/history/PNG navigation/mobile; missing-key API behavior; real three-model cinematic completion; graph/checklist/backend review persistence using a clearly named test fixture isolated in temporary storage; origin/credential/review guards; no-WebGL error fallback navigation). One full plan-to-completion HTTP run passed through the real server and LangGraph with Gemini responses stubbed; its Open Library and OpenAlex steps used the live APIs and each returned six records. With a real Gemini key, a Community run completed live in 72 seconds and Business completed in 87 seconds. Live Gemma output is not fully reliable: the last three-workspace run, before the retry for invalid model output was added, saw Education and Community fail on invalid responses, and the root cause is unconfirmed. Education has not been rerun since, and a failed run must be replanned. Maritime, Places, YouTube and Brave live execution remain unverified without credentials; Arduino is unverified without hardware.
