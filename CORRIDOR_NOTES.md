# Midnight Séance and corridor transitions

## Scope

The existing forest → haunted house → Ouija cinematic, its components, timeline, lights, cameras and three original GLBs are unchanged. Portal background/wordmarks and `portal.css` are unchanged. All backend adapters, workspace inputs, maps, graphs, checklists, results, and device monitoring are unchanged.

`midnight.css` scopes the new palette to `.workspace` only. `App.tsx` adds only its stylesheet import. Portal links retain real destination hrefs: a normal click/Enter opens the short corridor; reduced motion, modified clicks and direct workspace URLs navigate normally. Returning to the portal does not play a corridor. Replay still opens the original `/` cinematic.

## Inspected supplied models

All GLBs are copied byte-for-byte into `public/models/`; no original textures or materials are rewritten. Bounds below are Three.js world bounds after the imported node transforms (including the Sketchfab axis conversion), before display normalization.

| File | Size | World dimensions X × Y × Z | Materials / embedded images | Clips |
| --- | --- | --- | --- | --- |
| corridor.glb | 5.75 MB | 527.814 × 135.901 × 570.591 | 15 / 14 | None |
| nurse_of_horror.glb | 88.51 MB | .742 × 1.750 × .309 | 7 / 21 | None |
| creeping_flesh_creature__free_3d_horror_model.glb | 46.14 MB | 1.221 × 2.000 × 1.228 | 1 / 3 | None |
| creepy_scarecrow__horror_stylized.glb | 7.14 MB | 1.688 × 2.434 × .686 (bind pose) | 1 / 1 | `Armature|Unsteady_Walk|baselayer`: 3 seconds, 72 tracks |

Nurse: ten static meshes, authored +Z front (the badge and belt verify orientation); 12 textures at 1024², six at 4096², three at 512². Flesh: seven static dense meshes, authored crouch, +Z face confirmed in browser; three 2048² textures. Scarecrow: one skinned mesh, imported skeleton and +Z-facing walk confirmed in browser; the supported `KHR_materials_specular` and emissive map remain intact. None of these new models requires the old intro's legacy specular/glossiness material adaptation, so the intro loader is not changed or reused for them.

## Corridor staging and framing

The whole room envelope includes adjoining rooms. Its center is not a usable hallway camera position. Downward floor rays and horizontal clearance rays identify a long open Z lane near source X=-263.3. At source Z=170, the walls are near X=-307 and -219, with over 500 source units clear toward -Z. Floor mesh `Material3_6` is at Y≈90.93283; total scene Y bounds are 90.77058…226.67194. Character source-space Z=-60 puts it in the hallway, facing the camera down +Z.

The room's architectural height is normalized to 3.2 display units. Each actor is cloned with SkeletonUtils and grounded from its own bounds, scaled to 55–60% of corridor height. For the scarecrow, seven sampled authored walk poses define the fitting/grounding envelope instead of its taller/wider bind pose; runtime animation remains unchanged. Runtime camera distance derives from each actor's actual width/height/depth, vertical FOV, and viewport aspect; it is not one arbitrary distance for every character or device. Materials/textures and shared loader-cache resources are retained with `dispose={null}`. The nurse and flesh creature have no invented skeletal movement. `useAnimations` plays only the scarecrow's inspected authored clip and cleans up its action/mixer on unmount.

## Timing, performance and access

After a fully rendered warmup frame, the shared scene plays 2.5 seconds: .0–.5 entry fade, .5–1.8 reveal and camera dolly, 1.8–2.5 exit fade. The original intro is separate and untouched. No audio, strobes or repeated flashing is added.

The scene module is lazy. Only the 5.75 MB corridor preloads after a 1.2-second delay; the selected actor starts preloading on hover/focus. Save-Data and reduced motion disable that delayed preloading; reduced motion bypasses the transition completely. Cached source resources are reused, with scene/skeleton clones for animation isolation. Antialiasing is off; DPR is capped at 1.25 and AdaptiveDpr reduces it on slow frames while retaining the character.

The modal exposes a keyboard-focused Skip Transition button and Escape; the underlying portal is inert during the passage. Body scrolling is restored on cleanup. Media-query and WebGL-context listeners, timers, frame subscriptions and animation actions are cleaned up. Model/module failure or WebGL failure falls through to the selected workspace. Cold loading is bounded at 20 seconds; once ready, a 3.5-second render-loop watchdog backs up the 2.5-second completion callback. Navigating Back unmounts/cancels the pending transition. No additional browser-history entry is added for the corridor.

The uncompressed nurse and flesh assets are large. On slow connections their first load can reach the 20-second fallback; Skip always stays available. The 2.5-second target refers to the rendered passage, not a guaranteed network download time. Existing authentication/API credential requirements have not changed.

## Verification

`npm run build`: TypeScript and production Vite build. `npm run test:ui -- --workers=1`: original cinematic, portal images/replay, routes/history, actual three-character rendering and destinations, Midnight desktop/mobile workspaces, direct URLs, reduced motion, skip/Escape/timeout/load failure/Back, mobile canvas and no-WebGL fallback, and existing graph/checklist persistence. Screenshots live under ignored `test-results/`. Use full Chromium with Metal on macOS, as configured, for actual WebGL checks; the Codex in-app browser does not expose WebGL in this session and correctly skips the corridor. The workspace backend and AI APIs are not changed by this update.

## Files changed in this update

- `src/App.tsx`: adds the workspace-only Midnight stylesheet import; route definitions and original cinematic import are unchanged.
- `src/platform/Portal.tsx`: normal-click/keyboard destination interception, selected-asset preload, and corridor lifecycle. Background, PNG references, branding and replay destination are retained.
- New `src/platform/midnight.css`: scoped workspace design system.
- New `src/transitions/HorrorCorridorTransition.tsx`, `CorridorNavigation.tsx`, `config.ts`, `preload.ts`, and `corridor.css`: shared rendering, inspected mappings, bounded modal/skip/navigation, loading and styling.
- Four new GLBs in `public/models/`, listed above.
- New `tests/corridor.spec.ts`; existing `tests/platform.spec.ts` and `tests/portal.spec.ts` isolate general navigation tests with reduced motion, while the new tests exercise real 3D transitions.
- This `CORRIDOR_NOTES.md` records model findings, behavior and limitations.

The pending portal-art update from the previous request remains present; its four new portal images and background stylesheet were not altered by this corridor update. No commits, remotes, repository history, backend integration code or dependencies were changed.

Validation outcome: production TypeScript/build passed (Vite retains a large-chunk warning). Full 13-browser-test regression passed. Following the walking-pose grounding refinement, the five corridor-specific tests were rerun. Actual Chromium screenshots confirm all three characters/materials, the authored scarecrow walk, mobile canvas framing, and desktop/mobile Midnight workspaces. Credential-gated live AI execution remains outside this styling/navigation update.

## Cold production load correction

A fresh Chromium run against Vercel confirmed Education and Business and all three Midnight palettes, but Community hit the former 10-second loading cutoff before its 88.5 MB nurse finished downloading. Community now uses `nurse_of_horror.runtime.glb`, a 71.3 MB lossless WebP repack. All 21 decoded texture pixel arrays were compared exactly, all non-image buffer-view bytes and material/node/mesh definitions are preserved, and the original GLB remains unchanged. This is compression, with no texture resizing or mesh simplification. The installed GLTF loader supports EXT_texture_webp. `scripts/optimize-nurse.py` (Python + Pillow) reproduces the asset. A 20-second cold-load budget allows download/texture upload, while the rendered animation remains 2.5 seconds and Skip is always available. A throttled, cache-disabled browser regression checks the Community reveal at 40 Mbps.
