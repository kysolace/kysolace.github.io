# kysolace SoundCloud → GitHub Pages mirror

This package makes `music.html` automatically mirror the public tracks on:

https://soundcloud.com/kysolace

The browser never receives your SoundCloud Client Secret. GitHub Actions uses the secret to fetch public SoundCloud metadata and writes the safe, public metadata to `soundcloud-tracks.json`. The page then reads that JSON.

## Files

- `music.html` — your music page
- `audio-style.css` — the music page styling
- `soundcloud-tracks.json` — generated track metadata
- `scripts/update-soundcloud.mjs` — SoundCloud sync script
- `.github/workflows/update-soundcloud.yml` — automatic GitHub Action

## 1. Create a SoundCloud API app

SoundCloud currently requires a registered application for API access. Create an app and obtain:

- Client ID
- Client Secret

Do not put the Client Secret in `music.html`, JavaScript, or any public repository file.

## 2. Add the two GitHub Actions secrets

In your GitHub repository go to:

Settings → Secrets and variables → Actions → New repository secret

Create these two repository secrets:

### SOUNDCLOUD_CLIENT_ID

```text
PASTE
```

Paste your SoundCloud Client ID as the value.

### SOUNDCLOUD_CLIENT_SECRET

```text
PASTE
```

Paste your SoundCloud Client Secret as the value.

The word `PASTE` is only a placeholder for this setup guide. Do NOT put the secret values in this file or commit them to Git.

## 3. Upload the package to your repository

Copy these files/folders into the root of the repository:

```text
music.html
 audio-style.css
 soundcloud-tracks.json
 scripts/update-soundcloud.mjs
 .github/workflows/update-soundcloud.yml
```

If you already have `music.html` and `audio-style.css`, replace those with the versions in this package.

## 4. Run the sync manually

After pushing the files:

1. Open the repository on GitHub.
2. Click **Actions**.
3. Select **Update SoundCloud Mirror**.
4. Click **Run workflow**.
5. Wait for the green checkmark.

The Action should update `soundcloud-tracks.json` with the public tracks on the `kysolace` SoundCloud profile.

## 5. Automatic updates

The workflow checks twice per hour at minute 17 and 47. GitHub schedules use UTC and can occasionally be delayed during periods of high load.

After you upload a new public SoundCloud track, the next successful sync will add it to `soundcloud-tracks.json`. GitHub Pages will then serve the updated file.

## Important limitations

- This mirrors public SoundCloud tracks only.
- Private or blocked tracks are not added.
- The website still uses the SoundCloud Widget API for playback.
- The GitHub Action needs the SoundCloud API credentials, but visitors to your website never need them.
- `soundcloud-tracks.json` is public because it contains public track metadata.

## If the Action fails

Open:

Actions → Update SoundCloud Mirror → failed run → Sync SoundCloud tracks

The most common cause is that one or both repository secrets are missing or incorrect.
