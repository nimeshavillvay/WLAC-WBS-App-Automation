import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { easBuildDefaults } from "../config/eas-builds.mjs";
import { loadEnv } from "../config/load-env.mjs";
import { resolveEasArchiveUrl, resolveEasBuildId } from "../config/platform.mjs";

loadEnv();

const platform = (process.argv[2] ?? "ios").toLowerCase();

if (platform !== "ios" && platform !== "android") {
  throw new Error(`Unknown platform "${platform}". Use ios or android.`);
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildsDir = path.join(rootDir, "builds");
const lacMobileDir =
  process.env.LAC_MOBILE_DIR ?? path.resolve(rootDir, "../apps/lac-mobile");
const defaults = easBuildDefaults[platform];
const buildId = resolveEasBuildId(platform) ?? defaults.buildId;
const outputName = process.env.EAS_BUILD_OUTPUT ?? defaults.output;
const outputPath = path.join(buildsDir, outputName);
const installEnvKey =
  platform === "ios"
    ? "MOBILEWRIGHT_INSTALL_APPS_IOS"
    : "MOBILEWRIGHT_INSTALL_APPS_ANDROID";

function resolveArchiveUrl() {
  const directUrl = resolveEasArchiveUrl(platform);
  if (directUrl) {
    return directUrl;
  }

  if (!fs.existsSync(path.join(lacMobileDir, "app.config.ts"))) {
    throw new Error(
      `Set EAS_APPLICATION_ARCHIVE_URL_${platform.toUpperCase()} in .env, or point LAC_MOBILE_DIR at lac-mobile (tried ${lacMobileDir}).`,
    );
  }

  const json = execFileSync(
    "npx",
    ["eas-cli@latest", "build:view", buildId, "--json"],
    {
      cwd: lacMobileDir,
      encoding: "utf8",
      env: {
        ...process.env,
        EXPO_HOME: process.env.EXPO_HOME ?? "/tmp/expo-home",
        EXPO_NO_TELEMETRY: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  const build = JSON.parse(json);
  const url =
    build.artifacts?.applicationArchiveUrl ?? build.artifacts?.buildUrl;

  if (!url) {
    throw new Error(`Build ${buildId} has no downloadable artifact.`);
  }

  return url;
}

async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}): ${url}`);
  }

  fs.writeFileSync(destination, Buffer.from(await response.arrayBuffer()));
}

fs.mkdirSync(buildsDir, { recursive: true });

const archiveUrl = resolveArchiveUrl();
console.log(`Downloading ${platform} EAS build ${buildId} ...`);
console.log(`  → ${outputPath}`);

await download(archiveUrl, outputPath);

const sizeMb = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(1);
console.log(`Done (${sizeMb} MB).`);
console.log(`Set in .env: ${installEnvKey}=./builds/${outputName}`);
