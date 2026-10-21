// One-off helper (not part of the theme) to resolve File Manager URLs for
// files uploaded under a given folder path, using the HubSpot Files API.
// Reads the Personal Access Key from the local hs CLI config and never
// prints it.
const fs = require("fs");
const https = require("https");

const accountName = process.argv[2];
const folderPath = process.argv[3];
const outFile = process.argv[4];

const configRaw = fs.readFileSync("C:/Users/rbtde/.hscli/config.yml", "utf8");
const accountBlock = configRaw.split(/\n  - name: /).find((b) => b.startsWith(accountName));
if (!accountBlock) {
  console.error("Account not found:", accountName);
  process.exit(1);
}
// The CLI's serialized "personalAccessKey" isn't a bearer-ready API token;
// use the cached OAuth access token the CLI already exchanged it for.
const keyMatch = accountBlock.match(/accessToken:\s*>-\n\s+([^\n]+)/);
if (!keyMatch) {
  console.error("Access token not found for account:", accountName);
  process.exit(1);
}
const pak = keyMatch[1].trim();

function apiGet(path) {
  return new Promise((resolve, reject) => {
    https
      .get(
        {
          hostname: "api.hubapi.com",
          path,
          headers: { Authorization: "Bearer " + pak },
        },
        (res) => {
          let data = "";
          res.on("data", (c) => (data += c));
          res.on("end", () => {
            if (res.statusCode >= 400) return reject(new Error("HTTP " + res.statusCode + ": " + data));
            resolve(JSON.parse(data));
          });
        }
      )
      .on("error", reject);
  });
}

async function main() {
  const results = {};
  let after = null;
  do {
    const qs = new URLSearchParams({ limit: "100" });
    if (after) qs.set("after", after);
    const data = await apiGet(`/files/v3/files/search?${qs.toString()}`);
    for (const file of data.results || []) {
      if (file.path && file.path.startsWith("/" + folderPath)) {
        results[file.path] = file.url;
      }
    }
    after = data.paging && data.paging.next ? data.paging.next.after : null;
  } while (after);

  fs.writeFileSync(outFile, JSON.stringify(results, null, 2), "utf8");
  console.log("Wrote", Object.keys(results).length, "file URLs to", outFile);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
