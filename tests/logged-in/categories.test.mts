import { expect, test } from "@mobilewright/test";

import { ensureLoggedIn } from "../../helpers/app-state.mjs";
import { navigateToHome } from "../../helpers/navigation.mjs";

test.describe("categories", () => {
  test.beforeEach(async ({ screen }, testInfo) => {
    await ensureLoggedIn(screen, testInfo.project.name);
  });

  test("opens categories from home and shows category list", async ({ screen }) => {
    await navigateToHome(screen);
    await screen.getByText("View All").tap();

    await expect(screen.getByText("All Categories")).toBeVisible();
    await expect(screen.getByTestId("category-list-item")).toBeVisible();
  });

  test("opens category and verifies product listing/back navigation", async ({
    screen,
  }) => {
    await navigateToHome(screen);
    await screen.getByText("View All").tap();
    await screen.getByTestId("category-list-item").tap();

    const hasSubCategories = await screen
      .getByTestId("sub-category-list-item")
      .isVisible()
      .catch(() => false);

    if (hasSubCategories) {
      await screen.getByTestId("sub-category-list-item").tap();
    }

    await expect(screen.getByTestId("category-products-list")).toBeVisible();
    await expect(screen.getByTestId("back-button")).toBeVisible();
    await screen.getByTestId("back-button").tap();
    await expect(screen.getByText("All Categories")).toBeVisible();
  });
});
