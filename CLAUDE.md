# CLAUDE.md — Zombie Survival (Electron)

## What this project is
A round-based zombie survival FPS in `index.html` (~3,500 lines), Three.js r128
loaded from `./vendor/three.min.js`, post-processing addons in `./vendor/pp`
(EffectComposer + UnrealBloomPass). Packaged as a Windows Electron app via
electron-builder, auto-updated through GitHub Releases (electron-updater).
Releases are built by GitHub Actions on version tags (v1.0.x).

## Non-negotiable constraints
1. **Gameplay must keep working after every change**: rounds, points, doors,
   perks, mystery box, pack-a-punch, teleporters, grenades, monkey bombs,
   boss rounds, dev mode (backtick menu). Test before considering a task done.
2. **Never regress the performance guards** — extend these patterns instead:
   - `RENDER_MAXPX` renderer resolution cap
   - `shadowMap.autoUpdate=false` + manual `needsUpdate` re-bakes
   - pooled bullet tracers (`_tracers`), particle hard caps (`PARTICLES`)
   - `_gunMeshCache` (never rebuild gun meshes per switch)
   - `_geoCache` (cache geometry by dimensions)
   - small `WORLD_HIT` raycast set (never raycast the whole scene)
3. **Fully offline at runtime.** Every asset is a local file. No CDN calls.
4. **Packaging:** any new folder (assets/, models/, textures/, src/) MUST be
   added to the `files` array in package.json, or the shipped .exe breaks.
   If a change affects electron-builder or auto-update, flag it BEFORE doing it.
5. **Performance budget:** 60fps on a mid-range laptop GPU at 1080p on High.
   Graphics settings menu must let Low-end machines play (shadows/SSAO/bloom
   toggles). Show FPS via the dev menu.
6. **Art direction:** grim WWII-era occult horror. Original work only —
   inspired by the *feel* of classic round-based zombies maps, but never copy
   Call of Duty assets, names, logos, or map layouts. Never include real-world
   hate insignia (no swastikas/SS runes) — era silhouettes only (Stahlhelm
   shapes, field-gray uniforms, sandbags).

## Permitted big moves (do them properly or not at all)
- Splitting index.html into modules with a Vite build is allowed IF the built
  output still runs offline in Electron and packaging/CI are updated in the
  same task.
- Upgrading Three.js beyond r128 is allowed IF all code and the pp addons are
  migrated and verified in the same task.

## Asset sourcing (CC0 only, commit files to repo)
- PBR texture sets: ambientCG, Poly Haven (1K is enough; albedo+normal+roughness)
- HDRI environment: Poly Haven (night)
- Models/props/characters: Quaternius, Kenney.nl, Poly Haven models
- Never hotlink; download into /assets and load locally.

## Workflow expectations
- Work in phases; after each phase: run it, fix errors, verify 60fps, then stop
  and summarize what changed before starting the next phase.
- Prefer instancing (InstancedMesh) for repeated props; LODs for heavy models.
- When adding lights, prefer few strong lights + emissive materials + bloom
  over many point lights (forward-rendering cost).
