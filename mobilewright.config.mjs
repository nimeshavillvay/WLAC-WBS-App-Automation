import { defineConfig } from "mobilewright";

import { resolveInstallApp } from "./config/build-artifacts.mjs";
import { loadEnv } from "./config/load-env.mjs";
import { resolveBundleId, resolveEnvironment } from "./config/environments.mjs";

loadEnv();

const { key: appEnv, label: appEnvLabel } = resolveEnvironment();
const bundleId = resolveBundleId();
const isCi = !!process.env.CI;

const iosInstallApp = resolveInstallApp("ios");
const androidInstallApp = resolveInstallApp("android");

export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/*.{test,spec}.{js,ts,mjs,mts}"],
  timeout: 60_000,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: 1,
  reporter: isCi ? [["list"], ["html", { open: "never" }]] : "list",
  expect: {
    timeout: 15_000,
  },
  use: {
    animations: "off",
    viewTree: "on-failure",
    actionTimeout: 15_000,
    appLaunchTimeout: 60_000,
    installTimeout: 300_000,
  },
  metadata: {
    appEnv,
    appEnvLabel,
    bundleId,
  },
  projects: [
    {
      name: "ios",
      use: {
        platform: "ios",
        bundleId,
        ...(iosInstallApp ? { installApps: iosInstallApp } : {}),
      },
    },
    {
      name: "android",
      use: {
        platform: "android",
        bundleId,
        ...(androidInstallApp ? { installApps: androidInstallApp } : {}),
      },
    },
  ],
});
