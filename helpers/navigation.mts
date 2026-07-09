import type { Locator, Screen } from "@mobilewright/core";

export type TabName = "Home" | "Deals" | "Cart" | "Support" | "More";

/**
 * Match a bottom-tab caption. The app renders each tab label as a TextView, so
 * intersecting the exact text with the TextView type targets the caption while
 * excluding same-named icons — most importantly Android's system navigation
 * "Home" button (an ImageView), which would otherwise be tapped and send the
 * app to the background.
 */
function tabLabel(screen: Screen, name: TabName): Locator {
  return screen
    .getByText(name, { exact: true })
    .and(screen.getByType("android.widget.TextView"));
}

const TAB_LOCATORS: Record<TabName, (screen: Screen) => Locator[]> = {
  // "Home" deliberately avoids getByLabel: the OS nav bar exposes a "Home"
  // accessibility label that collides with the app's Home tab.
  Home: (screen) => [
    tabLabel(screen, "Home"),
    screen.getByRole("tab", { name: "Home" }),
  ],
  Deals: (screen) => [
    screen.getByLabel("Deals"),
    tabLabel(screen, "Deals"),
    screen.getByRole("tab", { name: "Deals" }),
  ],
  Cart: (screen) => [
    screen.getByLabel("Cart"),
    tabLabel(screen, "Cart"),
    screen.getByRole("tab", { name: "Cart" }),
  ],
  Support: (screen) => [
    screen.getByLabel("Support"),
    tabLabel(screen, "Support"),
    screen.getByRole("tab", { name: "Support" }),
  ],
  More: (screen) => [
    screen.getByLabel("More"),
    tabLabel(screen, "More"),
    screen.getByRole("tab", { name: "More" }),
  ],
};

export async function tapTab(screen: Screen, tab: TabName) {
  for (const locator of TAB_LOCATORS[tab](screen)) {
    try {
      await locator.waitFor({ state: "visible", timeout: 5_000 });
      await locator.tap();
      return;
    } catch {
      // Try the next fallback locator.
    }
  }

  throw new Error(`Tab "${tab}" not found`);
}

export async function navigateToTab(screen: Screen, tab: TabName) {
  await tapTab(screen, tab);
}

export async function navigateToHome(screen: Screen) {
  await navigateToTab(screen, "Home");
}

export async function openDrawer(screen: Screen) {
  await tapTab(screen, "More");
}

/** Re-open the side drawer via the bottom "More" tab after leaving a screen. */
export async function reopenDrawer(screen: Screen) {
  await openDrawer(screen);
}

/** Tap an entry inside the side navigation drawer by its visible label. */
export async function tapDrawerItem(screen: Screen, label: string) {
  const item = screen.getByText(label).first();
  await item.waitFor({ state: "visible", timeout: 5_000 });
  await item.tap();
}

/**
 * Select a side-drawer menu entry by its label.
 *
 * The logged-in drawer renders each label more than once: as the tappable
 * full-width menu row (a TextView ~687px wide, left-aligned at x≈78) and, for
 * some entries, as a narrow chip inside the top "recently viewed" card (which
 * routes elsewhere). A duplicate, off-screen copy of the whole drawer also
 * exists. Selecting purely by text would tap the wrong element, so we resolve
 * the on-screen full-width row by its geometry before tapping.
 */
export async function selectDrawerMenuItem(screen: Screen, label: string) {
  await screen
    .getByText(label, { exact: true })
    .first()
    .waitFor({ state: "visible", timeout: 10_000 });

  const row = await resolveDrawerRow(screen, label);
  await row.tap();
}

async function resolveDrawerRow(
  screen: Screen,
  label: string,
): Promise<Locator> {
  const matches = await screen.getByText(label, { exact: true }).all();

  // Preferred: an on-screen (x >= 0) full-width menu row. The ~687px width
  // excludes the narrow recently-viewed chips (< 300px) and the wider card /
  // row-container wrappers (> 750px).
  for (const match of matches) {
    const box = await match.boundingBox().catch(() => null);
    if (box && box.x >= 0 && box.width > 500 && box.width < 750) {
      return match;
    }
  }

  // Fallback for entries that have no recently-viewed duplicate.
  for (const match of matches) {
    const box = await match.boundingBox().catch(() => null);
    if (box && box.x >= 0) {
      return match;
    }
  }

  return screen.getByText(label, { exact: true }).first();
}

/**
 * Return to the authenticated Home root from a pushed drawer destination.
 * Drawer destinations are stacked screens with a back button and no bottom tab
 * bar, so step back (or fall back to the Home tab) until Home is shown again.
 */
export async function returnToHome(screen: Screen) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const atHome = await screen
      .getByTestId("recent-activities")
      .isVisible()
      .catch(() => false);
    if (atHome) return;

    const back = screen.getByTestId("back-button");
    if (await back.isVisible().catch(() => false)) {
      await back.tap();
    } else {
      await navigateToHome(screen).catch(() => {});
    }

    await screen
      .getByTestId("recent-activities")
      .waitFor({ state: "visible", timeout: 5_000 })
      .catch(() => {});
  }
}
