# Zombie Survival — Desktop (Electron) with GitHub auto-update

Your game as a standalone Windows app that checks GitHub for updates on launch and
prompts players to update. Three.js is bundled locally so it runs offline.

## Project layout
```
ZombieSurvival/
  main.js        Electron main process + auto-update logic
  index.html     The game (recoil + boss-bar fixes applied)
  vendor/three.min.js   Bundled Three.js r128
  package.json   Dependencies + build/publish config
```

## First-time setup (Windows, Node.js 18+)
```
npm install
```

## Run in dev
```
npm start
```
(Auto-update is skipped in dev mode.)

---

## Setting up GitHub auto-update — do this ONCE

1. Create a GitHub repo named `zombie-survival` (public is simplest — a public repo
   needs no token embedded in the app).
2. In `package.json`, under `build.publish`, replace `YOUR_GITHUB_USERNAME` with your
   actual GitHub username.
3. Create a GitHub Personal Access Token so your PC can upload releases:
   GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   → Generate new token → tick the `repo` scope → copy it.
4. Push this project to the repo.

## Shipping a new version — do this EVERY update

1. Make your changes to `index.html` (or anything else).
2. **Bump the version** in `package.json` (e.g. `1.0.0` → `1.0.1`). This is what tells
   players' apps a newer build exists — it MUST go up every release.
3. Set your token in the terminal, then publish:

   PowerShell:
   ```
   $env:GH_TOKEN="your_token_here"
   npm run publish
   ```
   Command Prompt:
   ```
   set GH_TOKEN=your_token_here
   npm run publish
   ```

   This builds the installer and uploads it to a new GitHub Release, along with a
   `latest.yml` file — that's the manifest the app reads to detect updates.

4. On GitHub, the release may be created as a **draft**. Open it and click **Publish
   release** so your friends' apps can see it.

That's it. Next time a friend opens the game, it sees the higher version, prompts
"Update available → Download", then "Restart now to install."

## First install for friends
Send them the `Zombie Survival Setup X.X.X.exe` from your first release (link from
Google Drive / the GitHub release page). From then on, updates are automatic.

Note: the app isn't code-signed, so Windows SmartScreen shows a blue warning on first
run — they click **More info → Run anyway**. This does not affect auto-updates.

## What changed vs the original game
- Boss health bar now works (was stuck in `handlePerk()`; now runs every frame).
- Recoil kicks upward (gun model was rotating down); strength cut ~half.
