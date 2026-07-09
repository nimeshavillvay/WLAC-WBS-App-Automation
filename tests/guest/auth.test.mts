import { expect, test } from "@mobilewright/test";

import { getTestCredentials, isGuest, login } from "../../helpers/auth.mjs";
import { prepareApp } from "../../helpers/app-state.mjs";

test.describe("login", () => {
  test("logs in with configured account", async ({ screen }, testInfo) => {
    await prepareApp(screen, testInfo.project.name);

    if (!(await isGuest(screen))) {
      await expect(screen.getByTestId("recent-activities")).toBeVisible();
      return;
    }

    const { email, password } = getTestCredentials();
    await screen.getByTestId("sign-in-home-page-button").tap();
    await login(screen, email, password);

    // "Top Categories" shows for guests too, so verify auth-specific markers:
    await expect(
      screen.getByTestId("sign-in-home-page-button"),
    ).not.toBeVisible();
    await expect(screen.getByTestId("recent-activities")).toBeVisible();
  });
});
