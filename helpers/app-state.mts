import type { Screen } from "@mobilewright/core";

import { expect } from "@mobilewright/test";

import { getTestCredentials, isGuest, login } from "./auth.mjs";
import { navigateToHome } from "./navigation.mjs";
import { acceptAndroidCameraPermission } from "./permissions.mjs";

export async function prepareApp(screen: Screen, projectName: string) {
  if (projectName === "android") {
    await acceptAndroidCameraPermission(screen);
  }
}

export async function ensureLoggedIn(screen: Screen, projectName: string) {
  await prepareApp(screen, projectName);

  if (await isGuest(screen)) {
    const { email, password } = getTestCredentials();
    await screen.getByTestId("sign-in-home-page-button").tap();
    await login(screen, email, password);
  }

  await navigateToHome(screen);
  // "Top Categories" is visible to guests too; assert the authenticated-only
  // home section instead to confirm we are actually logged in.
  await expect(screen.getByTestId("recent-activities")).toBeVisible();
}
