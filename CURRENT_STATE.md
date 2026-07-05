# Zombie Survival — CURRENT STATE

_Living snapshot for prompting. Updated at the end of every Map-V2 part._

**Version:** v3.8.1 (9-room map + 3-switch power; merge reverted, map regressions fixed) · **Repo:** khatibapp/zombie-survival · branch `main`
**Ship flow:** bump `package.json` → commit → `git tag vX.Y.Z` → push tag → GitHub Actions builds `ZombieSurvival-Setup-<ver>.exe` + `latest.yml` → in-app updater.

## What the game is
Round-based zombie survival FPS. Single file `index.html` (~4,800 lines, inline Three.js r128).
Electron desktop app, auto-updates from GitHub Releases. Fully offline. WWII-era occult-horror art direction, original assets only (CC0 in `/assets`, MIT post-proc in `/vendor/pp`).

## Map progress
- [x] **Part 1 — Footprint reshape** (v3.2.0). Hub-and-spoke → looped network.
- [x] **Part 4 — Outdoors** (v3.5.0). Skyline silhouette + per-run weather. *(Bell tower + sky-bridge removed in v3.6.0; skyline kept.)*
- [x] **SIMPLIFY — single ground floor** (v3.6.0). **Reverted Parts 2/3**: all basement/upper layers, stairs, ramps and the drop-through are gone; `getFloorH()` returns a constant 0. Chapel replaced by the **Séance Room** (occult, no religious iconography). Spawn points re-validated against `blocked()` + a spawn-time nudge guard so nothing spawns in walls. A* now covers the whole (flat) map.
- ~~Part 2 — Real vertical layers~~ **DROPPED** (v3.6.0). Multi-floor geometry removed.
- ~~Part 3 — Multi-floor pathfinding~~ **OBSOLETE** (v3.6.0). Layered-nav code left dormant (harmless empty upper/basement layers); ground A* covers the map.
- [x] **3-SWITCH POWER** (v3.7.0). Power needs finding + throwing **3 switches** (Undercroft, far-west Morgue, far-east Séance); free to flip; power on only at 3/3, then teleporters + PaP unlock. `powerThrown` counter, prompt shows "N of 3".
- ~~REDESIGN — 9→6 merges~~ (v3.8.0, **REVERTED in v3.8.1** by request — back to 9 rooms).
- [x] **MAP REGRESSIONS FIXED** (v3.8.1). Reverted the merges (all dividing walls restored); added zombie **no-progress stuck-recovery** (nudge to nearest walkable nav cell after 2.5s); cleared the Morgue drawer that obscured the **Undercroft entrance**; realigned the **M16 wall-buy** trigger to its sign.
- [ ] Part 6 — Life pass (clutter, motion, sound, light balance) + per-room theming polish

## Current map (9 rooms, single ground floor `fy:0`)
Coordinate convention: **−z = NORTH, +z = SOUTH, −x = WEST, +x = EAST.** Spawn = Atrium.
- **Atrium** (−11..11, −11..11) — spawn hub; chandelier; 4 doors to Lab/Foyer/Theater/Courtyard.
- **Lab** (−11..11, −33..−11) — Pack-a-Punch, teleporter, Speed Cola + Deadshot, Galil wall-buy; doors to Morgue (W) + Depot (E).
- **Foyer** (−11..11, 11..33) — Juggernog, teleporter, MP5 wall-buy; door to Séance Room.
- **Grand Theater** (−57..−11, −11..11) — tall auditorium (stage, curtains, fallen chandelier, seats); Double Tap + Mule Kick, **M16 wall-buy** (sign+buy realigned at (−30,−10)); Morgue door on north wall; **Power Switch (far-west)** near (−30,−20).
- **Courtyard** (11..37, −11..11) — interior court; Stamin-Up + PhD, SPAS wall-buy; doors to Depot (N) + Séance (S).
- **Morgue** (−37..−11, −33..−11) — drawer wall + gurneys; **Undercroft entrance** on its north wall (drawer over the doorway removed in v3.8.1).
- **Supply Depot** (11..37, −33..−11) — crates, ammo racks, wrecked truck; Undercroft door.
- **Séance Room** (11..35, 11..37) — occult ritual chamber (circle/slab/green braziers/ward sigils; no religious iconography); **Power Switch (far-east)** near (30,30).
- **Undercroft Passage** (−37..37, −40..−33) — curved crawl-height back-corridor connecting Morgue ↔ Depot; **Power Switch (Undercroft)** at (0,−36).

**Power:** 3 switches (Undercroft, far-west Morgue/Theater end, far-east Séance) — throw all 3 to restore power; then teleporters + PaP unlock.

**Circulation:** Atrium 4-way hub; Undercroft back-loop (Morgue ↔ Depot). Fully connected, no orphans (verified: all 9 rooms reachable via doors, flood-fill leaks into 0 rooms, nav has no walkable cell in a wall).

## Systems in the build
Weapons (pistol + Galil/MP5/M16A1/SPAS-12, Pack-a-Punch), 7 perks (Jugg, Speed Cola, Deadshot, Double Tap, Mule Kick, Stamin-Up, PhD), mystery box (relocates over 8 spots), 2 teleporters (Lab↔Foyer), grenades, monkey bombs, power switch (map starts emergency-red), boss rounds, powerups (Max Ammo/Double Points/Nuke/Insta-Kill/Fire Sale), atmosphere (rain, lightning, dust, flicker, night skybox+moon, gramophones). Dev menu on backtick.

## Engine constraints (important for prompting)
- **Collision is axis-aligned box (AABB) + rectangular room tests.** Non-90°/curved geometry is done by **faceted** angled wall meshes with stepped AABB colliders behind them (e.g. the Undercroft arc). True oriented colliders would need an engine rewrite.
- Rooms are rectangles (`ROOMS[key]={x0,x1,z0,z1,fy,open}`); non-rectangular zones are composed from multiple rectangles.
- **Single ground floor** — `getFloorH()` returns a constant 0. `HZ_FLAT`/`HZ_RAMP` are kept but empty/dormant (so callers don't break). Floor-band tolerances remain in the collision/interact code as harmless no-ops on a flat map.
- Nav grid auto-bakes bounds from `ROOMS` — now the **whole** (flat) map.

## Pathfinding
A* over the ground walkability grid — now covers the entire map (all rooms are `fy 0`). The layered-nav machinery (per-floor grids, `navFindPath3`, vertical portal edges, `NAV_FYS=[0,-4.5,4.5]`) is **left dormant**: the upper/basement layers bake empty since no rooms live there, so paths resolve on the ground layer. Door purchases reconnect the graph live (`navPassable` reads `door.open`). Verified: every room reachable from the Atrium; no spawn point resolves to a blocked cell.

## Outdoors
Skyline: a fog-exempt silhouette ring on the horizon (ruined buildings, burned trees, drifting smoke columns) — cosmetic backdrop. Weather: rolled once per run — **RAIN** or **CLEAR**; `_fogBase` carries the weather fog colour through round changes. *(The upper-floor sky-bridge + Bell Tower were removed with the vertical layers in v3.6.0; the skyline + night sky remain.)*

## Known gaps / next
- Placement not yet spatially audited; door-swing parking bug (Part 5).
- Rooms still sparse between landmarks; no per-room ambient audio/motion (Part 6).
- Dormant layered-nav code (`buildLayersV32`, `navFindPath3`, `NAV_FYS`) could be pruned later; left in place as the safe option since removal touches the nav core.

## Verification method
Code-only on my side: syntax check (`new Function` on the inline script) + a live Electron **load probe** (temporary `main.js` hooks capturing console/errors + `executeJavaScript` structural asserts — room set, spawns-in-bounds, door graph loops/reachability, nav bake), always removed before shipping. **User playtests gameplay** and reports bugs by room name.
