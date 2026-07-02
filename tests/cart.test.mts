import { expect, test } from "@mobilewright/test";

import { navigateToTab } from "../helpers/navigation.mjs";

test.describe("shopping cart", () => {
  test("shows empty cart state for guest users", async ({ screen }) => {
    await navigateToTab(screen, "Cart");

    await expect(screen.getByText(/^Shopping Cart/)).toBeVisible();
    await expect(screen.getByText("Your cart is empty.")).toBeVisible();
    await expect(
      screen.getByRole("button", { name: "Go to Deals" }),
    ).toBeVisible();
  });

  test("navigates to deals from empty cart", async ({ screen }) => {
    await navigateToTab(screen, "Cart");
    await screen.getByRole("button", { name: "Go to Deals" }).tap();

    await expect(screen.getByRole("tab", { name: "Deals" })).toBeVisible();
  });
});
