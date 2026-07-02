import fs from "node:fs";
import path from "node:path";

const buildsDir = path.resolve(process.cwd(), "builds");

function findBuild(extension) {
  if (!fs.existsSync(buildsDir)) {
    return undefined;
  }

  const match = fs
    .readdirSync(buildsDir)
    .filter((file) => file.endsWith(extension))
    .sort()
    .at(-1);

  return match ? path.join(buildsDir, match) : undefined;
}

/** @param {"ios" | "android"} platform */
export function resolveInstallApp(platform) {
  const platformEnv =
    platform === "ios"
      ? process.env.MOBILEWRIGHT_INSTALL_APPS_IOS
      : process.env.MOBILEWRIGHT_INSTALL_APPS_ANDROID;

  if (platformEnv) {
    return platformEnv;
  }

  if (platform === "ios") {
    return findBuild(".ipa");
  }

  return findBuild(".apk") ?? findBuild(".aab");
}
