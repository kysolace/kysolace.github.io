const fs = require("fs");
const path = require("path");

const publicKey = process.env.UPLOADCARE_PUBLIC_KEY;
const secretKey = process.env.UPLOADCARE_SECRET_KEY;

if (!publicKey || !secretKey) {
  throw new Error(
    "Missing UPLOADCARE_PUBLIC_KEY or UPLOADCARE_SECRET_KEY"
  );
}

const API_URL =
  "https://api.uploadcare.com/files/?stored=true&limit=1000&ordering=-datetime_uploaded";

const headers = {
  Accept: "application/vnd.uploadcare.v0.7+json",
  Authorization: `Uploadcare.Simple ${publicKey}:${secretKey}`,
};

async function getAllFiles() {
  const files = [];
  let nextUrl = API_URL;

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      headers,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Uploadcare API error ${response.status}: ${body}`
      );
    }

    const data = await response.json();

    files.push(...(data.results || []));
    nextUrl = data.next || null;
  }

  return files;
}

async function main() {
  const files = await getAllFiles();

  const photos = files
    .filter(file => {
      return (
        file.is_image === true &&
        file.is_ready === true &&
        file.original_file_url
      );
    })
    .map(file => ({
      id: file.uuid,
      filename: file.original_filename,
      image: file.original_file_url,
      alt: "",
      uploadedAt: file.datetime_uploaded,
    }));

  const outputPath = path.join(
    process.cwd(),
    "archive-photos.json"
  );

  fs.writeFileSync(
    outputPath,
    JSON.stringify(photos, null, 2) + "\n",
    "utf8"
  );

  console.log(`Synced ${photos.length} archive photos.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
