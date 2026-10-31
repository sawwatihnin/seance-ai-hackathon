# The House Beneath

A local, fifteen-second Halloween cinematic built with React, TypeScript, Vite, Three.js, React Three Fiber, Drei, and GSAP.

## Run

```sh
npm install
npm run dev
```

Open the localhost URL printed by Vite. Production: `npm run build`, then `npm run preview`. Node 20.19+ or 22.12+ is required by Vite. No API keys, backend, remote fonts, or audio downloads are used.

## The film

- 0–3 seconds: dark reveal, purple atmosphere, cold moonlight, original house rig.
- 3–7 seconds: accelerating world-space crawl with skeletal motion and body sway.
- 7–10 seconds: upward lunge, forward pitch about the fitted center of mass, underside approach, impact shake, blackout.
- 10–15 seconds: warm Ouija reveal and camera move into an overhead three-quarter composition.
- At 15 seconds: camera and imported animation poses freeze; candle flicker and ambient dust remain alive. The Ouija board stays as the landing scene.

Skip Intro seeks directly to the final scene. Replay Intro rebuilds the fifteen-second GSAP timeline. Reduced-motion preferences bypass the cinematic. Layout and field of view adapt to portrait screens. No local sound assets were supplied, so the experience is intentionally silent.

## Asset-specific handling

The original GLBs in `public/models` are unchanged. Meshes, textures, materials, bones, and animation tracks come from those files. `useFittedModel` uses precise skinned world bounds to center X/Z and use the source ground plane by default. For the house, an asset-specific Y=-0.1 contact correction excludes a stray vertex at Y=-0.742; the crawl follows precomputed raycast samples from the forest terrain. The outer travel and center-of-mass rotation groups are separate from the imported rig.

The house uses the retired `KHR_materials_pbrSpecularGlossiness` extension. `modelLoader.ts` translates its diffuse texture/factor to the current PBR loader in memory. This asset has zero specular and zero glossiness, so metallic 0 / roughness 1 preserves its authored appearance. No texture is replaced.

### Measured source bounds (world coordinates)

| Asset | Minimum | Maximum | Dimensions | Animation |
|---|---|---|---|---|
| House | (-1.29565, -0.74194, -1.17927) | (1.17559, 1.16940, 1.03114) | (2.47124, 1.91134, 2.21041) | ArmatureAction — 7.5s |
| Ouija | (-0.38832, 0.00015, -0.58499) | (0.44713, 0.22577, 0.17030) | (0.83546, 0.22563, 0.75529) | ouija board part\|ouija board partAction — 23.44s |

Both assets are already Y-up after their embedded conversion matrices. The house faces +Z, with its underside at minimum Y, and has two skinned meshes bound to 46 bones. The board lies in X/Z; skulls, three candles, dagger, and planchette remain in the original hierarchy. A 0.005-world-unit lift keeps the planchette above the board surface without changing its dimensions. The planchette's authored translation and rotation tracks are sampled independently of the camera. `npm run inspect` repeats mesh, skeleton, animation, and bounds analysis without decoding textures; texture omission is limited to the analysis script.

## Verification and limits

`npm run build` validates strict TypeScript and creates the production bundle. Browser checks rendered the textured house, the underside approach at 9.2 seconds, and the complete Ouija scene, and exercised Skip and Replay. Full cinematic timing needs review on target desktop and mobile hardware; no claim of cross-device frame-perfect playback is made. GSAP uses its normal lag smoothing, so heavy stalls or background tabs can extend wall-clock playback while preserving the 15-second timeline. WebGL is required. The bundle warning reflects the included Three.js renderer; the roughly 49 MB of original model assets dominate initial loading.

## Asset credits

- “Spooky House Halloween” by **klaimtrev** — https://sketchfab.com/3d-models/spooky-house-halloween-eb154ab771dd4e06b07ae4694eb3fbbb
- “Lowpoly ouija board with props” by **n-malmberg** — https://sketchfab.com/3d-models/lowpoly-ouija-board-with-props-66e971a7a3a048c0b3fa98c2771ee2b3

Both embedded asset records specify **CC BY 4.0** (https://creativecommons.org/licenses/by/4.0/). Source models are distributed unchanged; runtime fitting, illumination, and cinematic animation are added. Preserve these credits when redistributing.

For deterministic development review, append `?frame=9.2` (any value 0–15) to the dev URL. This frame override is excluded from production builds.

## Forest environment

`a_forest_3_with_a_road_at_night_for_game.glb` supplies the actual textured trees, plants, trunks, terrain, and road for seconds 0–10. The forest is static while the house advances. `ForestEnvironment.tsx` fits the main terrain at scale 5.5 and position (0, -0.65, -13); outlying cards do not drive its fit. Foreground foliage in a narrow central corridor is omitted from the runtime copy so the house remains readable. The original GLB is untouched. Static geometry is batched by its three materials to reduce draw calls; foliage uses alpha testing for proper depth.

Forest-only material clones reduce brightness, tint toward cool blue, and retain 76% saturation. Purple exponential fog increases from 0.027 to 0.046 during the house shots. Local cool fill/rim lights follow the house. The forest remains visible through the flip, then is hidden at second 10 inside the blackout. The Ouija scene uses its own clean stage afterward.

Source forest bounds: minimum (-14.34909, -0.31165, -4.33192), maximum (4.88705, 2.53860, 5.41007). The main terrain spans approximately X=-4.82..4.74 and Z=-4.28..5.19. `node scripts/inspect-models.mjs a_forest_3_with_a_road_at_night_for_game` inspects it independently.

Forest credit: “a forest (3) with a road at night for game” by **dasy444**, https://sketchfab.com/3d-models/a-forest-3-with-a-road-at-night-for-game-61f8c7817fe6457fb26e4814cfc48a3f — **CC BY 4.0**. Runtime changes: fitting, foliage thinning, material grading, static batching, and lighting. Preserve this credit when redistributing.

Forest update verification: production build passes; browser frames at 4s, 9.2s, and 12s check forest composition, underside approach, and the clean Ouija transition. Mobile performance remains unverified; the forest adds a 28 MB download.
