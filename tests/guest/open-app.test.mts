import { expect, test } from "@mobilewright/test";

import { isGuest } from "../../helpers/auth.mjs";
import { getActiveBundleId } from "../../helpers/device.mjs";
import { prepareApp } from "../../helpers/app-state.mjs";

test.describe("open app", () => {
  test("launches on a real device", async ({ device, screen, bundleId }, testInfo) => {
    if (!bundleId) {
      throw new Error("bundleId is required — check APP_ENV in .env");
    }

    await prepareApp(screen, testInfo.project.name);

    expect(await getActiveBundleId(device)).toBe(bundleId);
    if (await isGuest(screen)) {
      await expect(screen.getByTestId("sign-in-home-page-button")).toBeVisible();
    } else {
      await expect(screen.getByText("Top Categories")).toBeVisible();
    }
  });
});
