import { expect } from "@mobilewright/test";
import type { Screen } from "@mobilewright/core";

export function getTestCredentials() {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error("Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env");
  }

  return { email, password };
}

export async function isGuest(screen: Screen) {
  return screen
    .getByTestId("sign-in-home-page-button")
    .isVisible()
    .catch(() => false);
}

export async function login(screen: Screen, email: string, password: string) {
  await expect(
    screen.getByText(/Sign in to your\s*WurthLAC account/),
  ).toBeVisible();

  await screen.getByPlaceholder("someone@example.com").fill(email);
  await tapContinue(screen);

  await expect(screen.getByPlaceholder("Password")).toBeVisible();
  await screen.getByPlaceholder("Password").fill(password);
  await tapContinue(screen);

  await expect(screen.getByTestId("sign-in-home-page-button")).not.toBeVisible({
    timeout: 30_000,
  });
}

async function tapContinue(screen: Screen) {
  const button = screen.getByRole("button", { name: "Continue" });

  if (await button.isVisible().catch(() => false)) {
    await button.tap();
    return;
  }

  await screen.getByText("Continue").tap();
}
