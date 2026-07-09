import { expect, test } from "@mobilewright/test";
import type { Locator, Screen } from "@mobilewright/core";

import { getTestCredentials, isGuest, login, logout } from "../../helpers/auth.mjs";
import { prepareApp } from "../../helpers/app-state.mjs";
import { navigateToHome, navigateToTab, openDrawer } from "../../helpers/navigation.mjs";

async function expectVisibleWithRetry(getLocator: () => Locator, attempts = 3) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await expect(getLocator()).toBeVisible({ timeout: 10_000 });
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function expectHomeLoaded(screen: Screen) {
  const markers = [
    screen.getByLabel("Home"),
    screen.getByText("Top Categories"),
    screen.getByText("View All"),
    screen.getByTestId("recent-activities"),
  ];

  for (const marker of markers) {
    try {
      await marker.waitFor({ state: "visible", timeout: 10_000 });
      return;
    } catch {
      // Try next known home marker.
    }
  }

  throw new Error("Home page did not load expected markers");
}

async function goToHomeRoot(screen: Screen) {
  const quickHomeMarkers = [
    screen.getByText("Top Categories"),
    screen.getByText("View All"),
    screen.getByTestId("recent-activities"),
  ];

  for (const marker of quickHomeMarkers) {
    if (await marker.isVisible().catch(() => false)) {
      return;
    }
  }

  for (let attempt = 0; attempt < 6; attempt += 1) {
    for (const marker of quickHomeMarkers) {
      if (await marker.isVisible().catch(() => false)) {
        return;
      }
    }

    const homeTabVisible = await screen
      .getByRole("tab", { name: "Home" })
      .isVisible()
      .catch(() => false);

    if (homeTabVisible) {
      await navigateToHome(screen);
      await expectHomeLoaded(screen);
      return;
    }

    const hasBackButton = await screen
      .getByTestId("back-button")
      .isVisible()
      .catch(() => false);

    if (hasBackButton) {
      await screen.getByTestId("back-button").tap();
      continue;
    }
  }

  throw new Error("Could not navigate to Home root");
}

test.describe("end-to-end user journey", () => {
  test("runs uninterrupted user flow from login to logout", async ({
    screen,
  }, testInfo) => {
    test.setTimeout(180_000);
    const { email, password } = getTestCredentials();

    await test.step("launch app and handle runtime permissions", async () => {
      await prepareApp(screen, testInfo.project.name);
      await expectHomeLoaded(screen);
    });

    await test.step("login", async () => {
      if (await isGuest(screen)) {
        await screen.getByTestId("sign-in-home-page-button").tap();
        await login(screen, email, password);
      }

      // "Top Categories" renders for guests too; confirm authenticated state.
      await expect(
        screen.getByTestId("sign-in-home-page-button"),
      ).not.toBeVisible();
      await expect(screen.getByTestId("recent-activities")).toBeVisible();
    });

    await test.step("home page verification", async () => {
      await goToHomeRoot(screen);
    });

    await test.step("bottom navigation verification", async () => {
      await goToHomeRoot(screen);
      await navigateToTab(screen, "Deals");
      await expectVisibleWithRetry(() => screen.getByTestId("home-banners-list"));
      await expectVisibleWithRetry(() =>
        screen.getByTestId("todays-special-product"),
      );

      await navigateToTab(screen, "Support");
      await expectVisibleWithRetry(() =>
        screen.getByText("Customer Service and Support"),
      );

      await navigateToTab(screen, "Home");
      await expectHomeLoaded(screen);
      await navigateToTab(screen, "Cart");
      await expect(screen.getByText(/^Shopping Cart/)).toBeVisible();

      await navigateToTab(screen, "Home");
      await expectHomeLoaded(screen);
    });

    await test.step("side navigation verification", async () => {
      await navigateToTab(screen, "Home");
      await expectHomeLoaded(screen);
      await openDrawer(screen);
      await expect(screen.getByText("My Account")).toBeVisible();
      await expect(screen.getByText("Get Help")).toBeVisible();
      await expect(screen.getByText("Products")).toBeVisible();

      await screen.getByText("Order History").tap();
      await expect(screen.getByTestId("back-button")).toBeVisible();
      await screen.getByTestId("back-button").tap();
      await expectHomeLoaded(screen);
    });

    await test.step("deals verification", async () => {
      await navigateToTab(screen, "Deals");
      await expectVisibleWithRetry(() =>
        screen.getByTestId("todays-special-product"),
      );
      await screen.getByTestId("todays-special-product").tap();
      await expect(screen.getByTestId("share-product-button")).toBeVisible();
      await screen.getByTestId("back-button").tap();
      await expectVisibleWithRetry(() => screen.getByTestId("home-banners-list"));
    });

    await test.step("categories verification", async () => {
      await navigateToTab(screen, "Home");
      await expectHomeLoaded(screen);
      await screen.getByText("View All").tap();
      await expect(screen.getByText("All Categories")).toBeVisible();
      await expect(screen.getByTestId("category-list-item")).toBeVisible();

      await screen.getByTestId("category-list-item").tap();

      const hasSubCategories = await screen
        .getByTestId("sub-category-list-item")
        .isVisible()
        .catch(() => false);

      if (hasSubCategories) {
        await screen.getByTestId("sub-category-list-item").tap();
      }

      await expect(screen.getByTestId("category-products-list")).toBeVisible();
      await screen.getByTestId("back-button").tap();
      await expect(screen.getByText("All Categories")).toBeVisible();
      await screen.getByTestId("back-button").tap();
      await expectHomeLoaded(screen);
    });

    await test.step("logout", async () => {
      await logout(screen);
    });
  });
});
