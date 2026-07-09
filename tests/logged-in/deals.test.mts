import { expect, test } from "@mobilewright/test";

import { ensureLoggedIn } from "../../helpers/app-state.mjs";
import { navigateToTab } from "../../helpers/navigation.mjs";

test.describe("deals", () => {
  test.beforeEach(async ({ screen }, testInfo) => {
    await ensureLoggedIn(screen, testInfo.project.name);
  });

  test("opens deals and shows product cards", async ({ screen }) => {
    await navigateToTab(screen, "Deals");

    await expect(screen.getByTestId("home-banners-list")).toBeVisible();
    await expect(screen.getByTestId("todays-special-product")).toBeVisible();
  });

  test("opens product details from deals list", async ({ screen }) => {
    await navigateToTab(screen, "Deals");
    await screen.getByTestId("todays-special-product").tap();

    await expect(screen.getByTestId("back-button")).toBeVisible();
    await expect(screen.getByTestId("share-product-button")).toBeVisible();
  });
});
