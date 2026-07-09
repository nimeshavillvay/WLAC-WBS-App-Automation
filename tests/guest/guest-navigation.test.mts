import { test } from "@mobilewright/test";

import { isGuest, logout } from "../../helpers/auth.mjs";
import { prepareApp } from "../../helpers/app-state.mjs";
import {
  navigateToHome,
  navigateToTab,
  openDrawer,
  tapDrawerItem,
} from "../../helpers/navigation.mjs";
import {
  assertAllCategoriesLoaded,
  assertDealsLoaded,
  assertEmptyCartLoaded,
  assertGuestHomeLoaded,
  assertQuickOrderLoaded,
  assertSideMenuItemsVisible,
  assertSignInScreenLoaded,
  assertSupportLoaded,
} from "../../helpers/screens.mjs";

// Guest side-navigation entries, in display order. For a guest session most
// entries are gated and route back to Home; "Quick Order" is the one item that
// opens a dedicated screen, so it is exercised as the representative deep flow.
const GUEST_MENU_ITEMS = [
  "Products",
  "My Account",
  "Quick Order",
  "Get Help",
  "FAQs",
  "Sign In",
] as const;

test.describe("Guest User - Verify Home Navigation and Side Menu", () => {
  test("navigates guest home, bottom tabs, and the side menu", async ({
    screen,
  }, testInfo) => {
    // The guest tour touches many screens on a real device; allow extra time.
    test.setTimeout(240_000);

    await test.step("start from a guest Home session", async () => {
      await prepareApp(screen, testInfo.project.name);

      // Resume-safe: when continuing an existing session we may start on a
      // sub-screen (e.g. Sign In). Step back until the guest Home is reachable.
      for (let attempt = 0; attempt < 3 && !(await isGuest(screen)); attempt += 1) {
        await screen.goBack();
        await screen
          .getByTestId("sign-in-home-page-button")
          .waitFor({ state: "visible", timeout: 5_000 })
          .catch(() => {});
      }

      // A prior test may have left an authenticated session; reset to guest.
      if (!(await isGuest(screen))) {
        await logout(screen);
      }

      await assertGuestHomeLoaded(screen);
    });

    await test.step("open All Categories from the View All button", async () => {
      await screen.getByText("View All").tap();
      await assertAllCategoriesLoaded(screen);
    });

    await test.step("return to the Home tab via bottom navigation", async () => {
      await navigateToHome(screen);
      await assertGuestHomeLoaded(screen);
    });

    await test.step("open the Deals tab and verify promotions", async () => {
      await navigateToTab(screen, "Deals");
      await assertDealsLoaded(screen);
    });

    await test.step("open the empty Cart and jump back to Deals", async () => {
      await navigateToTab(screen, "Cart");
      await assertEmptyCartLoaded(screen);

      await screen.getByText("Go to Deals").tap();
      await assertDealsLoaded(screen);
    });

    await test.step("open the Support tab and verify its sub-tabs", async () => {
      await navigateToTab(screen, "Support");
      await assertSupportLoaded(screen);
    });

    await test.step("open the side navigation drawer via the More tab", async () => {
      await openDrawer(screen);
      await assertSideMenuItemsVisible(screen, GUEST_MENU_ITEMS);
    });

    await test.step("open Quick Order from the side menu and return", async () => {
      await tapDrawerItem(screen, "Quick Order");
      await assertQuickOrderLoaded(screen);

      await screen.getByTestId("back-button").tap();
      await navigateToHome(screen);
      await assertGuestHomeLoaded(screen);
    });

    await test.step("open the Sign In screen from the side menu", async () => {
      await openDrawer(screen);
      // Home is mounted behind the drawer, so target the drawer's own (last)
      // Sign In entry rather than the home banner button.
      await screen.getByText("Sign In", { exact: true }).last().tap();
      await assertSignInScreenLoaded(screen);
    });
  });
});
