import { writeFile } from "node:fs/promises";

const PROFILE_URL = "https://soundcloud.com/kysolace";
const OUTPUT_FILE = "soundcloud-tracks.json";
const API_BASE = "https://api.soundcloud.com";
const TOKEN_URL = "https://secure.soundcloud.com/oauth/token";

const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
const clientSecret = process.env.SOUNDCLOUD_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error(
    "Missing SOUNDCLOUD_CLIENT_ID or SOUNDCLOUD_CLIENT_SECRET. Add both as GitHub Actions repository secrets."
  );
}

function basicAuth(clientId, clientSecret) {
  return Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
}

async function getClientCredentialsToken() {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json; charset=utf-8",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth(clientId, clientSecret)}`,
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`SoundCloud token request failed (${response.status}): ${JSON.stringify(data)}`);
  }

  if (!data.access_token) {
    throw new Error("SoundCloud token response did not contain an access_token.");
  }

  return data.access_token;
}

async function apiGet(pathOrUrl, token) {
  const url = pathOrUrl.startsWith("http")
    ? pathOrUrl
    : `${API_BASE}${pathOrUrl}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json; charset=utf-8",
      Authorization: `OAuth ${token}`,
    },
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`SoundCloud API request failed (${response.status}) at ${url}: ${JSON.stringify(data)}`);
  }

  return data;
}

async function resolveProfile(token) {
  const url = `${API_BASE}/resolve?url=${encodeURIComponent(PROFILE_URL)}`;
  const user = await apiGet(url, token);

  if (!user || !user.id) {
    throw new Error("Could not resolve the kysolace SoundCloud profile.");
  }

  return user;
}

async function getAllTracks(user, token) {
  const userId = user.id;
  let nextUrl = `${API_BASE}/users/${encodeURIComponent(userId)}/tracks?linked_partitioning=true&limit=200`;
  const allTracks = [];

  while (nextUrl) {
    const page = await apiGet(nextUrl, token);
    const collection = Array.isArray(page) ? page : page.collection || [];
    allTracks.push(...collection);
    nextUrl = page.next_href || null;
  }

  return allTracks;
}

function normalizeTrack(track) {
  return {
    id: track.id ?? null,
    urn: track.urn ?? null,
    title: track.title || "Untitled",
    permalink_url: track.permalink_url || null,
    artwork_url: track.artwork_url || track.user?.avatar_url || null,
    duration: Number(track.duration) || 0,
    created_at: track.created_at || null,
    release_date: track.release_date || null,
    description: track.description || null,
    access: track.access || null,
    genre: track.genre || null,
  };
}

const token = await getClientCredentialsToken();
const user = await resolveProfile(token);
const rawTracks = await getAllTracks(user, token);

const tracks = rawTracks
  .filter((track) => track && track.permalink_url && track.access !== "blocked")
  .map(normalizeTrack);

const output = {
  profile: PROFILE_URL,
  user: {
    id: user.id ?? null,
    urn: user.urn ?? null,
    username: user.username ?? "kysolace",
    permalink_url: user.permalink_url ?? PROFILE_URL,
  },
  updated_at: new Date().toISOString(),
  tracks,
};

await writeFile(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`, "utf8");

console.log(`Synced ${tracks.length} public SoundCloud tracks for ${user.username || "kysolace"}.`);
