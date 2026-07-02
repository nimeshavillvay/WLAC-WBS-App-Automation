import { expect, test } from "@mobilewright/test";

import { navigateToHome } from "../helpers/navigation.mjs";

test.describe("home screen", () => {
  test.beforeEach(async ({ screen }) => {
    await navigateToHome(screen);
  });

  test("shows top categories section", async ({ screen }) => {
    await expect(screen.getByText("Top Categories")).toBeVisible();
    await expect(screen.getByText("View All")).toBeVisible();
  });

  test("navigates to all categories from view all link", async ({ screen }) => {
    await screen.getByText("View All").tap();

    await expect(screen.getByTestId("back-button")).toBeVisible();
  });
});
