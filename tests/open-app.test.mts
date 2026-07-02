import { expect, test } from "@mobilewright/test";

import { getActiveBundleId } from "../helpers/device.mjs";
import { acceptAndroidCameraPermission } from "../helpers/permissions.mjs";

test.describe("open app", () => {
  test("launches on a real device", async ({ device, screen, bundleId }, testInfo) => {
    if (!bundleId) {
      throw new Error("bundleId is required — check APP_ENV in .env");
    }

    if (testInfo.project.name === "android") {
      await acceptAndroidCameraPermission(screen);
    }

    expect(await getActiveBundleId(device)).toBe(bundleId);
    await expect(screen.getByTestId("sign-in-home-page-button")).toBeVisible();
  });
});
