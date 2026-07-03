# Simple Guide — Get your game online with auto-updates

You will NOT install anything or use a terminal. GitHub builds the app for you.

--------------------------------------------------
## PART A — One-time setup (about 10 minutes)
--------------------------------------------------

### Step 1. Make a GitHub account
Go to github.com and sign up (free). Skip if you already have one.

### Step 2. Create the project
- Click the + in the top-right → "New repository".
- Repository name: zombie-survival
- Choose "Public".
- Click "Create repository".

### Step 3. Upload the game files
- On the new repo page, click "uploading an existing file".
- Unzip ZombieSurvival.zip on your computer, open the folder, select EVERYTHING
  inside it, and drag it all into the browser.
- Wait for the files to finish uploading, then click "Commit changes".

  (If a folder named ".github" did not upload, do this: click "Add file" →
  "Create new file". In the name box type exactly:
      .github/workflows/build.yml
  then paste in the contents of that same file from the zip, and Commit.)

### Step 4. Put your username in one file
- In the repo, click the file "package.json".
- Click the pencil icon (top-right) to edit.
- Find the line:  "owner": "YOUR_GITHUB_USERNAME",
- Replace YOUR_GITHUB_USERNAME with your real GitHub username (keep the quotes).
- Click "Commit changes".

Setup is done. You never do Part A again.

--------------------------------------------------
## PART B — Release the game (do this now, and for every update)
--------------------------------------------------

### Step 5. Create a release
- On the repo page, click "Releases" (right side) → "Create a new release".
- Click "Choose a tag", type:  v1.0.0  and click "Create new tag".
- Title: whatever you want (e.g. "First version").
- Click "Publish release".

### Step 6. Wait for GitHub to build it
- Click the "Actions" tab at the top. You'll see a job running (yellow dot).
- Wait ~3-5 minutes until it turns into a green check.

### Step 7. Get your app
- Go back to "Releases" and open your release.
- Under "Assets" you'll now see:  Zombie Survival Setup 1.0.0.exe
- That's your game. Download it, and send that link to your friends.

--------------------------------------------------
## Sending a NEW version later
--------------------------------------------------
1. Edit the game: in the repo click "index.html" → pencil → make changes → Commit.
   (Or re-upload a new index.html.)
2. Repeat Step 5, but use a HIGHER number each time: v1.0.1, then v1.0.2, etc.
   ** The number MUST go up or friends won't be prompted. **
3. GitHub rebuilds automatically. Next time a friend opens the game, they get
   "Update available → Download", then "Restart now". Done.

--------------------------------------------------
## Notes for your friends
--------------------------------------------------
- First time they run the .exe, Windows shows a blue warning ("Windows protected
  your PC"). They click "More info" → "Run anyway". Normal for indie games.
- After the first install, updates are automatic — they never re-download by hand.
