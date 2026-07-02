import { expect, test } from "@mobilewright/test";

import { getTestCredentials, isGuest, login } from "../helpers/auth.mjs";
import { getActiveBundleId } from "../helpers/device.mjs";
import { navigateToTab, openDrawer } from "../helpers/navigation.mjs";
import { acceptAndroidCameraPermission } from "../helpers/permissions.mjs";

test.describe.configure({ mode: "serial" });

test.describe("authenticated app flow", () => {
  test("opens the app and accepts camera permission on Android", async ({
    device,
    screen,
    bundleId,
  }, testInfo) => {
    if (!bundleId) {
      throw new Error("bundleId is required — check APP_ENV in .env");
    }

    if (testInfo.project.name === "android") {
      await acceptAndroidCameraPermission(screen);
    }

    expect(await getActiveBundleId(device)).toBe(bundleId);

    const guest = await isGuest(screen);

    if (guest) {
      await expect(screen.getByTestId("sign-in-home-page-button")).toBeVisible();
      return;
    }

    await expect(screen.getByText("Top Categories")).toBeVisible();
  });

  test("signs in from the home screen", async ({ screen }) => {
    if (!(await isGuest(screen))) {
      await expect(screen.getByText("Top Categories")).toBeVisible();
      return;
    }

    const { email, password } = getTestCredentials();

    await screen.getByTestId("sign-in-home-page-button").tap();
    await login(screen, email, password);

    await expect(screen.getByText("Top Categories")).toBeVisible();
  });

  test("verifies bottom navigation and side drawer", async ({ screen }) => {
    test.setTimeout(90_000);

    await test.step("bottom navigation", async () => {
      await expect(screen.getByText("Top Categories")).toBeVisible();

      await navigateToTab(screen, "Deals");
      await expect(screen.getByLabel("Deals")).toBeVisible();

      await navigateToTab(screen, "Support");
      await expect(
        screen.getByText("Customer Service and Support"),
      ).toBeVisible();

      await navigateToTab(screen, "Home");
      await navigateToTab(screen, "Cart");
      await expect(screen.getByText("Cart", { exact: true })).toBeVisible();
    });

    await test.step("side drawer navigation", async () => {
      await navigateToTab(screen, "Home");
      await openDrawer(screen);

      await expect(screen.getByText(/^Hi .+!$/)).toBeVisible();
      await expect(screen.getByText("My Account")).toBeVisible();
      await expect(screen.getByText("Get Help")).toBeVisible();
      await expect(screen.getByText("Products")).toBeVisible();
      await expect(screen.getByText("Order History")).toBeVisible();
      await expect(screen.getByText("Shopping Lists")).toBeVisible();
      await expect(screen.getByText("My Sales Rep")).toBeVisible();
      await expect(screen.getByText("FAQs")).toBeVisible();
      await expect(screen.getByText("Log Out")).toBeVisible();
    });
  });
});
