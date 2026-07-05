# Zombie Survival — CURRENT STATE

_Living snapshot for prompting. Updated at the end of every Map-V2 part._

**Version:** v3.8.0 (6-room redesign + 3-switch power) · **Repo:** khatibapp/zombie-survival · branch `main`
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
- [x] **REDESIGN — fewer/denser rooms** (v3.8.0). **9→6 merges:** Lab absorbs Supply Depot, Grand Theater absorbs the Morgue, Courtyard absorbs the Séance Room (morgue/chapel/depot ROOMS keys removed; doors rerouted). Still a fully-connected loop, no orphans.
- [x] **3-SWITCH POWER** (v3.7.0). Power needs finding + throwing **3 switches** (Undercroft, far-west, far-east); free to flip; power on only at 3/3, then teleporters + PaP unlock. `powerThrown` counter, prompt shows "N of 3".
- [ ] Part 6 — Life pass (clutter, motion, sound, light balance) + per-room theming polish

## Current map (6 rooms, single ground floor `fy:0`)
Coordinate convention: **−z = NORTH, +z = SOUTH, −x = WEST, +x = EAST.** Spawn = Atrium.
- **Atrium** (−11..11, −11..11) — spawn hub; chandelier; 4 doors to Lab/Foyer/West Wing/East Wing.
- **North Lab / Workshop** (−11..37, −33..−11) — *Lab + old Supply Depot merged.* Pack-a-Punch, teleporter, Speed Cola + Deadshot perks, Galil wall-buy; crates/racks/truck (old depot); **Power Switch #2** at (−30 is West; depot end has one). Undercroft door on its north wall.
- **Foyer** (−11..11, 11..33) — Juggernog, teleporter, MP5 wall-buy.
- **West Wing / Grand Theater** (−57..−11, −33..11) — *Theater + old Morgue merged.* Tall auditorium (stage, curtains, fallen chandelier, seats), Double Tap + Mule Kick, M16 wall-buy; morgue drawers/gurneys at the north end; **Power Switch (far-west)** at (−30,−20). Undercroft door on the morgue-end north wall.
- **East Wing / Courtyard** (11..37, −11..37) — *Courtyard + old Séance Room merged.* Stamin-Up + PhD, SPAS wall-buy; occult summoning circle / slab / green braziers / ward sigils at the south end; **Power Switch (far-east)** at (30,30).
- **Undercroft Passage** (−37..37, −40..−33) — curved crawl-height back-corridor; connects West Wing ↔ North Lab; **Power Switch (Undercroft)** at (0,−36).

**Power:** 3 switches (Undercroft, far-west West Wing, far-east East Wing) — throw all 3 to restore power; then teleporters + PaP unlock.

**Circulation:** Atrium is the 4-way hub; Undercroft is the back-loop (West Wing ↔ North Lab). Fully connected, no orphans (verified: all 6 rooms reachable, nav bakes over the whole map).

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
