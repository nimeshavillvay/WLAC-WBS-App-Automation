import { expect, test } from "@mobilewright/test";

import { getActiveBundleId } from "../../helpers/device.mjs";
import { ensureLoggedIn, prepareApp } from "../../helpers/app-state.mjs";
import { navigateToTab, openDrawer } from "../../helpers/navigation.mjs";

test.describe.configure({ mode: "serial" });

test.describe("navigation", () => {
  test.beforeEach(async ({ screen }, testInfo) => {
    await ensureLoggedIn(screen, testInfo.project.name);
  });

  test("bottom tabs are clickable and open correct screens", async ({ screen }) => {
    await navigateToTab(screen, "Home");
    await expect(screen.getByText("Top Categories")).toBeVisible();

    await navigateToTab(screen, "Deals");
    await expect(screen.getByLabel("Deals")).toBeVisible();
    await expect(screen.getByTestId("home-banners-list")).toBeVisible();

    await navigateToTab(screen, "Support");
    await expect(screen.getByText("Customer Service and Support")).toBeVisible();

    await navigateToTab(screen, "Cart");
    await expect(screen.getByText(/^Shopping Cart/)).toBeVisible();
  });

  test("side drawer opens, navigates, and closes via back flow", async ({ screen }) => {
    await navigateToTab(screen, "Home");
    await openDrawer(screen);

    await expect(screen.getByText("My Account")).toBeVisible();
    await expect(screen.getByText("Get Help")).toBeVisible();
    await expect(screen.getByText("Products")).toBeVisible();

    await screen.getByText("Order History").tap();
    await expect(screen.getByTestId("back-button")).toBeVisible();
    await screen.getByTestId("back-button").tap();

    await expect(screen.getByText("Top Categories")).toBeVisible();
  });
});

test.describe("app launch", () => {
  test("launches target bundle", async ({ device, screen, bundleId }, testInfo) => {
    if (!bundleId) {
      throw new Error("bundleId is required — check APP_ENV in .env");
    }

    await prepareApp(screen, testInfo.project.name);

    expect(await getActiveBundleId(device)).toBe(bundleId);
    await expect(screen.getByText("Top Categories")).toBeVisible();
  });
});
