import type { Screen } from "@mobilewright/core";

/** Accept Android camera permission when the system dialog appears on launch. */
export async function acceptAndroidCameraPermission(screen: Screen) {
  const whileUsingApp = screen.getByText(/while using the app/i);

  try {
    await whileUsingApp.waitFor({ state: "visible", timeout: 10_000 });
    await whileUsingApp.tap();
  } catch {
    // Permission already granted or dialog not shown for this build.
  }
}
