import { expect, test } from "@mobilewright/test";

import { acceptAndroidCameraPermission } from "../helpers/permissions.mjs";

test.describe("guest sign-in flow", () => {
  test.beforeEach(async ({ screen }, testInfo) => {
    if (testInfo.project.name === "android") {
      await acceptAndroidCameraPermission(screen);
    }
  });

  test("shows sign-in prompt on home for guest users", async ({ screen }) => {
    await expect(
      screen.getByText(/Sign in to see your pricing, past purchases/),
    ).toBeVisible();
    await expect(screen.getByTestId("sign-in-home-page-button")).toBeVisible();
  });

  test("opens login screen from home sign-in button", async ({ screen }) => {
    await screen.getByTestId("sign-in-home-page-button").tap();

    await expect(
      screen.getByText(/Sign in to your\s*WurthLAC account/),
    ).toBeVisible();
    await expect(screen.getByPlaceholder("someone@example.com")).toBeVisible();
    await expect(screen.getByRole("button", { name: "Continue" })).toBeVisible();
  });
});
