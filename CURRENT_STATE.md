# Zombie Survival — CURRENT STATE

_Living snapshot for prompting. Updated at the end of every Map-V2 part._

**Version:** v3.6.0 (map flattened to a single ground floor) · **Repo:** khatibapp/zombie-survival · branch `main`
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
- [ ] Part 5 — Logical placement audit + door-swing fix
- [ ] Part 6 — Life pass (clutter, motion, sound, light balance)

## Current map (after Part 1)
Coordinate convention: **−z = NORTH, +z = SOUTH, −x = WEST, +x = EAST.**

Ground floor (all `fy:0`), spawn = Atrium (off-centre, east of footprint centroid):
- **Atrium** (−11..11, −11..11) — spawn; chandelier; doors to Lab/Foyer/Theater/Courtyard
- **Grand Theater** (−57..−11, −11..11) — tall auditorium; former West Gallery merged in as its ruined moonlit far-west end; stage, curtains, seats, **fallen chandelier**, Double Tap + Mule Kick, M16 wall-buy *(balcony/upper removed — now a single-level hall)*
- **Lab** (−11..11, −33..−11) — Pack-a-Punch, teleporter, Speed Cola, Deadshot, Galil wall-buy *(basement/upper stairs removed)*
- **Foyer** (−11..11, 11..33) — Juggernog, teleporter, MP5 wall-buy
- **Courtyard** (11..37, −11..11) — **interior court** wrapped on 3 sides (Depot N, Séance Room S, Atrium W); Stamin-Up, PhD, SPAS wall-buy
- **Morgue** (−37..−11, −33..−11) — drawer wall, gurneys
- **Supply Depot** (11..37, −33..−11) — crates, ammo racks, wrecked truck
- **Séance Room** (11..35, 11..37) — *(former Chapel)* occult ritual chamber: summoning circle, stone sacrificial slab, green witch-fire braziers, ward sigils. No cross/religious iconography. **Power Switch relocated to the Morgue.**
- **Undercroft Passage** (−37..37, −40..−33) — **curved crawl-height** (2.8) back-corridor behind the Lab; faceted parabolic arc; connects Morgue↔Depot

**Single ground floor** (`fy 0`) — the map is now one level. All basement/upper zones, stairs, ramps and the drop-through are removed. The night **sky dome + moon** and the **skyline silhouette** backdrop are kept (cosmetic). The **power switch** moved from the old basement Power Room to the **Morgue** (ground). The same-level check on wall-buys/PaP (`getFloorH`) is kept as a now-no-op safeguard.

**Circulation loops** (verified 9 independent cycles in the door graph; spec asked ≥3):
- L1 north: Atrium→Lab→Depot→Courtyard→Atrium
- L2 nw: Atrium→Lab→Morgue→Theater→Atrium
- L3 south: Atrium→Foyer→Séance Room→Courtyard→Atrium
- L4 back: Morgue→Undercroft→Depot (curved crawl)

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
