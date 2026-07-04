# Zombie Survival — CURRENT STATE

_Living snapshot for prompting. Updated at the end of every Map-V2 part._

**Version:** v3.3.0 (Map-V2 Part 2 complete) · **Repo:** khatibapp/zombie-survival · branch `main`
**Ship flow:** bump `package.json` → commit → `git tag vX.Y.Z` → push tag → GitHub Actions builds `ZombieSurvival-Setup-<ver>.exe` + `latest.yml` → in-app updater.

## What the game is
Round-based zombie survival FPS. Single file `index.html` (~4,800 lines, inline Three.js r128).
Electron desktop app, auto-updates from GitHub Releases. Fully offline. WWII-era occult-horror art direction, original assets only (CC0 in `/assets`, MIT post-proc in `/vendor/pp`).

## Map-V2 progress (corrective redesign)
- [x] **Part 1 — Footprint reshape** (v3.2.0). Hub-and-spoke → looped network.
- [x] **Part 2 — Real vertical layers** (v3.3.0). 3 layers, 27 zones, 7 stairs/ramps/ladder.
- [ ] Part 3 — Multi-floor pathfinding (delete direct-steer fallback)
- [ ] Part 4 — Outdoors (skyline, weather roll, collapsed bridge)
- [ ] Part 5 — Logical placement audit + door-swing fix
- [ ] Part 6 — Life pass (clutter, motion, sound, light balance)

## Current map (after Part 1)
Coordinate convention: **−z = NORTH, +z = SOUTH, −x = WEST, +x = EAST.**

Ground floor (all `fy:0`), spawn = Atrium (off-centre, east of footprint centroid):
- **Atrium** (−11..11, −11..11) — spawn; chandelier; doors to Lab/Foyer/Theater/Courtyard
- **Grand Theater** (−57..−11, −11..11) — **2-story volume** (ceiling 8.6), former West Gallery merged in as its ruined moonlit far-west end; stage, curtains, seats, **fallen chandelier**, Double Tap + Mule Kick, M16 wall-buy
- **Lab** (−11..11, −33..−11) — Pack-a-Punch, teleporter, Speed Cola, Deadshot, Galil wall-buy; basement/upper stairs
- **Foyer** (−11..11, 11..33) — Juggernog, teleporter, MP5 wall-buy
- **Courtyard** (11..37, −11..11) — **interior court** wrapped on 3 sides (Depot N, Chapel S, Atrium W); Stamin-Up, PhD, SPAS wall-buy
- **Morgue** (−37..−11, −33..−11) — drawer wall, gurneys
- **Supply Depot** (11..37, −33..−11) — crates, ammo racks, wrecked truck
- **Chapel** (11..35, 11..37) — altar, stained glass, pews
- **Undercroft Passage** (−37..37, −40..−33) — **curved crawl-height** (2.8) back-corridor behind the Lab; faceted parabolic arc; connects Morgue↔Depot

**BASEMENT layer** (`fy −4.5`) — 4 connected zones: **Cold Storage** (under Morgue; freezer racks) — **Boiler Room** (furnace, flooded) — **Maintenance Tunnel** (spine) — **Power Room** (under Foyer; the **power switch now lives here** — turning on power requires a cellar run in emergency-red).

**UPPER layer** (`fy +4.5`) — **Projection Catwalk** (over Lab, drop-through hole) — **Mezzanine Bridge** (over Atrium) — **Balcony** ring (overlooks the 2-story Theater void, railed) — **Attic** (over Foyer; roof-hole moonlight shaft) — **Rooftop** (over Chapel, open sky; Part 4 adds a bridge off it).

**Vertical connections:** 5 stairs in different wings (Lab→Boiler↓, Lab→Catwalk↑, Foyer→Power↓, Morgue→ColdStorage↓, Theater→Balcony↑ grand) + a **debris ramp** (ruined-W→Balcony) + an **elevator-shaft ladder** (Chapel→Rooftop) + the one-way **drop-through** (Catwalk→Lab). No floor is reachable from only one point. Interactables + doors are now **floor-aware** (won't trigger through a ceiling/floor).

**Circulation loops** (verified 9 independent cycles in the door graph; spec asked ≥3):
- L1 north: Atrium→Lab→Depot→Courtyard→Atrium
- L2 nw: Atrium→Lab→Morgue→Theater→Atrium
- L3 south: Atrium→Foyer→Chapel→Courtyard→Atrium
- L4 back: Morgue→Undercroft→Depot (curved crawl)

## Systems in the build
Weapons (pistol + Galil/MP5/M16A1/SPAS-12, Pack-a-Punch), 7 perks (Jugg, Speed Cola, Deadshot, Double Tap, Mule Kick, Stamin-Up, PhD), mystery box (relocates over 8 spots), 2 teleporters (Lab↔Foyer), grenades, monkey bombs, power switch (map starts emergency-red), boss rounds, powerups (Max Ammo/Double Points/Nuke/Insta-Kill/Fire Sale), atmosphere (rain, lightning, dust, flicker, night skybox+moon, gramophones). Dev menu on backtick.

## Engine constraints (important for prompting)
- **Collision is axis-aligned box (AABB) + rectangular room tests.** Non-90°/curved geometry is done by **faceted** angled wall meshes with stepped AABB colliders behind them (e.g. the Undercroft arc). True oriented colliders would need an engine rewrite.
- Rooms are rectangles (`ROOMS[key]={x0,x1,z0,z1,fy,open}`); non-rectangular zones are composed from multiple rectangles.
- Verticality via `HZ_FLAT`/`HZ_RAMP` + `getFloorH`; floor separation ≈4.5, band tol ≈2.9.
- Nav grid auto-bakes bounds from `ROOMS`, ground-floor only so far.

## Known gaps / next
- A* ground-floor only; basement/upper zombies use direct-steer fallback (Part 3, next).
- Outdoors partial: skybox+moon only; no skyline/weather/bridge (Part 4).
- Placement not yet spatially audited; door-swing parking bug (Part 5).
- Rooms still sparse between landmarks; no per-room ambient audio/motion (Part 6).
- **Cosmetic:** stairwells descending into the basement don't yet cut a hole in the
  ground floor above them (the floor mesh occludes the top of the descent) — matches
  the original Lab stair behavior; a floor-hole pass is queued for polish.

## Verification method
Code-only on my side: syntax check (`new Function` on the inline script) + a live Electron **load probe** (temporary `main.js` hooks capturing console/errors + `executeJavaScript` structural asserts — room set, spawns-in-bounds, door graph loops/reachability, nav bake), always removed before shipping. **User playtests gameplay** and reports bugs by room name.
