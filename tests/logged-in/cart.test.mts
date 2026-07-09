import { expect, test } from "@mobilewright/test";

import { ensureLoggedIn } from "../../helpers/app-state.mjs";
import { navigateToTab } from "../../helpers/navigation.mjs";

test.describe("shopping cart", () => {
  test.beforeEach(async ({ screen }, testInfo) => {
    await ensureLoggedIn(screen, testInfo.project.name);
  });

  test("opens cart tab", async ({ screen }) => {
    await navigateToTab(screen, "Cart");

    await expect(screen.getByText(/^Shopping Cart/)).toBeVisible();
  });

  test("navigates to deals tab from cart", async ({ screen }) => {
    await navigateToTab(screen, "Cart");
    await navigateToTab(screen, "Deals");

    await expect(screen.getByLabel("Deals")).toBeVisible();
  });
});
