import { expect, test } from "@mobilewright/test";

import { getTestCredentials, isGuest, login, logout } from "../../helpers/auth.mjs";
import { prepareApp } from "../../helpers/app-state.mjs";
import {
  navigateToHome,
  navigateToTab,
  openDrawer,
  returnToHome,
  selectDrawerMenuItem,
} from "../../helpers/navigation.mjs";
import {
  assertAllCategoriesLoaded,
  assertCartLoaded,
  assertDealsLoaded,
  assertGuestHomeLoaded,
  assertLoggedInHomeLoaded,
  assertPageTitle,
  assertSupportLoaded,
  assertSupportMobileTabLoaded,
  assertSupportOrderTabLoaded,
} from "../../helpers/screens.mjs";

/**
 * Side-drawer entries exercised for an authenticated session, in display order,
 * paired with the exact title rendered on each destination screen.
 *
 * NOTE: the "My Purchases" drawer entry opens a screen titled "My Purchased
 * Items" — the title is asserted as it actually appears on the device rather than
 * the drawer label, so the assertion reflects real app behaviour.
 */
const SIDE_MENU_ITEMS: ReadonlyArray<{ label: string; title: string }> = [
  { label: "Woodworking and Shop Supplies", title: "Woodworking and Shop Supplies" },
  { label: "Woodworking Machinery", title: "Woodworking Machinery" },
  { label: "Metalworking Machinery", title: "Metalworking Machinery" },
  { label: "Recently Added", title: "Recently Added" },
  { label: "Order History", title: "Order History" },
  { label: "Shopping Lists", title: "Shopping Lists" },
  { label: "My Purchases", title: "My Purchased Items" },
  { label: "My Account", title: "My Account" },
  { label: "Quick Order", title: "Quick Order" },
];

test.describe("Logged-in User - Verify Navigation and Side Menu", () => {
  test("logs in, tours the bottom tabs, and verifies every side-menu screen", async ({
    screen,
  }, testInfo) => {
    // Login plus a full drawer tour touches many screens on a real device.
    test.setTimeout(600_000);

    await test.step("launch the app and land on a guest Home", async () => {
      await prepareApp(screen, testInfo.project.name);

      // Resume-safe: a continued session may start on a pushed sub-screen. Step
      // back only while a back button is present so we never background the app
      // by pressing Back on a root tab.
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const onSubScreen = await screen
          .getByTestId("back-button")
          .isVisible()
          .catch(() => false);
        if (!onSubScreen) break;
        await screen.goBack();
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // A prior session may have left us authenticated; reset to guest so the
      // Sign In flow below starts from a known state.
      if (!(await isGuest(screen))) {
        await logout(screen);
      }

      await assertGuestHomeLoaded(screen);
    });

    await test.step("sign in with the credentials from .env", async () => {
      const { email, password } = getTestCredentials();

      await screen.getByTestId("sign-in-home-page-button").tap();
      await login(screen, email, password);

      // login() already waits for the guest Sign In button to disappear; confirm
      // the authenticated Home is fully loaded before continuing.
      await navigateToHome(screen);
      await assertLoggedInHomeLoaded(screen);
    });

    await test.step("open All Categories from the View All button", async () => {
      await screen.getByText("View All").tap();
      await assertAllCategoriesLoaded(screen);
    });

    await test.step("return to the Home tab via bottom navigation", async () => {
      await navigateToHome(screen);
      await assertLoggedInHomeLoaded(screen);
    });

    await test.step("open the Deals tab and verify promotions", async () => {
      await navigateToTab(screen, "Deals");
      await assertDealsLoaded(screen);
    });

    await test.step("open the Cart and return to Deals", async () => {
      await navigateToTab(screen, "Cart");
      await assertCartLoaded(screen);

      // An empty cart exposes a "Go to Deals" shortcut; the test account's cart
      // holds items, so fall back to the Deals bottom tab when it is absent.
      const goToDeals = screen.getByText("Go to Deals");
      if (await goToDeals.isVisible().catch(() => false)) {
        await goToDeals.tap();
      } else {
        await navigateToTab(screen, "Deals");
      }
      await assertDealsLoaded(screen);
    });

    await test.step("open Support and switch between the Order and Mobile tabs", async () => {
      await navigateToTab(screen, "Support");
      await assertSupportLoaded(screen);

      // Order is the default sub-tab.
      await assertSupportOrderTabLoaded(screen);

      await screen.getByText("Mobile", { exact: true }).first().tap();
      await assertSupportMobileTabLoaded(screen);

      await screen.getByText("Order", { exact: true }).first().tap();
      await assertSupportOrderTabLoaded(screen);
    });

    await test.step("open the side navigation drawer via the More tab", async () => {
      await returnToHome(screen);
      await openDrawer(screen);
      // "Log Out" is only present in the authenticated drawer.
      await expect(screen.getByText("Log Out")).toBeVisible();
    });

    for (let index = 0; index < SIDE_MENU_ITEMS.length; index += 1) {
      const { label, title } = SIDE_MENU_ITEMS[index];
      await test.step(`side menu: "${label}" opens "${title}"`, async () => {
        await selectDrawerMenuItem(screen, label);
        await assertPageTitle(screen, title);

        await returnToHome(screen);
        // Re-open the drawer for the next entry only; leave it closed after the
        // last item so the final logout step starts from a known Home state.
        if (index < SIDE_MENU_ITEMS.length - 1) {
          await openDrawer(screen);
        }
      });
    }

    await test.step("log out and leave the app in a guest state", async () => {
      await returnToHome(screen);

      // Opens the More drawer, taps Log Out, and waits until the guest Sign In
      // button is visible again (explicit wait — no fixed delay).
      await logout(screen);

      await navigateToHome(screen);
      await assertGuestHomeLoaded(screen);

      // Confirm authenticated-only UI is gone so later tests start from guest.
      await expect(screen.getByTestId("recent-activities")).not.toBeVisible();
      expect(await isGuest(screen)).toBe(true);
    });
  });
});
