import { expect } from "@mobilewright/test";
import type { Screen } from "@mobilewright/core";

/**
 * Screen-level assertions kept separate from navigation actions so tests can
 * verify that a screen is fully loaded before interacting with it. Every
 * locator here was confirmed against the WurthLAC QA build's view hierarchy.
 */

export async function assertGuestHomeLoaded(screen: Screen) {
  await expect(screen.getByTestId("sign-in-home-page-button")).toBeVisible();
  await expect(screen.getByText("Top Categories")).toBeVisible();
}

/**
 * Confirm the authenticated Home is loaded. "Top Categories" is shown to guests
 * too, so we also assert the authenticated-only "recent-activities" section and
 * the absence of the guest "Sign In" home button.
 */
export async function assertLoggedInHomeLoaded(screen: Screen) {
  await expect(screen.getByText("Top Categories")).toBeVisible();
  await expect(screen.getByTestId("recent-activities")).toBeVisible();
  await expect(screen.getByTestId("sign-in-home-page-button")).not.toBeVisible();
}

export async function assertAllCategoriesLoaded(screen: Screen) {
  await expect(screen.getByText("All Categories")).toBeVisible();
  await expect(screen.getByTestId("category-list-item")).toBeVisible();
}

export async function assertDealsLoaded(screen: Screen) {
  await expect(screen.getByTestId("home-banners-list")).toBeVisible();
  await expect(screen.getByTestId("todays-special-product")).toBeVisible();
}

export async function assertEmptyCartLoaded(screen: Screen) {
  await expect(screen.getByText(/^Shopping Cart/)).toBeVisible();
  await expect(screen.getByText("Your cart is empty.")).toBeVisible();
  await expect(screen.getByText("Go to Deals")).toBeVisible();
}

/**
 * Cart screen loaded, regardless of whether it is empty or populated. The
 * "Shopping Cart" heading is present in both states (e.g. "Shopping Cart" or
 * "Shopping Cart (11 items)").
 */
export async function assertCartLoaded(screen: Screen) {
  await expect(screen.getByText(/^Shopping Cart/)).toBeVisible();
}

export async function assertSupportLoaded(screen: Screen) {
  await expect(screen.getByText("Customer Service and Support")).toBeVisible();
  await expect(screen.getByText("Order", { exact: true })).toBeVisible();
  await expect(screen.getByText("Mobile", { exact: true })).toBeVisible();
}

/** Support "Order" sub-tab content (customer-service contact details). */
export async function assertSupportOrderTabLoaded(screen: Screen) {
  await expect(screen.getByText("Customer Service and Support")).toBeVisible();
}

/** Support "Mobile" sub-tab content (mobile-app technical-support details). */
export async function assertSupportMobileTabLoaded(screen: Screen) {
  await expect(screen.getByText("Mobile App Technical Support")).toBeVisible();
}

/**
 * Assert that a pushed screen's page title exactly matches `title`. Kept generic
 * so every side-menu destination can be verified through one assertion. Throws a
 * descriptive error because the framework's `expect` has no message argument.
 */
export async function assertPageTitle(screen: Screen, title: string) {
  const heading = screen.getByText(title, { exact: true }).first();
  try {
    await expect(heading).toBeVisible();
  } catch {
    throw new Error(
      `Expected page title "${title}" to be visible after opening the menu item`,
    );
  }
}

/** Confirm the side navigation drawer exposes each expected menu entry. */
export async function assertSideMenuItemsVisible(
  screen: Screen,
  items: readonly string[],
) {
  for (const item of items) {
    await expect(screen.getByText(item, { exact: true }).first()).toBeVisible();
  }
}

export async function assertQuickOrderLoaded(screen: Screen) {
  await expect(screen.getByText("Quick Order")).toBeVisible();
  await expect(screen.getByTestId("back-button")).toBeVisible();
}

export async function assertSignInScreenLoaded(screen: Screen) {
  await expect(
    screen.getByText(/Sign in to your\s*WurthLAC account/),
  ).toBeVisible();
}
