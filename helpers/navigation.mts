import type { Screen } from "@mobilewright/core";

export type TabName = "Home" | "Deals" | "Cart" | "Support" | "More";

const TAB_LOCATORS: Record<
  TabName,
  (screen: Screen) => ReturnType<Screen["getByLabel"]>[]
> = {
  Home: (screen) => [
    screen.getByRole("tab", { name: "Home" }),
    screen.getByLabel("Home"),
    screen.getByText("Home", { exact: true }),
  ],
  Deals: (screen) => [
    screen.getByRole("tab", { name: "Deals" }),
    screen.getByLabel("Deals"),
    screen.getByText("Deals", { exact: true }),
  ],
  Cart: (screen) => [
    screen.getByRole("tab", { name: "Cart" }),
    screen.getByLabel(/^Cart/i),
    screen.getByText("Cart", { exact: true }),
  ],
  Support: (screen) => [
    screen.getByRole("tab", { name: "Support" }),
    screen.getByLabel("Support"),
    screen.getByLabel(/help/i),
    screen.getByText("Support", { exact: true }),
  ],
  More: (screen) => [
    screen.getByRole("tab", { name: "More" }),
    screen.getByLabel("More"),
    screen.getByLabel(/menu/i),
    screen.getByText("More", { exact: true }),
  ],
};

export async function tapTab(screen: Screen, tab: TabName) {
  for (const locator of TAB_LOCATORS[tab](screen)) {
    if (await locator.isVisible().catch(() => false)) {
      await locator.tap();
      return;
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
