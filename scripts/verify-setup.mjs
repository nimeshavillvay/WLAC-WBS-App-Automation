import fs from "node:fs";
import path from "node:path";

import { resolveInstallApp } from "../config/build-artifacts.mjs";
import { easBuildDefaults } from "../config/eas-builds.mjs";
import { loadEnv } from "../config/load-env.mjs";
import { resolveBundleId, resolveEnvironment } from "../config/environments.mjs";
import { resolveDeviceId, resolveEasBuildId } from "../config/platform.mjs";

loadEnv();

const { key, label } = resolveEnvironment();
const bundleId = resolveBundleId();

const checks = [
  ["APP_ENV", `${key} (${label})`],
  ["Bundle ID", bundleId],
  ["iOS build", resolveInstallApp("ios") ?? "not set"],
  ["Android build", resolveInstallApp("android") ?? "not set"],
  ["iOS device", resolveDeviceId("ios") ?? "not set"],
  ["Android device", resolveDeviceId("android") ?? "not set"],
  [
    "EAS iOS build",
    resolveEasBuildId("ios") ?? easBuildDefaults.ios.buildId,
  ],
  [
    "EAS Android build",
    resolveEasBuildId("android") ?? easBuildDefaults.android.buildId,
  ],
  [
    "iOS agent profile",
    process.env.MOBILEWRIGHT_IOS_PROVISIONING_PROFILE ?? "not set",
  ],
];

console.log("LAC Mobile QE — setup check\n");

for (const [name, value] of checks) {
  console.log(`  ${name.padEnd(18)} ${value}`);
}

const buildsDir = path.resolve("builds");
if (!fs.existsSync(buildsDir)) {
  fs.mkdirSync(buildsDir, { recursive: true });
}

console.log(`
Workflow:
  npm run download:build:ios && npm run install:app:ios && npm run install:agent:ios
  npm run download:build:android && npm run install:app:android && npm run install:agent:android
  npm run test:ios | npm run test:android
`);
