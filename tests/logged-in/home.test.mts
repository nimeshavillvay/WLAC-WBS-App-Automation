import { expect, test } from "@mobilewright/test";

import { ensureLoggedIn } from "../../helpers/app-state.mjs";

test.describe("home screen", () => {
  test.beforeEach(async ({ screen }, testInfo) => {
    await ensureLoggedIn(screen, testInfo.project.name);
  });

  test("loads home page with key sections", async ({ screen }) => {
    await expect(screen.getByTestId("search-box")).toBeVisible();
    await expect(screen.getByTestId("recent-activities")).toBeVisible();
    await expect(screen.getByText("Top Categories")).toBeVisible();
    await expect(screen.getByText("View All")).toBeVisible();
  });

  test("opens categories from view all", async ({ screen }) => {
    await screen.getByText("View All").tap();

    await expect(screen.getByText("All Categories")).toBeVisible();
    await expect(screen.getByTestId("back-button")).toBeVisible();
  });
});
